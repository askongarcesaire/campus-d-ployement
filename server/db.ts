import { PGlite } from '@electric-sql/pglite';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';

let pgliteInstance: PGlite | null = null;

export async function getDb(): Promise<PGlite> {
  if (pgliteInstance) return pgliteInstance;

  const dataDir = path.resolve(process.cwd(), '.data/campushub_pg');
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    pgliteInstance = new PGlite(dataDir);
    await pgliteInstance.exec('SELECT 1');
  } catch (err) {
    console.warn('⚠️ Erreur d\'initialisation du stockage PG local, réinitialisation du répertoire:', err);
    try {
      if (fs.existsSync(dataDir)) {
        fs.rmSync(dataDir, { recursive: true, force: true });
        fs.mkdirSync(dataDir, { recursive: true });
      }
      pgliteInstance = new PGlite(dataDir);
      await pgliteInstance.exec('SELECT 1');
    } catch (e2) {
      console.warn('⚠️ Mode secours en mémoire activé pour PostgreSQL:', e2);
      pgliteInstance = new PGlite();
    }
  }

  await initSchemaAndSeed(pgliteInstance);
  return pgliteInstance;
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const db = await getDb();
  const res = await db.query(sql, params);
  return res.rows as T[];
}

export async function queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

async function initSchemaAndSeed(db: PGlite) {
  // Create tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'STUDENT',
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      email_verified BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS student_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      headline TEXT,
      bio TEXT,
      avatar_url TEXT,
      cover_url TEXT,
      country TEXT NOT NULL,
      city TEXT,
      institution TEXT NOT NULL,
      faculty TEXT,
      field_of_study TEXT NOT NULL,
      academic_level TEXT NOT NULL,
      graduation_year INT,
      interests TEXT DEFAULT '[]',
      skills TEXT DEFAULT '[]',
      languages TEXT DEFAULT '["Français"]',
      linkedin_url TEXT,
      github_url TEXT,
      portfolio_url TEXT,
      is_public BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'GENERAL',
      attachments TEXT DEFAULT '[]',
      likes_count INT DEFAULT 0,
      comments_count INT DEFAULT 0,
      shares_count INT DEFAULT 0,
      is_pinned BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS post_likes (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(post_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS post_comments (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      parent_id TEXT REFERENCES post_comments(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS saved_posts (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(post_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS opportunities (
      id TEXT PRIMARY KEY,
      author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      organization TEXT NOT NULL,
      country TEXT NOT NULL,
      category TEXT NOT NULL,
      academic_level TEXT,
      field_of_study TEXT,
      requirements TEXT,
      required_documents TEXT,
      application_url TEXT,
      attachment_url TEXT,
      deadline TIMESTAMP WITH TIME ZONE,
      status TEXT NOT NULL DEFAULT 'OPEN',
      is_verified BOOLEAN DEFAULT FALSE,
      verified_by TEXT,
      views_count INT DEFAULT 0,
      favorites_count INT DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS opportunity_favorites (
      id TEXT PRIMARY KEY,
      opportunity_id TEXT NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(opportunity_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS resources (
      id TEXT PRIMARY KEY,
      uploader_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      institution TEXT NOT NULL,
      field_of_study TEXT NOT NULL,
      academic_level TEXT NOT NULL,
      subject TEXT NOT NULL,
      category TEXT NOT NULL,
      file_url TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_size INT DEFAULT 0,
      file_type TEXT NOT NULL,
      download_count INT DEFAULT 0,
      is_verified BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS groups (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      institution TEXT,
      country TEXT,
      avatar_url TEXT,
      is_private BOOLEAN DEFAULT FALSE,
      created_by_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      members_count INT DEFAULT 1,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS group_memberships (
      id TEXT PRIMARY KEY,
      group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role TEXT NOT NULL DEFAULT 'MEMBER',
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(group_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL DEFAULT 'DIRECT',
      title TEXT,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS conversation_participants (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      last_read_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(conversation_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      attachments TEXT DEFAULT '[]',
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      actor_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      link TEXT,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      reporter_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      reason TEXT NOT NULL,
      details TEXT,
      status TEXT NOT NULL DEFAULT 'PENDING',
      resolved_by TEXT REFERENCES users(id) ON DELETE SET NULL,
      resolution_note TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      admin_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      action TEXT NOT NULL,
      target_type TEXT,
      target_id TEXT,
      details TEXT,
      ip_address TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      id TEXT PRIMARY KEY,
      platform_name TEXT NOT NULL DEFAULT 'CampusHub Africa',
      platform_slogan TEXT NOT NULL DEFAULT '« Connecter les étudiants, partager les opportunités, construire l’avenir de l’Afrique. »',
      institution_tag TEXT DEFAULT 'Réseau Académique Panafricain',
      logo_type TEXT NOT NULL DEFAULT 'icon_grad_cap',
      logo_url TEXT,
      logo_shape TEXT DEFAULT 'rounded',
      logo_size TEXT DEFAULT 'medium',
      primary_color TEXT NOT NULL DEFAULT 'blue',
      custom_color_hex TEXT DEFAULT '#1d4ed8',
      banner_announcement TEXT DEFAULT 'Rentrée universitaire 2026 : bourses France Excellence Eiffel et DAAD ouvertes aux candidatures !',
      banner_type TEXT DEFAULT 'info',
      show_announcement BOOLEAN DEFAULT TRUE,
      default_tab TEXT DEFAULT 'feed',
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS institution_tag TEXT DEFAULT 'Réseau Académique Panafricain';
    ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS logo_shape TEXT DEFAULT 'rounded';
    ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS logo_size TEXT DEFAULT 'medium';
    ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS custom_color_hex TEXT DEFAULT '#1d4ed8';
    ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS banner_type TEXT DEFAULT 'info';
    ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS default_tab TEXT DEFAULT 'feed';

    INSERT INTO site_settings (id, platform_name, platform_slogan, institution_tag, logo_type, logo_url, logo_shape, logo_size, primary_color, banner_announcement, banner_type, show_announcement, default_tab)
    VALUES ('default', 'CampusHub Africa', '« Connecter les étudiants, partager les opportunités, construire l’avenir de l’Afrique. »', 'Réseau Académique Panafricain', 'icon_grad_cap', '', 'rounded', 'medium', 'blue', 'Rentrée universitaire 2026 : bourses France Excellence Eiffel et DAAD ouvertes aux candidatures !', 'info', TRUE, 'feed')
    ON CONFLICT (id) DO NOTHING;

    CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
    CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_opportunities_category ON opportunities(category);
    CREATE INDEX IF NOT EXISTS idx_resources_institution ON resources(institution);
    CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
  `);

  // Seed default Admin & Initial dataset if empty
  const usersCountRes = await db.query('SELECT COUNT(*) as count FROM users');
  const count = parseInt((usersCountRes.rows[0] as any)?.count || '0', 10);

  if (count === 0) {
    console.log('⚡ Initializing CampusHub Africa database with initial seed data...');
    const hashedAdminPassword = await bcrypt.hash('Admin@CampusHub2026!', 10);
    const hashedUserPassword = await bcrypt.hash('Etudiant@2026!', 10);

    // 1. Admin
    const adminId = 'usr_admin_001';
    await db.query(`
      INSERT INTO users (id, email, password_hash, role, status, email_verified)
      VALUES ($1, $2, $3, 'ADMIN', 'ACTIVE', TRUE)
    `, [adminId, 'admin@campushub.africa', hashedAdminPassword]);

    await db.query(`
      INSERT INTO student_profiles (
        id, user_id, first_name, last_name, headline, bio, avatar_url, country, city,
        institution, faculty, field_of_study, academic_level, graduation_year, interests, skills, languages
      ) VALUES (
        $1, $2, 'Dr. Amadou', 'Diallo', 'Directeur Académique & Administrateur Principal',
        'Passionné par l''excellence académique et la coopération inter-universitaire en Afrique.',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
        'Sénégal', 'Dakar', 'Université Cheikh Anta Diop (UCAD)', 'Sciences et Technologies',
        'Informatique & Systèmes', 'Doctorat', 2020,
        '["Pédagogie Numérique", "Recherche", "Bourses d''études"]',
        '["Architecture Logicielle", "Gouvernance Universitaire", "Coopération"]',
        '["Français", "Wolof", "Anglais"]'
      )
    `, ['prof_admin_001', adminId]);

    console.log('✅ CampusHub Africa production database initialized (clean state, only root administrator).');
  }
}
