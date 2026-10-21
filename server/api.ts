import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, queryOne } from './db.ts';
import {
  AFRICAN_ACADEMIC_DIRECTORY,
  getAllAfricanCountries,
  getCitiesByCountry,
  getUniversitiesByCountry
} from '../src/data/africanDirectory.ts';

export const apiRouter = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'campushub-africa-secret-key-2026-secure';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'STUDENT' | 'MODERATOR' | 'ADMIN';
  };
}

// Auth Middleware
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Accès non autorisé. Veuillez vous connecter.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Session expirée ou jeton invalide. Veuillez vous reconnecter.' });
    }
    req.user = user as any;
    next();
  });
}

// Optional Auth (for public feed / directory)
export function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return next();
  }
  jwt.verify(token, JWT_SECRET, (_err, user) => {
    if (user) {
      req.user = user as any;
    }
    next();
  });
}

// Admin / Moderator guard
export function requireRole(allowedRoles: ('ADMIN' | 'MODERATOR')[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role as any)) {
      return res.status(403).json({ error: 'Action réservée aux administrateurs ou modérateurs.' });
    }
    next();
  };
}

/* ==========================================================================
   1. REFERENCE DATA
   ========================================================================== */
apiRouter.get('/reference/options', async (_req, res) => {
  const [usersCount, oppsCount, resCount] = await Promise.all([
    queryOne<{ count: string }>('SELECT COUNT(*) as count FROM users WHERE role = $1', ['STUDENT']).catch(() => ({ count: '0' })),
    queryOne<{ count: string }>('SELECT COUNT(*) as count FROM opportunities WHERE status = $1', ['OPEN']).catch(() => ({ count: '0' })),
    queryOne<{ count: string }>('SELECT COUNT(*) as count FROM resources').catch(() => ({ count: '0' }))
  ]);

  res.json({
    stats: {
      totalUsers: parseInt(usersCount?.count || '0', 10),
      totalOpportunities: parseInt(oppsCount?.count || '0', 10),
      totalResources: parseInt(resCount?.count || '0', 10)
    },
    countries: getAllAfricanCountries(),
    directory: AFRICAN_ACADEMIC_DIRECTORY,
    institutions: getUniversitiesByCountry('Sénégal'),
    fieldsOfStudy: [
      'Informatique & Génie Logiciel',
      'Intelligence Artificielle & Data Science',
      'Sciences Économiques & Gestion',
      'Droit & Sciences Politiques',
      'Médecine & Sciences de la Santé',
      'Pharmacie & Biologie Médicale',
      'Génie Civil & Architecture',
      'Télécommunications & Réseaux',
      'Agronomie & Agroalimentaire',
      'Mathématiques & Physique',
      'Communication, Médias & Journalisme',
      'Langues, Lettres & Sciences Humaines',
      'Énergies Renouvelables & Environnement'
    ],
    academicLevels: [
      'Licence 1 (L1)',
      'Licence 2 (L2)',
      'Licence 3 (L3)',
      'Master 1 (M1)',
      'Master 2 (M2)',
      'Doctorat / PhD',
      'Cycle Ingénieur',
      'Classe Préparatoire',
      'Alumni / Diplômé'
    ],
    opportunityCategories: [
      { id: 'SCHOLARSHIP_INTL', label: 'Bourse Internationale' },
      { id: 'SCHOLARSHIP_NATL', label: 'Bourse Nationale' },
      { id: 'INTERNSHIP', label: 'Stage Académique / Professionnel' },
      { id: 'JOB', label: 'Premier Emploi / Alternance' },
      { id: 'EXCHANGE', label: 'Mobilité & Échange Universitaire' },
      { id: 'CONTEST', label: 'Concours & Hackathon' },
      { id: 'TRAINING', label: 'Formation Certifiante' },
      { id: 'HOUSING', label: 'Logement Étudiant' }
    ],
    resourceCategories: [
      { id: 'COURSE', label: 'Polycopié de Cours' },
      { id: 'TUTORIAL_TD', label: 'Travaux Dirigés (TD)' },
      { id: 'PRACTICAL_TP', label: 'Travaux Pratiques (TP)' },
      { id: 'EXAM', label: 'Sujet d\'Examen' },
      { id: 'EXAM_SOLUTION', label: 'Annales & Corrigés Détaillés' },
      { id: 'THESIS', label: 'Mémoire / Thèse Exemplaire' },
      { id: 'METHOD_GUIDE', label: 'Guide Méthodologique' }
    ]
  });
});

apiRouter.get('/reference/cities', (req, res) => {
  const country = String(req.query.country || '');
  res.json({ cities: getCitiesByCountry(country) });
});

apiRouter.get('/reference/universities', (req, res) => {
  const country = String(req.query.country || '');
  res.json({ universities: getUniversitiesByCountry(country) });
});

/* ==========================================================================
   2. AUTHENTICATION & SESSIONS
   ========================================================================== */
apiRouter.post('/auth/register', async (req, res) => {
  try {
    const {
      firstName, lastName, email, password, confirmPassword,
      country, city, institution, fieldOfStudy, academicLevel,
      graduationYear, termsAccepted
    } = req.body;

    if (!termsAccepted) {
      return res.status(400).json({ error: 'Vous devez accepter les conditions d\'utilisation.' });
    }

    if (!firstName || !lastName || !email || !password || !country || !institution || !fieldOfStudy || !academicLevel) {
      return res.status(400).json({ error: 'Veuillez remplir tous les champs obligatoires du formulaire.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Les deux mots de passe ne correspondent pas.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit comporter au moins 6 caractères.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await queryOne('SELECT id FROM users WHERE email = $1', [cleanEmail]);
    if (existing) {
      return res.status(409).json({ error: 'Un compte avec cette adresse e-mail existe déjà.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const profileId = `prof_${userId}`;

    await query(`
      INSERT INTO users (id, email, password_hash, role, status, email_verified)
      VALUES ($1, $2, $3, 'STUDENT', 'ACTIVE', TRUE)
    `, [userId, cleanEmail, passwordHash]);

    // Initial default avatar based on gender/initials
    const defaultAvatar = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80`;

    await query(`
      INSERT INTO student_profiles (
        id, user_id, first_name, last_name, headline, bio, avatar_url,
        country, city, institution, field_of_study, academic_level,
        graduation_year, interests, skills, languages
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    `, [
      profileId, userId, firstName.trim(), lastName.trim(),
      `Étudiant en ${fieldOfStudy} (${academicLevel})`,
      `Étudiant motivé à ${institution}. Ravi de rejoindre la communauté CampusHub Africa !`,
      defaultAvatar, country, city || '', institution, fieldOfStudy,
      academicLevel, graduationYear ? parseInt(graduationYear, 10) : new Date().getFullYear() + 2,
      JSON.stringify(['Entraide Académique', 'Opportunités']),
      JSON.stringify(['Travail en équipe']),
      JSON.stringify(['Français'])
    ]);

    // Welcome Notification
    await query(`
      INSERT INTO notifications (id, user_id, actor_id, type, title, message, link)
      VALUES ($1, $2, $3, 'SYSTEM', 'Bienvenue sur CampusHub Africa !', 'Votre compte a été créé avec succès. Complétez votre profil académique et découvrez les opportunités.', '/profile')
    `, [`notif_${Date.now()}`, userId, userId]);

    const token = jwt.sign({ id: userId, email: cleanEmail, role: 'STUDENT' }, JWT_SECRET, { expiresIn: '7d' });
    const profile = await queryOne('SELECT * FROM student_profiles WHERE user_id = $1', [userId]);

    res.status(201).json({
      message: 'Compte créé avec succès !',
      token,
      user: {
        id: userId,
        email: cleanEmail,
        role: 'STUDENT',
        status: 'ACTIVE',
        profile: {
          ...profile,
          interests: JSON.parse(profile.interests || '[]'),
          skills: JSON.parse(profile.skills || '[]'),
          languages: JSON.parse(profile.languages || '[]')
        }
      }
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Erreur lors de la création du compte. Veuillez réessayer.' });
  }
});

apiRouter.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Veuillez saisir votre adresse e-mail et votre mot de passe.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await queryOne('SELECT * FROM users WHERE email = $1', [cleanEmail]);
    if (!user) {
      return res.status(401).json({ error: 'Adresse e-mail ou mot de passe incorrect.' });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({ error: 'Ce compte a été temporairement suspendu par un modérateur.' });
    }

    if (user.status === 'BANNED') {
      return res.status(403).json({ error: 'Ce compte a été définitivement désactivé.' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Adresse e-mail ou mot de passe incorrect.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const profile = await queryOne('SELECT * FROM student_profiles WHERE user_id = $1', [user.id]);

    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        profile: profile ? {
          ...profile,
          interests: JSON.parse(profile.interests || '[]'),
          skills: JSON.parse(profile.skills || '[]'),
          languages: JSON.parse(profile.languages || '[]')
        } : null
      }
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Erreur lors de la connexion. Veuillez réessayer.' });
  }
});

apiRouter.get('/auth/me', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const user = await queryOne('SELECT id, email, role, status, created_at FROM users WHERE id = $1', [userId]);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable.' });
    }

    const profile = await queryOne('SELECT * FROM student_profiles WHERE user_id = $1', [userId]);
    const postsCount = (await queryOne('SELECT COUNT(*) as c FROM posts WHERE author_id = $1', [userId]))?.c || 0;
    const resourcesCount = (await queryOne('SELECT COUNT(*) as c FROM resources WHERE uploader_id = $1', [userId]))?.c || 0;
    const unreadNotifs = (await queryOne('SELECT COUNT(*) as c FROM notifications WHERE user_id = $1 AND is_read = FALSE', [userId]))?.c || 0;
    const unreadMessages = (await queryOne(`
      SELECT COUNT(m.id) as c
      FROM messages m
      JOIN conversation_participants cp ON cp.conversation_id = m.conversation_id
      WHERE cp.user_id = $1 AND m.sender_id != $1 AND m.is_read = FALSE
    `, [userId]))?.c || 0;

    res.json({
      user: {
        ...user,
        stats: {
          postsCount: parseInt(postsCount, 10),
          resourcesCount: parseInt(resourcesCount, 10),
          unreadNotifs: parseInt(unreadNotifs, 10),
          unreadMessages: parseInt(unreadMessages, 10),
        },
        profile: profile ? {
          ...profile,
          interests: JSON.parse(profile.interests || '[]'),
          skills: JSON.parse(profile.skills || '[]'),
          languages: JSON.parse(profile.languages || '[]')
        } : null
      }
    });
  } catch (err: any) {
    console.error('Auth me error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

apiRouter.post('/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Veuillez saisir votre adresse e-mail.' });
  }
  const cleanEmail = email.trim().toLowerCase();
  const user = await queryOne('SELECT id FROM users WHERE email = $1', [cleanEmail]);
  if (!user) {
    // Return friendly generic response for security
    return res.json({ message: 'Si cette adresse existe, un lien de réinitialisation sécurisé vous a été transmis.' });
  }

  // Create temporary reset token
  const resetToken = jwt.sign({ id: user.id, purpose: 'pwd_reset' }, JWT_SECRET, { expiresIn: '1h' });
  res.json({
    message: 'Lien de réinitialisation généré avec succès.',
    devResetToken: resetToken // Provided for smooth testing
  });
});

apiRouter.post('/auth/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Nouveau mot de passe invalide (minimum 6 caractères requis).' });
  }

  try {
    const payload: any = jwt.verify(token, JWT_SECRET);
    if (payload.purpose !== 'pwd_reset') {
      return res.status(400).json({ error: 'Jeton de réinitialisation invalide.' });
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashed, payload.id]);
    res.json({ message: 'Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.' });
  } catch (_e) {
    res.status(400).json({ error: 'Le lien de réinitialisation est expiré ou invalide.' });
  }
});

/* ==========================================================================
   3. STUDENT PROFILES & DIRECTORY (ANNUAIRE ACADÉMIQUE)
   ========================================================================== */
apiRouter.put('/users/profile', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const {
      firstName, lastName, headline, bio, avatarUrl, coverUrl,
      country, city, institution, faculty, fieldOfStudy,
      academicLevel, graduationYear, interests, skills, languages,
      linkedinUrl, githubUrl, portfolioUrl, isPublic
    } = req.body;

    await query(`
      UPDATE student_profiles SET
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        headline = COALESCE($3, headline),
        bio = COALESCE($4, bio),
        avatar_url = COALESCE($5, avatar_url),
        cover_url = COALESCE($6, cover_url),
        country = COALESCE($7, country),
        city = COALESCE($8, city),
        institution = COALESCE($9, institution),
        faculty = COALESCE($10, faculty),
        field_of_study = COALESCE($11, field_of_study),
        academic_level = COALESCE($12, academic_level),
        graduation_year = COALESCE($13, graduation_year),
        interests = COALESCE($14, interests),
        skills = COALESCE($15, skills),
        languages = COALESCE($16, languages),
        linkedin_url = COALESCE($17, linkedin_url),
        github_url = COALESCE($18, github_url),
        portfolio_url = COALESCE($19, portfolio_url),
        is_public = COALESCE($20, is_public),
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $21
    `, [
      firstName, lastName, headline, bio, avatarUrl, coverUrl,
      country, city, institution, faculty, fieldOfStudy,
      academicLevel, graduationYear ? parseInt(graduationYear, 10) : null,
      interests ? JSON.stringify(interests) : null,
      skills ? JSON.stringify(skills) : null,
      languages ? JSON.stringify(languages) : null,
      linkedinUrl, githubUrl, portfolioUrl, isPublic,
      userId
    ]);

    const updated = await queryOne('SELECT * FROM student_profiles WHERE user_id = $1', [userId]);
    res.json({
      message: 'Profil mis à jour avec succès.',
      profile: {
        ...updated,
        interests: JSON.parse(updated.interests || '[]'),
        skills: JSON.parse(updated.skills || '[]'),
        languages: JSON.parse(updated.languages || '[]')
      }
    });
  } catch (err: any) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du profil.' });
  }
});

// View public profile by user ID
apiRouter.get('/users/:id', optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const targetUserId = req.params.id;
    const user = await queryOne('SELECT id, role, created_at, status FROM users WHERE id = $1', [targetUserId]);
    if (!user || user.status === 'BANNED') {
      return res.status(404).json({ error: 'Étudiant introuvable.' });
    }

    const profile = await queryOne('SELECT * FROM student_profiles WHERE user_id = $1', [targetUserId]);
    if (!profile) {
      return res.status(404).json({ error: 'Profil introuvable.' });
    }

    // Get their recent posts
    const posts = await query(`
      SELECT p.*,
        sp.first_name, sp.last_name, sp.avatar_url, sp.institution, sp.field_of_study
      FROM posts p
      JOIN student_profiles sp ON sp.user_id = p.author_id
      WHERE p.author_id = $1
      ORDER BY p.created_at DESC
      LIMIT 10
    `, [targetUserId]);

    // Get their shared resources
    const resources = await query(`
      SELECT * FROM resources WHERE uploader_id = $1 ORDER BY created_at DESC LIMIT 10
    `, [targetUserId]);

    res.json({
      student: {
        id: user.id,
        role: user.role,
        memberSince: user.created_at,
        profile: {
          ...profile,
          interests: JSON.parse(profile.interests || '[]'),
          skills: JSON.parse(profile.skills || '[]'),
          languages: JSON.parse(profile.languages || '[]')
        },
        posts: posts.map(p => ({
          ...p,
          attachments: JSON.parse(p.attachments || '[]')
        })),
        resources
      }
    });
  } catch (err: any) {
    console.error('Get user profile error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// Directory: Search & Filter Students
apiRouter.get('/directory', optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { search, country, institution, fieldOfStudy, academicLevel, page = '1', limit = '12' } = req.query;
    const offset = (Math.max(1, parseInt(page as string, 10)) - 1) * parseInt(limit as string, 10);
    const params: any[] = [];
    let whereClauses = ["u.status = 'ACTIVE'", 'sp.is_public = TRUE'];

    if (search) {
      params.push(`%${search}%`);
      whereClauses.push(`(
        sp.first_name ILIKE $${params.length} OR
        sp.last_name ILIKE $${params.length} OR
        sp.headline ILIKE $${params.length} OR
        sp.bio ILIKE $${params.length}
      )`);
    }

    if (country) {
      params.push(country);
      whereClauses.push(`sp.country = $${params.length}`);
    }

    if (institution) {
      params.push(institution);
      whereClauses.push(`sp.institution = $${params.length}`);
    }

    if (fieldOfStudy) {
      params.push(fieldOfStudy);
      whereClauses.push(`sp.field_of_study = $${params.length}`);
    }

    if (academicLevel) {
      params.push(academicLevel);
      whereClauses.push(`sp.academic_level = $${params.length}`);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countRes = await query(`
      SELECT COUNT(*) as c
      FROM users u
      JOIN student_profiles sp ON sp.user_id = u.id
      ${whereSql}
    `, params);
    const total = parseInt(countRes[0]?.c || '0', 10);

    const queryParams = [...params, parseInt(limit as string, 10), offset];
    const students = await query(`
      SELECT
        u.id, u.role, u.created_at,
        sp.first_name, sp.last_name, sp.headline, sp.avatar_url,
        sp.country, sp.city, sp.institution, sp.field_of_study,
        sp.academic_level, sp.graduation_year, sp.skills, sp.interests
      FROM users u
      JOIN student_profiles sp ON sp.user_id = u.id
      ${whereSql}
      ORDER BY sp.first_name ASC
      LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}
    `, queryParams);

    res.json({
      total,
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
      students: students.map(s => ({
        ...s,
        skills: JSON.parse(s.skills || '[]'),
        interests: JSON.parse(s.interests || '[]')
      }))
    });
  } catch (err: any) {
    console.error('Directory error:', err);
    res.status(500).json({ error: 'Erreur lors de la recherche des étudiants.' });
  }
});

/* ==========================================================================
   4. SOCIAL FEED (PUBLICATIONS, APPRÉCIATIONS, COMMENTAIRES, FAVORIS)
   ========================================================================== */
apiRouter.get('/posts', optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const currentUserId = req.user?.id;
    const { category, search, savedOnly, page = '1', limit = '10' } = req.query;
    const offset = (Math.max(1, parseInt(page as string, 10)) - 1) * parseInt(limit as string, 10);
    const params: any[] = [];
    let whereClauses: string[] = [];

    if (category && category !== 'ALL') {
      params.push(category);
      whereClauses.push(`p.category = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      whereClauses.push(`p.content ILIKE $${params.length}`);
    }

    if (savedOnly === 'true' && currentUserId) {
      params.push(currentUserId);
      whereClauses.push(`p.id IN (SELECT post_id FROM saved_posts WHERE user_id = $${params.length})`);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countRes = await query(`SELECT COUNT(*) as c FROM posts p ${whereSql}`, params);
    const total = parseInt(countRes[0]?.c || '0', 10);

    const queryParams = [...params, parseInt(limit as string, 10), offset];
    const posts = await query(`
      SELECT
        p.*,
        sp.first_name, sp.last_name, sp.avatar_url, sp.institution,
        sp.field_of_study, sp.academic_level, sp.headline, u.role as author_role
      FROM posts p
      JOIN users u ON u.id = p.author_id
      JOIN student_profiles sp ON sp.user_id = p.author_id
      ${whereSql}
      ORDER BY p.is_pinned DESC, p.created_at DESC
      LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}
    `, queryParams);

    // If authenticated, check if current user liked/saved each post
    let userLikes: Set<string> = new Set();
    let userSaves: Set<string> = new Set();
    if (currentUserId && posts.length > 0) {
      const postIds = posts.map(p => p.id);
      const likes = await query(`
        SELECT post_id FROM post_likes WHERE user_id = $1 AND post_id = ANY($2)
      `, [currentUserId, postIds]);
      likes.forEach(l => userLikes.add(l.post_id));

      const saves = await query(`
        SELECT post_id FROM saved_posts WHERE user_id = $1 AND post_id = ANY($2)
      `, [currentUserId, postIds]);
      saves.forEach(s => userSaves.add(s.post_id));
    }

    res.json({
      total,
      page: parseInt(page as string, 10),
      posts: posts.map(p => ({
        ...p,
        attachments: JSON.parse(p.attachments || '[]'),
        isLiked: userLikes.has(p.id),
        isSaved: userSaves.has(p.id)
      }))
    });
  } catch (err: any) {
    console.error('Feed posts error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des publications.' });
  }
});

apiRouter.post('/posts', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { content, category = 'GENERAL', attachments = [] } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Le contenu de la publication ne peut pas être vide.' });
    }

    const postId = `post_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await query(`
      INSERT INTO posts (id, author_id, content, category, attachments)
      VALUES ($1, $2, $3, $4, $5)
    `, [postId, userId, content.trim(), category, JSON.stringify(attachments)]);

    const post = await queryOne(`
      SELECT
        p.*,
        sp.first_name, sp.last_name, sp.avatar_url, sp.institution,
        sp.field_of_study, sp.academic_level, sp.headline, u.role as author_role
      FROM posts p
      JOIN users u ON u.id = p.author_id
      JOIN student_profiles sp ON sp.user_id = p.author_id
      WHERE p.id = $1
    `, [postId]);

    res.status(201).json({
      message: 'Publication publiée avec succès !',
      post: {
        ...post,
        attachments: JSON.parse(post.attachments || '[]'),
        isLiked: false,
        isSaved: false
      }
    });
  } catch (err: any) {
    console.error('Create post error:', err);
    res.status(500).json({ error: 'Erreur lors de la publication.' });
  }
});

apiRouter.delete('/posts/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const post = await queryOne('SELECT author_id FROM posts WHERE id = $1', [postId]);
    if (!post) {
      return res.status(404).json({ error: 'Publication introuvable.' });
    }

    if (post.author_id !== userId && userRole !== 'ADMIN' && userRole !== 'MODERATOR') {
      return res.status(403).json({ error: 'Vous ne pouvez pas supprimer cette publication.' });
    }

    await query('DELETE FROM posts WHERE id = $1', [postId]);
    res.json({ message: 'Publication supprimée avec succès.' });
  } catch (err: any) {
    console.error('Delete post error:', err);
    res.status(500).json({ error: 'Erreur lors de la suppression.' });
  }
});

// Like / Unlike post
apiRouter.post('/posts/:id/like', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user!.id;

    const existing = await queryOne('SELECT id FROM post_likes WHERE post_id = $1 AND user_id = $2', [postId, userId]);
    let liked = false;

    if (existing) {
      await query('DELETE FROM post_likes WHERE id = $1', [existing.id]);
      await query('UPDATE posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = $1', [postId]);
      liked = false;
    } else {
      const likeId = `pl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      await query('INSERT INTO post_likes (id, post_id, user_id) VALUES ($1, $2, $3)', [likeId, postId, userId]);
      await query('UPDATE posts SET likes_count = likes_count + 1 WHERE id = $1', [postId]);
      liked = true;

      // Notify author
      const post = await queryOne('SELECT author_id FROM posts WHERE id = $1', [postId]);
      if (post && post.author_id !== userId) {
        const actor = await queryOne('SELECT first_name, last_name FROM student_profiles WHERE user_id = $1', [userId]);
        await query(`
          INSERT INTO notifications (id, user_id, actor_id, type, title, message, link)
          VALUES ($1, $2, $3, 'LIKE', 'Nouvelle mention J''aime', $4, $5)
        `, [
          `notif_${Date.now()}`, post.author_id, userId,
          `${actor?.first_name} ${actor?.last_name} a aimé votre publication.`,
          `/posts/${postId}`
        ]);
      }
    }

    const post = await queryOne('SELECT likes_count FROM posts WHERE id = $1', [postId]);
    res.json({ liked, likesCount: post?.likes_count || 0 });
  } catch (err: any) {
    console.error('Like error:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour.' });
  }
});

// Bookmark / Unbookmark
apiRouter.post('/posts/:id/bookmark', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user!.id;

    const existing = await queryOne('SELECT id FROM saved_posts WHERE post_id = $1 AND user_id = $2', [postId, userId]);
    let saved = false;

    if (existing) {
      await query('DELETE FROM saved_posts WHERE id = $1', [existing.id]);
      saved = false;
    } else {
      await query('INSERT INTO saved_posts (id, post_id, user_id) VALUES ($1, $2, $3)', [
        `sp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, postId, userId
      ]);
      saved = true;
    }

    res.json({ saved, message: saved ? 'Publication enregistrée dans vos favoris.' : 'Publication retirée de vos favoris.' });
  } catch (err: any) {
    console.error('Bookmark error:', err);
    res.status(500).json({ error: 'Erreur favoris.' });
  }
});

// Comments on Post
apiRouter.get('/posts/:id/comments', optionalAuth, async (req, res) => {
  try {
    const postId = req.params.id;
    const comments = await query(`
      SELECT
        c.*,
        sp.first_name, sp.last_name, sp.avatar_url, sp.institution, sp.field_of_study
      FROM post_comments c
      JOIN student_profiles sp ON sp.user_id = c.author_id
      WHERE c.post_id = $1
      ORDER BY c.created_at ASC
    `, [postId]);

    res.json({ comments });
  } catch (err: any) {
    console.error('Get comments error:', err);
    res.status(500).json({ error: 'Erreur lors du chargement des commentaires.' });
  }
});

apiRouter.post('/posts/:id/comments', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user!.id;
    const { content, parentId } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Le commentaire ne peut pas être vide.' });
    }

    const commentId = `cmt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await query(`
      INSERT INTO post_comments (id, post_id, author_id, parent_id, content)
      VALUES ($1, $2, $3, $4, $5)
    `, [commentId, postId, userId, parentId || null, content.trim()]);

    await query('UPDATE posts SET comments_count = comments_count + 1 WHERE id = $1', [postId]);

    const comment = await queryOne(`
      SELECT
        c.*,
        sp.first_name, sp.last_name, sp.avatar_url, sp.institution, sp.field_of_study
      FROM post_comments c
      JOIN student_profiles sp ON sp.user_id = c.author_id
      WHERE c.id = $1
    `, [commentId]);

    // Notify post author
    const post = await queryOne('SELECT author_id FROM posts WHERE id = $1', [postId]);
    if (post && post.author_id !== userId) {
      const actor = await queryOne('SELECT first_name, last_name FROM student_profiles WHERE user_id = $1', [userId]);
      await query(`
        INSERT INTO notifications (id, user_id, actor_id, type, title, message, link)
        VALUES ($1, $2, $3, 'COMMENT', 'Nouveau commentaire', $4, $5)
      `, [
        `notif_${Date.now()}`, post.author_id, userId,
        `${actor?.first_name} ${actor?.last_name} a commenté votre publication.`,
        `/posts/${postId}`
      ]);
    }

    res.status(201).json({ message: 'Commentaire ajouté !', comment });
  } catch (err: any) {
    console.error('Create comment error:', err);
    res.status(500).json({ error: "Erreur lors de l'ajout du commentaire." });
  }
});

/* ==========================================================================
   5. SCHOLARSHIPS, INTERNSHIPS & OPPORTUNITIES (BOURSES & STAGES)
   ========================================================================== */
apiRouter.get('/opportunities', optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const currentUserId = req.user?.id;
    const { category, country, academicLevel, fieldOfStudy, keyword, favoritesOnly, status = 'OPEN', page = '1', limit = '12' } = req.query;
    const offset = (Math.max(1, parseInt(page as string, 10)) - 1) * parseInt(limit as string, 10);
    const params: any[] = [];
    let whereClauses: string[] = [];

    if (status) {
      params.push(status);
      whereClauses.push(`o.status = $${params.length}`);
    }

    if (category && category !== 'ALL') {
      params.push(category);
      whereClauses.push(`o.category = $${params.length}`);
    }

    if (country && country !== 'ALL') {
      params.push(`%${country}%`);
      whereClauses.push(`o.country ILIKE $${params.length}`);
    }

    if (academicLevel && academicLevel !== 'ALL') {
      params.push(`%${academicLevel}%`);
      whereClauses.push(`o.academic_level ILIKE $${params.length}`);
    }

    if (keyword) {
      params.push(`%${keyword}%`);
      whereClauses.push(`(
        o.title ILIKE $${params.length} OR
        o.description ILIKE $${params.length} OR
        o.organization ILIKE $${params.length}
      )`);
    }

    if (favoritesOnly === 'true' && currentUserId) {
      params.push(currentUserId);
      whereClauses.push(`o.id IN (SELECT opportunity_id FROM opportunity_favorites WHERE user_id = $${params.length})`);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countRes = await query(`SELECT COUNT(*) as c FROM opportunities o ${whereSql}`, params);
    const total = parseInt(countRes[0]?.c || '0', 10);

    const queryParams = [...params, parseInt(limit as string, 10), offset];
    const opportunities = await query(`
      SELECT
        o.*,
        sp.first_name as author_first_name, sp.last_name as author_last_name,
        sp.avatar_url as author_avatar
      FROM opportunities o
      LEFT JOIN student_profiles sp ON sp.user_id = o.author_id
      ${whereSql}
      ORDER BY o.is_verified DESC, o.deadline ASC NULLS LAST, o.created_at DESC
      LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}
    `, queryParams);

    let userFavorites: Set<string> = new Set();
    if (currentUserId && opportunities.length > 0) {
      const oppIds = opportunities.map(o => o.id);
      const favs = await query(`
        SELECT opportunity_id FROM opportunity_favorites WHERE user_id = $1 AND opportunity_id = ANY($2)
      `, [currentUserId, oppIds]);
      favs.forEach(f => userFavorites.add(f.opportunity_id));
    }

    res.json({
      total,
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
      opportunities: opportunities.map(o => ({
        ...o,
        isFavorited: userFavorites.has(o.id)
      }))
    });
  } catch (err: any) {
    console.error('Opportunities list error:', err);
    res.status(500).json({ error: 'Erreur lors du chargement des opportunités.' });
  }
});

apiRouter.get('/opportunities/:id', optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const oppId = req.params.id;
    const currentUserId = req.user?.id;

    await query('UPDATE opportunities SET views_count = views_count + 1 WHERE id = $1', [oppId]);

    const opp = await queryOne(`
      SELECT
        o.*,
        sp.first_name as author_first_name, sp.last_name as author_last_name,
        sp.avatar_url as author_avatar, sp.institution as author_institution
      FROM opportunities o
      LEFT JOIN student_profiles sp ON sp.user_id = o.author_id
      WHERE o.id = $1
    `, [oppId]);

    if (!opp) {
      return res.status(404).json({ error: 'Opportunité introuvable.' });
    }

    let isFavorited = false;
    if (currentUserId) {
      const fav = await queryOne('SELECT id FROM opportunity_favorites WHERE opportunity_id = $1 AND user_id = $2', [oppId, currentUserId]);
      isFavorited = !!fav;
    }

    res.json({ opportunity: { ...opp, isFavorited } });
  } catch (err: any) {
    console.error('Opportunity details error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

apiRouter.post('/opportunities', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const {
      title, description, organization, country, category,
      academicLevel, fieldOfStudy, requirements, requiredDocuments,
      applicationUrl, deadline
    } = req.body;

    if (!title || !description || !organization || !country || !category) {
      return res.status(400).json({ error: 'Veuillez remplir les informations indispensables de l\'opportunité.' });
    }

    const oppId = `opp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const isAutoVerified = userRole === 'ADMIN' || userRole === 'MODERATOR';

    await query(`
      INSERT INTO opportunities (
        id, author_id, title, description, organization, country, category,
        academic_level, field_of_study, requirements, required_documents,
        application_url, deadline, status, is_verified, verified_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'OPEN', $14, $15)
    `, [
      oppId, userId, title.trim(), description.trim(), organization.trim(),
      country.trim(), category, academicLevel || null, fieldOfStudy || null,
      requirements || null, requiredDocuments || null, applicationUrl || null,
      deadline ? new Date(deadline).toISOString() : null,
      isAutoVerified, isAutoVerified ? userId : null
    ]);

    res.status(201).json({
      message: isAutoVerified ? 'Opportunité publiée et vérifiée avec succès !' : 'Opportunité soumise ! Elle sera examinée par l\'équipe de modération.',
      opportunityId: oppId
    });
  } catch (err: any) {
    console.error('Create opportunity error:', err);
    res.status(500).json({ error: 'Erreur lors de la publication de l\'opportunité.' });
  }
});

apiRouter.post('/opportunities/:id/favorite', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const oppId = req.params.id;
    const userId = req.user!.id;

    const existing = await queryOne('SELECT id FROM opportunity_favorites WHERE opportunity_id = $1 AND user_id = $2', [oppId, userId]);
    let favorited = false;

    if (existing) {
      await query('DELETE FROM opportunity_favorites WHERE id = $1', [existing.id]);
      await query('UPDATE opportunities SET favorites_count = GREATEST(0, favorites_count - 1) WHERE id = $1', [oppId]);
      favorited = false;
    } else {
      await query('INSERT INTO opportunity_favorites (id, opportunity_id, user_id) VALUES ($1, $2, $3)', [
        `fav_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, oppId, userId
      ]);
      await query('UPDATE opportunities SET favorites_count = favorites_count + 1 WHERE id = $1', [oppId]);
      favorited = true;
    }

    res.json({ favorited, message: favorited ? 'Opportunité ajoutée à vos favoris.' : 'Opportunité retirée de vos favoris.' });
  } catch (err: any) {
    console.error('Favorite error:', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

/* ==========================================================================
   6. PEDAGOGICAL RESOURCES (BIBLIOTHÈQUE ACADÉMIQUE)
   ========================================================================== */
apiRouter.get('/resources', optionalAuth, async (req, res) => {
  try {
    const { category, institution, fieldOfStudy, academicLevel, subject, search, page = '1', limit = '12' } = req.query;
    const offset = (Math.max(1, parseInt(page as string, 10)) - 1) * parseInt(limit as string, 10);
    const params: any[] = [];
    let whereClauses: string[] = [];

    if (category && category !== 'ALL') {
      params.push(category);
      whereClauses.push(`r.category = $${params.length}`);
    }

    if (institution && institution !== 'ALL') {
      params.push(institution);
      whereClauses.push(`r.institution = $${params.length}`);
    }

    if (fieldOfStudy && fieldOfStudy !== 'ALL') {
      params.push(fieldOfStudy);
      whereClauses.push(`r.field_of_study = $${params.length}`);
    }

    if (academicLevel && academicLevel !== 'ALL') {
      params.push(academicLevel);
      whereClauses.push(`r.academic_level = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      whereClauses.push(`(
        r.title ILIKE $${params.length} OR
        r.description ILIKE $${params.length} OR
        r.subject ILIKE $${params.length}
      )`);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countRes = await query(`SELECT COUNT(*) as c FROM resources r ${whereSql}`, params);
    const total = parseInt(countRes[0]?.c || '0', 10);

    const queryParams = [...params, parseInt(limit as string, 10), offset];
    const resources = await query(`
      SELECT
        r.*,
        sp.first_name as uploader_first_name, sp.last_name as uploader_last_name,
        sp.avatar_url as uploader_avatar
      FROM resources r
      JOIN student_profiles sp ON sp.user_id = r.uploader_id
      ${whereSql}
      ORDER BY r.download_count DESC, r.created_at DESC
      LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}
    `, queryParams);

    res.json({
      total,
      page: parseInt(page as string, 10),
      resources
    });
  } catch (err: any) {
    console.error('Resources list error:', err);
    res.status(500).json({ error: 'Erreur lors du chargement des ressources pédagogiques.' });
  }
});

apiRouter.post('/resources', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const {
      title, description, institution, fieldOfStudy,
      academicLevel, subject, category, fileUrl, fileName,
      fileSize, fileType
    } = req.body;

    if (!title || !institution || !fieldOfStudy || !academicLevel || !subject || !category) {
      return res.status(400).json({ error: 'Veuillez remplir tous les champs requis pour déposer ce document.' });
    }

    const resId = `res_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await query(`
      INSERT INTO resources (
        id, uploader_id, title, description, institution, field_of_study,
        academic_level, subject, category, file_url, file_name, file_size,
        file_type, download_count, is_verified
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 0, TRUE)
    `, [
      resId, userId, title.trim(), description || '', institution, fieldOfStudy,
      academicLevel, subject.trim(), category,
      fileUrl || '/uploads/sample_document.pdf',
      fileName || `${title.replace(/\s+/g, '_')}.pdf`,
      fileSize || 2500000,
      fileType || 'application/pdf'
    ]);

    res.status(201).json({ message: 'Ressource pédagogique partagée avec succès !', resourceId: resId });
  } catch (err: any) {
    console.error('Create resource error:', err);
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement de la ressource.' });
  }
});

apiRouter.post('/resources/:id/download', async (req, res) => {
  try {
    const resId = req.params.id;
    await query('UPDATE resources SET download_count = download_count + 1 WHERE id = $1', [resId]);
    const resource = await queryOne('SELECT file_url, file_name FROM resources WHERE id = $1', [resId]);
    if (!resource) {
      return res.status(404).json({ error: 'Document introuvable.' });
    }
    res.json({ message: 'Téléchargement démarré', fileUrl: resource.file_url, fileName: resource.file_name });
  } catch (err: any) {
    console.error('Download error:', err);
    res.status(500).json({ error: 'Erreur de téléchargement.' });
  }
});

/* ==========================================================================
   7. ACADEMIC GROUPS (COMMUNAUTÉS UNIVERSITAIRES)
   ========================================================================== */
apiRouter.get('/groups', optionalAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const currentUserId = req.user?.id;
    const { category, search } = req.query;
    const params: any[] = [];
    let whereClauses: string[] = [];

    if (category && category !== 'ALL') {
      params.push(category);
      whereClauses.push(`category = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      whereClauses.push(`(name ILIKE $${params.length} OR description ILIKE $${params.length})`);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const groups = await query(`SELECT * FROM groups ${whereSql} ORDER BY members_count DESC`, params);

    let userMemberships: Set<string> = new Set();
    if (currentUserId && groups.length > 0) {
      const gIds = groups.map(g => g.id);
      const mbs = await query(`
        SELECT group_id FROM group_memberships WHERE user_id = $1 AND group_id = ANY($2)
      `, [currentUserId, gIds]);
      mbs.forEach(m => userMemberships.add(m.group_id));
    }

    res.json({
      groups: groups.map(g => ({
        ...g,
        isMember: userMemberships.has(g.id)
      }))
    });
  } catch (err: any) {
    console.error('Groups list error:', err);
    res.status(500).json({ error: 'Erreur lors du chargement des groupes.' });
  }
});

apiRouter.post('/groups', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { name, description, category, institution, country, avatarUrl, isPrivate } = req.body;

    if (!name || !description || !category) {
      return res.status(400).json({ error: 'Veuillez saisir le nom, la description et la catégorie du groupe.' });
    }

    const groupId = `grp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await query(`
      INSERT INTO groups (id, name, description, category, institution, country, avatar_url, is_private, created_by_id, members_count)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 1)
    `, [
      groupId, name.trim(), description.trim(), category, institution || null,
      country || null, avatarUrl || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=256&q=80',
      Boolean(isPrivate), userId
    ]);

    await query(`
      INSERT INTO group_memberships (id, group_id, user_id, role, status)
      VALUES ($1, $2, $3, 'ADMIN', 'ACTIVE')
    `, [`gm_${groupId}_${userId}`, groupId, userId]);

    res.status(201).json({ message: 'Groupe académique créé avec succès !', groupId });
  } catch (err: any) {
    console.error('Create group error:', err);
    res.status(500).json({ error: 'Erreur lors de la création du groupe.' });
  }
});

apiRouter.post('/groups/:id/join', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user!.id;

    const existing = await queryOne('SELECT id FROM group_memberships WHERE group_id = $1 AND user_id = $2', [groupId, userId]);
    if (existing) {
      await query('DELETE FROM group_memberships WHERE id = $1', [existing.id]);
      await query('UPDATE groups SET members_count = GREATEST(1, members_count - 1) WHERE id = $1', [groupId]);
      return res.json({ joined: false, message: 'Vous avez quitté le groupe.' });
    }

    await query(`
      INSERT INTO group_memberships (id, group_id, user_id, role, status)
      VALUES ($1, $2, $3, 'MEMBER', 'ACTIVE')
    `, [`gm_${groupId}_${userId}`, groupId, userId]);

    await query('UPDATE groups SET members_count = members_count + 1 WHERE id = $1', [groupId]);
    res.json({ joined: true, message: 'Vous avez rejoint le groupe avec succès !' });
  } catch (err: any) {
    console.error('Join group error:', err);
    res.status(500).json({ error: 'Erreur lors de l\'adhésion.' });
  }
});

/* ==========================================================================
   8. REAL-TIME MESSAGING (MESSAGERIE INSTANTANÉE)
   ========================================================================== */
apiRouter.get('/conversations', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;

    // Get all conversations user is participant in
    const convos = await query(`
      SELECT
        c.id, c.type, c.title, c.updated_at,
        cp.last_read_at,
        (
          SELECT json_build_object(
            'id', m.id,
            'content', m.content,
            'sender_id', m.sender_id,
            'created_at', m.created_at,
            'is_read', m.is_read
          )
          FROM messages m
          WHERE m.conversation_id = c.id
          ORDER BY m.created_at DESC
          LIMIT 1
        ) as last_message,
        (
          SELECT COUNT(*)
          FROM messages m
          WHERE m.conversation_id = c.id
            AND m.sender_id != $1
            AND m.created_at > cp.last_read_at
        ) as unread_count
      FROM conversations c
      JOIN conversation_participants cp ON cp.conversation_id = c.id
      WHERE cp.user_id = $1
      ORDER BY c.updated_at DESC
    `, [userId]);

    // For direct conversations, attach recipient info
    const enriched = await Promise.all(convos.map(async (conv) => {
      let recipient = null;
      if (conv.type === 'DIRECT') {
        const otherParticipant = await queryOne(`
          SELECT
            u.id, u.role,
            sp.first_name, sp.last_name, sp.avatar_url, sp.institution, sp.field_of_study
          FROM conversation_participants cp
          JOIN users u ON u.id = cp.user_id
          JOIN student_profiles sp ON sp.user_id = u.id
          WHERE cp.conversation_id = $1 AND cp.user_id != $2
        `, [conv.id, userId]);
        recipient = otherParticipant;
      }
      return {
        ...conv,
        recipient
      };
    }));

    res.json({ conversations: enriched });
  } catch (err: any) {
    console.error('Conversations error:', err);
    res.status(500).json({ error: 'Erreur lors du chargement des conversations.' });
  }
});

// Start or get direct conversation with recipient
apiRouter.post('/conversations', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { targetUserId } = req.body;

    if (!targetUserId || targetUserId === userId) {
      return res.status(400).json({ error: 'Destinataire invalide.' });
    }

    // Check if direct conversation already exists between both users
    const existing = await queryOne(`
      SELECT c.id
      FROM conversations c
      JOIN conversation_participants cp1 ON cp1.conversation_id = c.id AND cp1.user_id = $1
      JOIN conversation_participants cp2 ON cp2.conversation_id = c.id AND cp2.user_id = $2
      WHERE c.type = 'DIRECT'
    `, [userId, targetUserId]);

    if (existing) {
      return res.json({ conversationId: existing.id });
    }

    // Create new direct conversation
    const convId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await query('INSERT INTO conversations (id, type) VALUES ($1, \'DIRECT\')', [convId]);

    await query(`
      INSERT INTO conversation_participants (id, conversation_id, user_id)
      VALUES ($1, $2, $3), ($4, $5, $6)
    `, [
      `cp_${convId}_${userId}`, convId, userId,
      `cp_${convId}_${targetUserId}`, convId, targetUserId
    ]);

    res.status(201).json({ conversationId: convId });
  } catch (err: any) {
    console.error('Create conversation error:', err);
    res.status(500).json({ error: 'Erreur lors de la création de la conversation.' });
  }
});

// Messages in conversation
apiRouter.get('/conversations/:id/messages', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const convId = req.params.id;
    const userId = req.user!.id;

    // Check participation
    const participant = await queryOne('SELECT id FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2', [convId, userId]);
    if (!participant) {
      return res.status(403).json({ error: 'Accès non autorisé à cette conversation.' });
    }

    // Mark read
    await query('UPDATE conversation_participants SET last_read_at = CURRENT_TIMESTAMP WHERE conversation_id = $1 AND user_id = $2', [convId, userId]);
    await query('UPDATE messages SET is_read = TRUE WHERE conversation_id = $1 AND sender_id != $2', [convId, userId]);

    const messages = await query(`
      SELECT
        m.*,
        sp.first_name as sender_first_name, sp.last_name as sender_last_name,
        sp.avatar_url as sender_avatar
      FROM messages m
      JOIN student_profiles sp ON sp.user_id = m.sender_id
      WHERE m.conversation_id = $1
      ORDER BY m.created_at ASC
    `, [convId]);

    res.json({
      messages: messages.map(m => ({
        ...m,
        attachments: JSON.parse(m.attachments || '[]')
      }))
    });
  } catch (err: any) {
    console.error('Get messages error:', err);
    res.status(500).json({ error: 'Erreur lors du chargement des messages.' });
  }
});

// Send message via REST (synchronized with socket broadcast)
apiRouter.post('/conversations/:id/messages', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const convId = req.params.id;
    const userId = req.user!.id;
    const { content, attachments = [] } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Le message ne peut pas être vide.' });
    }

    const participant = await queryOne('SELECT id FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2', [convId, userId]);
    if (!participant) {
      return res.status(403).json({ error: 'Accès non autorisé à cette conversation.' });
    }

    const msgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await query(`
      INSERT INTO messages (id, conversation_id, sender_id, content, attachments)
      VALUES ($1, $2, $3, $4, $5)
    `, [msgId, convId, userId, content.trim(), JSON.stringify(attachments)]);

    await query('UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [convId]);
    await query('UPDATE conversation_participants SET last_read_at = CURRENT_TIMESTAMP WHERE conversation_id = $1 AND user_id = $2', [convId, userId]);

    const msg = await queryOne(`
      SELECT
        m.*,
        sp.first_name as sender_first_name, sp.last_name as sender_last_name,
        sp.avatar_url as sender_avatar
      FROM messages m
      JOIN student_profiles sp ON sp.user_id = m.sender_id
      WHERE m.id = $1
    `, [msgId]);

    res.status(201).json({
      message: {
        ...msg,
        attachments: JSON.parse(msg.attachments || '[]')
      }
    });
  } catch (err: any) {
    console.error('Send message error:', err);
    res.status(500).json({ error: 'Erreur lors de l\'envoi du message.' });
  }
});

/* ==========================================================================
   9. NOTIFICATIONS CENTER
   ========================================================================== */
apiRouter.get('/notifications', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const notifications = await query(`
      SELECT
        n.*,
        sp.first_name as actor_first_name, sp.last_name as actor_last_name,
        sp.avatar_url as actor_avatar
      FROM notifications n
      LEFT JOIN student_profiles sp ON sp.user_id = n.actor_id
      WHERE n.user_id = $1
      ORDER BY n.created_at DESC
      LIMIT 30
    `, [userId]);

    res.json({ notifications });
  } catch (err: any) {
    console.error('Notifications error:', err);
    res.status(500).json({ error: 'Erreur lors du chargement des notifications.' });
  }
});

apiRouter.put('/notifications/:id/read', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const notifId = req.params.id;
    const userId = req.user!.id;
    await query('UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2', [notifId, userId]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

apiRouter.put('/notifications/read-all', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    await query('UPDATE notifications SET is_read = TRUE WHERE user_id = $1', [userId]);
    res.json({ success: true, message: 'Toutes les notifications ont été marquées comme lues.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

/* ==========================================================================
   10. SIGNALEMENT & MODÉRATION (REPORTS)
   ========================================================================== */
apiRouter.post('/reports', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const { targetType, targetId, reason, details } = req.body;

    if (!targetType || !targetId || !reason) {
      return res.status(400).json({ error: 'Veuillez préciser le motif et la cible du signalement.' });
    }

    const reportId = `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await query(`
      INSERT INTO reports (id, reporter_id, target_type, target_id, reason, details, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'PENDING')
    `, [reportId, userId, targetType, targetId, reason, details || '']);

    res.status(201).json({
      message: 'Signalement transmis à l\'équipe de modération académique. Merci de votre vigilance.'
    });
  } catch (err: any) {
    console.error('Create report error:', err);
    res.status(500).json({ error: 'Erreur lors du signalement.' });
  }
});

/* ==========================================================================
   11. ADMINISTRATION & TABLEAU DE BORD (ADMIN & MODERATION)
   ========================================================================== */
apiRouter.get('/admin/stats', authenticateToken, requireRole(['ADMIN', 'MODERATOR']), async (_req, res) => {
  try {
    const totalUsers = parseInt((await queryOne('SELECT COUNT(*) as c FROM users'))?.c || '0', 10);
    const activeUsers = parseInt((await queryOne('SELECT COUNT(*) as c FROM users WHERE status = \'ACTIVE\''))?.c || '0', 10);
    const suspendedUsers = parseInt((await queryOne('SELECT COUNT(*) as c FROM users WHERE status = \'SUSPENDED\''))?.c || '0', 10);
    const totalPosts = parseInt((await queryOne('SELECT COUNT(*) as c FROM posts'))?.c || '0', 10);
    const totalOpportunities = parseInt((await queryOne('SELECT COUNT(*) as c FROM opportunities'))?.c || '0', 10);
    const verifiedOpportunities = parseInt((await queryOne('SELECT COUNT(*) as c FROM opportunities WHERE is_verified = TRUE'))?.c || '0', 10);
    const totalResources = parseInt((await queryOne('SELECT COUNT(*) as c FROM resources'))?.c || '0', 10);
    const pendingReports = parseInt((await queryOne('SELECT COUNT(*) as c FROM reports WHERE status = \'PENDING\''))?.c || '0', 10);
    const totalGroups = parseInt((await queryOne('SELECT COUNT(*) as c FROM groups'))?.c || '0', 10);

    res.json({
      stats: {
        totalUsers,
        activeUsers,
        suspendedUsers,
        totalPosts,
        totalOpportunities,
        verifiedOpportunities,
        totalResources,
        pendingReports,
        totalGroups
      }
    });
  } catch (err: any) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: 'Erreur chargement indicateurs.' });
  }
});

apiRouter.get('/admin/users', authenticateToken, requireRole(['ADMIN', 'MODERATOR']), async (req, res) => {
  try {
    const { search, role, status, page = '1', limit = '20' } = req.query;
    const offset = (Math.max(1, parseInt(page as string, 10)) - 1) * parseInt(limit as string, 10);
    const params: any[] = [];
    let whereClauses: string[] = [];

    if (role && role !== 'ALL') {
      params.push(role);
      whereClauses.push(`u.role = $${params.length}`);
    }

    if (status && status !== 'ALL') {
      params.push(status);
      whereClauses.push(`u.status = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      whereClauses.push(`(
        u.email ILIKE $${params.length} OR
        sp.first_name ILIKE $${params.length} OR
        sp.last_name ILIKE $${params.length} OR
        sp.institution ILIKE $${params.length}
      )`);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countRes = await query(`
      SELECT COUNT(*) as c
      FROM users u
      LEFT JOIN student_profiles sp ON sp.user_id = u.id
      ${whereSql}
    `, params);
    const total = parseInt(countRes[0]?.c || '0', 10);

    const queryParams = [...params, parseInt(limit as string, 10), offset];
    const users = await query(`
      SELECT
        u.id, u.email, u.role, u.status, u.created_at,
        sp.first_name, sp.last_name, sp.country, sp.institution, sp.field_of_study, sp.academic_level
      FROM users u
      LEFT JOIN student_profiles sp ON sp.user_id = u.id
      ${whereSql}
      ORDER BY u.created_at DESC
      LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}
    `, queryParams);

    res.json({ total, page: parseInt(page as string, 10), users });
  } catch (err: any) {
    console.error('Admin users error:', err);
    res.status(500).json({ error: 'Erreur lors du chargement des utilisateurs.' });
  }
});

apiRouter.put('/admin/users/:id/status', authenticateToken, requireRole(['ADMIN', 'MODERATOR']), async (req: AuthenticatedRequest, res) => {
  try {
    const targetUserId = req.params.id;
    const { status, reason } = req.body;
    const adminId = req.user!.id;

    if (!['ACTIVE', 'SUSPENDED', 'BANNED'].includes(status)) {
      return res.status(400).json({ error: 'Statut invalide.' });
    }

    await query('UPDATE users SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [status, targetUserId]);

    // Log action
    await query(`
      INSERT INTO audit_logs (id, admin_id, action, target_type, target_id, details)
      VALUES ($1, $2, $3, 'USER', $4, $5)
    `, [
      `log_${Date.now()}`, adminId, `STATUS_CHANGE_TO_${status}`, targetUserId,
      reason || 'Action modérateur'
    ]);

    res.json({ message: `Statut de l'utilisateur mis à jour en ${status}.` });
  } catch (err: any) {
    console.error('Admin user status error:', err);
    res.status(500).json({ error: 'Erreur mise à jour statut.' });
  }
});

apiRouter.get('/admin/reports', authenticateToken, requireRole(['ADMIN', 'MODERATOR']), async (_req, res) => {
  try {
    const reports = await query(`
      SELECT
        r.*,
        sp.first_name as reporter_first_name, sp.last_name as reporter_last_name
      FROM reports r
      JOIN student_profiles sp ON sp.user_id = r.reporter_id
      ORDER BY r.created_at DESC
    `);
    res.json({ reports });
  } catch (err: any) {
    console.error('Admin reports error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des signalements.' });
  }
});

apiRouter.put('/admin/reports/:id', authenticateToken, requireRole(['ADMIN', 'MODERATOR']), async (req: AuthenticatedRequest, res) => {
  try {
    const reportId = req.params.id;
    const adminId = req.user!.id;
    const { status, resolutionNote, deleteTarget } = req.body;

    const report = await queryOne('SELECT * FROM reports WHERE id = $1', [reportId]);
    if (!report) {
      return res.status(404).json({ error: 'Signalement introuvable.' });
    }

    await query(`
      UPDATE reports SET
        status = $1,
        resolved_by = $2,
        resolution_note = $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
    `, [status || 'RESOLVED', adminId, resolutionNote || '', reportId]);

    if (deleteTarget) {
      if (report.target_type === 'POST') {
        await query('DELETE FROM posts WHERE id = $1', [report.target_id]);
      } else if (report.target_type === 'COMMENT') {
        await query('DELETE FROM post_comments WHERE id = $1', [report.target_id]);
      } else if (report.target_type === 'OPPORTUNITY') {
        await query('DELETE FROM opportunities WHERE id = $1', [report.target_id]);
      } else if (report.target_type === 'RESOURCE') {
        await query('DELETE FROM resources WHERE id = $1', [report.target_id]);
      }
    }

    res.json({ message: 'Signalement traité avec succès.' });
  } catch (err: any) {
    console.error('Resolve report error:', err);
    res.status(500).json({ error: 'Erreur lors du traitement du signalement.' });
  }
});

apiRouter.get('/admin/audit', authenticateToken, requireRole(['ADMIN']), async (_req, res) => {
  try {
    const logs = await query(`
      SELECT
        al.*,
        u.email as admin_email,
        sp.first_name as admin_first_name, sp.last_name as admin_last_name
      FROM audit_logs al
      LEFT JOIN users u ON u.id = al.admin_id
      LEFT JOIN student_profiles sp ON sp.user_id = al.admin_id
      ORDER BY al.created_at DESC
      LIMIT 50
    `);
    res.json({ logs });
  } catch (err: any) {
    console.error('Audit logs error:', err);
    res.status(500).json({ error: 'Erreur chargement journaux d\'audit.' });
  }
});

/* ==========================================================================
   12. SITE SETTINGS & BRANDING CUSTOMIZATION
   ========================================================================== */
apiRouter.get('/settings', async (_req, res) => {
  try {
    let settings = await queryOne('SELECT * FROM site_settings WHERE id = $1', ['default']);
    if (!settings) {
      settings = {
        id: 'default',
        platform_name: 'CampusHub Africa',
        platform_slogan: '« Connecter les étudiants, partager les opportunités, construire l’avenir de l’Afrique. »',
        logo_type: 'icon_grad_cap',
        logo_url: '',
        primary_color: 'blue',
        banner_announcement: 'Rentrée universitaire 2026 : bourses France Excellence Eiffel et DAAD ouvertes aux candidatures !',
        show_announcement: true,
      };
    }
    res.json({ settings });
  } catch (err: any) {
    console.error('Get settings error:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des paramètres.' });
  }
});

apiRouter.put('/settings', async (req, res) => {
  try {
    const {
      platform_name, platform_slogan, institution_tag, logo_type, logo_url,
      logo_shape, logo_size, primary_color, custom_color_hex,
      banner_announcement, banner_type, show_announcement, default_tab
    } = req.body;

    await query(`
      INSERT INTO site_settings (
        id, platform_name, platform_slogan, institution_tag, logo_type, logo_url,
        logo_shape, logo_size, primary_color, custom_color_hex,
        banner_announcement, banner_type, show_announcement, default_tab, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        platform_name = EXCLUDED.platform_name,
        platform_slogan = EXCLUDED.platform_slogan,
        institution_tag = EXCLUDED.institution_tag,
        logo_type = EXCLUDED.logo_type,
        logo_url = EXCLUDED.logo_url,
        logo_shape = EXCLUDED.logo_shape,
        logo_size = EXCLUDED.logo_size,
        primary_color = EXCLUDED.primary_color,
        custom_color_hex = EXCLUDED.custom_color_hex,
        banner_announcement = EXCLUDED.banner_announcement,
        banner_type = EXCLUDED.banner_type,
        show_announcement = EXCLUDED.show_announcement,
        default_tab = EXCLUDED.default_tab,
        updated_at = CURRENT_TIMESTAMP
    `, [
      'default',
      platform_name || 'CampusHub Africa',
      platform_slogan || '« Connecter les étudiants, partager les opportunités, construire l’avenir de l’Afrique. »',
      institution_tag || 'Réseau Académique Panafricain',
      logo_type || 'icon_grad_cap',
      logo_url || '',
      logo_shape || 'rounded',
      logo_size || 'medium',
      primary_color || 'blue',
      custom_color_hex || '#1d4ed8',
      banner_announcement || '',
      banner_type || 'info',
      show_announcement !== false,
      default_tab || 'feed'
    ]);

    const updated = await queryOne('SELECT * FROM site_settings WHERE id = $1', ['default']);
    res.json({ message: 'Paramètres du site et logo enregistrés avec succès.', settings: updated });
  } catch (err: any) {
    console.error('Update settings error:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour des paramètres.' });
  }
});
