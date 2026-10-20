import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, Send, Search, User as UserIcon, Check, CheckCheck,
  Circle, Sparkles, Paperclip, AlertCircle, ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { getSocket } from '../services/socket';
import { Conversation, Message } from '../types';

export const MessagingView: React.FC = () => {
  const { user, openAuthModal, activeConversationId, setActiveConversationId } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoadingConv, setIsLoadingConv] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    if (activeConversationId) {
      loadMessages(activeConversationId);
    }
  }, [activeConversationId]);

  // Socket.io real-time listeners
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !user) return;

    if (activeConversationId) {
      socket.emit('join_conversation', activeConversationId);
    }

    const handleNewMessage = (newMsg: Message) => {
      if (newMsg.conversation_id === activeConversationId) {
        setMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        scrollToBottom();
      }
      // Update conversation list preview
      setConversations(prev => prev.map(c => {
        if (c.id === newMsg.conversation_id) {
          return {
            ...c,
            last_message: {
              id: newMsg.id,
              content: newMsg.content,
              sender_id: newMsg.sender_id,
              created_at: newMsg.created_at,
              is_read: true
            },
            updated_at: newMsg.created_at
          };
        }
        return c;
      }));
    };

    const handleUserTyping = ({ convId, userId, isTyping: typingState }: any) => {
      if (convId === activeConversationId && userId !== user.id) {
        setOtherUserTyping(typingState);
      }
    };

    const handleConvUpdated = ({ convId, lastMessage }: any) => {
      setConversations(prev => prev.map(c => {
        if (c.id === convId) {
          return {
            ...c,
            last_message: lastMessage,
            updated_at: lastMessage.created_at,
            unread_count: (c.unread_count || 0) + (c.id === activeConversationId ? 0 : 1)
          };
        }
        return c;
      }));
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('conversation_updated', handleConvUpdated);

    return () => {
      if (activeConversationId) {
        socket.emit('leave_conversation', activeConversationId);
      }
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('conversation_updated', handleConvUpdated);
    };
  }, [activeConversationId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, otherUserTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    setIsLoadingConv(true);
    try {
      const res = await api.messaging.listConversations();
      setConversations(res.conversations);
      if (!activeConversationId && res.conversations.length > 0) {
        setActiveConversationId(res.conversations[0].id);
      }
    } catch (_err) {
    } finally {
      setIsLoadingConv(false);
    }
  };

  const loadMessages = async (convId: string) => {
    setIsLoadingMessages(true);
    try {
      const res = await api.messaging.getMessages(convId);
      setMessages(res.messages);
      // Mark unread to 0 in local state
      setConversations(prev => prev.map(c => c.id === convId ? { ...c, unread_count: 0 } : c));
    } catch (_err) {
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    const socket = getSocket();
    if (socket && activeConversationId) {
      if (!isTyping) {
        setIsTyping(true);
        socket.emit('typing', { convId: activeConversationId, isTyping: true });
      }
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        socket.emit('typing', { convId: activeConversationId, isTyping: false });
      }, 2000);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversationId || !user) return;

    const content = inputText.trim();
    setInputText('');

    // Emit typing off
    const socket = getSocket();
    if (socket) {
      socket.emit('typing', { convId: activeConversationId, isTyping: false });
    }

    try {
      // Send message via REST API
      const res = await api.messaging.sendMessage(activeConversationId, content);
      setMessages(prev => {
        if (prev.some(m => m.id === res.message.id)) return prev;
        return [...prev, res.message];
      });
      scrollToBottom();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!user) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
        <MessageSquare className="w-12 h-12 text-blue-700 mx-auto" />
        <h2 className="text-base font-bold text-slate-900">Messagerie Privée Sécurisée</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Connectez-vous pour échanger instantanément avec les autres étudiants et candidats aux bourses d'études.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-5 py-2.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-xs"
        >
          Se connecter pour accéder aux messages
        </button>
      </div>
    );
  }

  const activeConv = conversations.find(c => c.id === activeConversationId);
  const filteredConversations = conversations.filter(c => {
    if (!searchFilter.trim()) return true;
    const name = c.recipient ? `${c.recipient.first_name} ${c.recipient.last_name}` : c.title || '';
    return name.toLowerCase().includes(searchFilter.toLowerCase());
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden h-[calc(100vh-140px)] min-h-[500px] flex flex-col md:flex-row">
      
      {/* Left List of Conversations */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col ${
        activeConversationId ? 'hidden md:flex' : 'flex'
      }`}>
        <div className="p-3.5 border-b border-slate-100 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Discussions</h2>
            <span className="text-[11px] text-blue-700 font-semibold">{conversations.length} fil(s)</span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Rechercher une conversation..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {isLoadingConv ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map(n => (
                <div key={n} className="flex gap-3 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="w-24 h-3 bg-slate-200 rounded" />
                    <div className="w-36 h-2.5 bg-slate-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 space-y-1">
              <p>Aucune conversation trouvée.</p>
              <p className="text-[11px]">Consultez l'annuaire pour contacter un camarade.</p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = conv.id === activeConversationId;
              const title = conv.recipient
                ? `${conv.recipient.first_name} ${conv.recipient.last_name}`
                : conv.title || 'Discussion de groupe';
              const avatar = conv.recipient?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80';

              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50/70 border-l-4 border-blue-700' : 'hover:bg-slate-50'
                  }`}
                >
                  <img
                    src={avatar}
                    alt=""
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-slate-900 truncate">{title}</span>
                      {conv.last_message && (
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {new Date(conv.last_message.created_at).toLocaleDateString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {conv.last_message?.content || 'Nouvelle conversation'}
                    </p>

                    {conv.recipient && (
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {conv.recipient.institution?.split('-')[0]?.trim()}
                      </p>
                    )}
                  </div>

                  {conv.unread_count && conv.unread_count > 0 ? (
                    <span className="px-1.5 py-0.2 bg-blue-700 text-white font-bold text-[10px] rounded-full shrink-0">
                      {conv.unread_count}
                    </span>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Chat Thread Window */}
      <div className={`flex-1 flex flex-col ${
        !activeConversationId ? 'hidden md:flex' : 'flex'
      }`}>
        {activeConv ? (
          <>
            {/* Thread Header */}
            <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveConversationId(null)}
                  className="md:hidden p-1.5 text-slate-600 hover:bg-slate-200 rounded-lg"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <img
                  src={activeConv.recipient?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
                  alt=""
                  className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div>
                  <h3 className="text-xs font-bold text-slate-900 leading-tight">
                    {activeConv.recipient
                      ? `${activeConv.recipient.first_name} ${activeConv.recipient.last_name}`
                      : activeConv.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-none mt-0.5">
                    {activeConv.recipient?.field_of_study || 'En direct via Socket.io'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
                <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500 animate-pulse" />
                <span>En ligne</span>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
              {isLoadingMessages ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  Chargement des messages...
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400 space-y-1">
                  <p>Aucun message dans cette conversation.</p>
                  <p>Saluez votre camarade pour initier l'échange !</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.sender_id === user.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                        isMine
                          ? 'bg-blue-700 text-white rounded-br-xs'
                          : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs'
                      }`}>
                        <p className="whitespace-pre-line break-words">{msg.content}</p>
                        <div className={`mt-1 text-[10px] flex items-center justify-end gap-1 ${
                          isMine ? 'text-blue-200' : 'text-slate-400'
                        }`}>
                          <span>
                            {new Date(msg.created_at).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {isMine && <CheckCheck className="w-3 h-3 text-blue-200" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Typing indicator */}
              {otherUserTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-2xl text-[11px] text-slate-500 italic flex items-center gap-1.5 shadow-xs">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" />
                    <span>L'interlocuteur est en train d'écrire...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={handleInputChange}
                placeholder="Votre message instantané..."
                className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
              />

              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-40 text-white rounded-xl shadow-xs transition-colors shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-2">
            <MessageSquare className="w-10 h-10 text-slate-300" />
            <p className="text-sm font-bold text-slate-700">Sélectionnez une discussion</p>
            <p className="text-xs max-w-sm">
              Choisissez un échange dans la colonne de gauche ou lancez une nouvelle conversation depuis l'annuaire.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
