import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { query, queryOne } from './db.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'campushub-africa-secret-key-2026-secure';

export function setupSocketIO(httpServer: HttpServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  // Socket Authentication middleware
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (!token || typeof token !== 'string') {
      return next(new Error('Authentification requise pour Socket.io'));
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) return next(new Error('Jeton invalide'));
      (socket as any).user = decoded;
      next();
    });
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    if (!user || !user.id) return;

    // Join personal room for notifications and direct events
    socket.join(`user:${user.id}`);

    // Join active conversation room
    socket.on('join_conversation', (convId: string) => {
      if (convId) {
        socket.join(`conv:${convId}`);
      }
    });

    socket.on('leave_conversation', (convId: string) => {
      if (convId) {
        socket.leave(`conv:${convId}`);
      }
    });

    // Typing indicators
    socket.on('typing', ({ convId, isTyping }: { convId: string; isTyping: boolean }) => {
      if (convId) {
        socket.to(`conv:${convId}`).emit('user_typing', {
          convId,
          userId: user.id,
          isTyping
        });
      }
    });

    // Real-time message sending
    socket.on('send_message', async ({ convId, content, attachments = [] }, callback) => {
      try {
        if (!content || !content.trim()) {
          if (callback) callback({ error: 'Message vide' });
          return;
        }

        // Verify participation
        const participant = await queryOne(
          'SELECT id FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2',
          [convId, user.id]
        );

        if (!participant) {
          if (callback) callback({ error: 'Non autorisé' });
          return;
        }

        const msgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        await query(`
          INSERT INTO messages (id, conversation_id, sender_id, content, attachments)
          VALUES ($1, $2, $3, $4, $5)
        `, [msgId, convId, user.id, content.trim(), JSON.stringify(attachments)]);

        await query('UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [convId]);
        await query('UPDATE conversation_participants SET last_read_at = CURRENT_TIMESTAMP WHERE conversation_id = $1 AND user_id = $2', [convId, user.id]);

        const fullMsg = await queryOne(`
          SELECT
            m.*,
            sp.first_name as sender_first_name, sp.last_name as sender_last_name,
            sp.avatar_url as sender_avatar
          FROM messages m
          JOIN student_profiles sp ON sp.user_id = m.sender_id
          WHERE m.id = $1
        `, [msgId]);

        const formatted = {
          ...fullMsg,
          attachments: JSON.parse(fullMsg.attachments || '[]')
        };

        // Broadcast to everyone in the conversation
        io.to(`conv:${convId}`).emit('new_message', formatted);

        // Notify other participants in their private rooms
        const otherParticipants = await query(
          'SELECT user_id FROM conversation_participants WHERE conversation_id = $1 AND user_id != $2',
          [convId, user.id]
        );

        for (const p of otherParticipants) {
          io.to(`user:${p.user_id}`).emit('conversation_updated', {
            convId,
            lastMessage: formatted
          });
        }

        if (callback) callback({ success: true, message: formatted });
      } catch (err: any) {
        console.error('Socket message error:', err);
        if (callback) callback({ error: 'Erreur lors de l\'envoi du message' });
      }
    });

    socket.on('disconnect', () => {
      // Clean up
    });
  });

  return io;
}
