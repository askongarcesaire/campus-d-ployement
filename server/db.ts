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

    // 2. Moderator
    const modId = 'usr_mod_002';
    await db.query(`
      INSERT INTO users (id, email, password_hash, role, status, email_verified)
      VALUES ($1, $2, $3, 'MODERATOR', 'ACTIVE', TRUE)
    `, [modId, 'moderateur@campushub.africa', hashedUserPassword]);

    await db.query(`
      INSERT INTO student_profiles (
        id, user_id, first_name, last_name, headline, bio, avatar_url, country, city,
        institution, faculty, field_of_study, academic_level, graduation_year, interests, skills, languages
      ) VALUES (
        $1, $2, 'Fatou', 'Ndiaye', 'Modératrice Générale & Juriste Junior',
        'Garante de la convivialité, de la véracité des bourses partagées et de la sécurité sur CampusHub.',
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
        'Sénégal', 'Dakar', 'Université Cheikh Anta Diop (UCAD)', 'Faculté des Sciences Juridiques',
        'Droit International', 'Master 2', 2025,
        '["Droit Académique", "Relations Internationales", "Modération"]',
        '["Médiation", "Rédaction Juridique", "Gestion Communautaire"]',
        '["Français", "Anglais"]'
      )
    `, ['prof_mod_002', modId]);

    // 3. Students from Francophone Africa
    const students = [
      {
        id: 'usr_student_003',
        email: 'mariama.diallo@ucad.sn',
        firstName: 'Mariama',
        lastName: 'Diallo',
        headline: 'Étudiante en Master 1 Génie Logiciel | Dév Full-Stack & IA',
        bio: "Passionnée de technologies open-source et d'intelligence artificielle appliquée à la santé en Afrique de l'Ouest. Fondatrice du club féminin de code à l'UCAD.",
        avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=256&q=80',
        country: 'Sénégal',
        city: 'Dakar',
        institution: 'Université Cheikh Anta Diop (UCAD)',
        faculty: 'Faculté des Sciences et Techniques',
        field: 'Informatique & Génie Logiciel',
        level: 'Master 1',
        gradYear: 2026,
        interests: ['Génie Logiciel', 'Intelligence Artificielle', 'Mobilité Académique', 'Hackathons'],
        skills: ['TypeScript', 'Python', 'React', 'Docker', 'PostgreSQL'],
      },
      {
        id: 'usr_student_004',
        email: 'kouame.jean@ufhb.edu.ci',
        firstName: 'Jean-Philippe',
        lastName: 'Kouamé',
        headline: 'Licence 3 Sciences Économiques | Futur candidat Eiffel M1 Finance',
        bio: "Analyste en herbe, passionné par la micro-finance et les opportunités de bourses d'études supérieures en Europe et au Canada.",
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
        country: "Côte d'Ivoire",
        city: 'Abidjan',
        institution: 'Université Félix Houphouët-Boigny (UFHB)',
        faculty: 'UFR Sciences Économiques et Gestion',
        field: 'Économie & Finance de Marché',
        level: 'Licence 3',
        gradYear: 2026,
        interests: ['Bourses Eiffel', 'Économétrie', 'Fintech', 'Entrepreneuriat'],
        skills: ['Stata', 'Excel Avancé', 'R', 'Analyse Financière'],
      },
      {
        id: 'usr_student_005',
        email: 'aminata.traore@usttb.ml',
        firstName: 'Aminata',
        lastName: 'Traoré',
        headline: '4ème Année Médecine Générale | Santé Publique & Recherche Clinique',
        bio: "Future médecin dévouée à l'amélioration des systèmes de santé communautaires au Sahel. Partage régulièrement des fiches de révision et cas cliniques.",
        avatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=256&q=80',
        country: 'Mali',
        city: 'Bamako',
        institution: 'Université des Sciences, des Techniques et des Technologies de Bamako (USTTB)',
        faculty: "Faculté de Médecine et d'Odontostomatologie",
        field: 'Médecine & Santé Publique',
        level: 'Doctorat 1ère année',
        gradYear: 2028,
        interests: ['Santé Communautaire', 'Épidémiologie', 'Recherche Médicale', 'Entraide Étudiante'],
        skills: ['Sémiologie Médicale', 'Méthodologie Scientifique', 'Premiers Secours'],
      },
      {
        id: 'usr_student_006',
        email: 'boris.mballa@uy1.uninet.cm',
        firstName: 'Boris',
        lastName: 'Mballa',
        headline: 'Master 2 Data Science & Recherche Opérationnelle | Univ Yaoundé 1',
        bio: "Lauréat du prix d'excellence mathématique 2025. Prépare son départ en thèse cotutelle en France. Ouvert au mentorat des cadets en L1/L2.",
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
        country: 'Cameroun',
        city: 'Yaoundé',
        institution: 'Université de Yaoundé 1 (UY1)',
        faculty: 'Faculté des Sciences',
        field: 'Mathématiques & Data Science',
        level: 'Master 2',
        gradYear: 2025,
        interests: ['Machine Learning', 'Optimisation', 'Bourses Doctorales', 'Mentorat'],
        skills: ['PyTorch', 'C++', 'Algorithmique Avancée', 'LaTeX'],
      },
      {
        id: 'usr_student_007',
        email: 'yasmine.houngbo@uac.bj',
        firstName: 'Yasmine',
        lastName: 'Houngbo',
        headline: 'Licence 3 Droit des Affaires & Fiscalité | Univ Abomey-Calavi',
        bio: "Déléguée de promotion, passionnée par le droit OHADA et l'arbitrage commercial international. Organise des sessions de révision hebdomadaires.",
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
        country: 'Bénin',
        city: 'Cotonou',
        institution: "Université d'Abomey-Calavi (UAC)",
        faculty: 'Faculté de Droit et de Science Politique (FADESP)',
        field: 'Droit des Affaires & Fiscalité',
        level: 'Licence 3',
        gradYear: 2026,
        interests: ['Droit OHADA', 'Plaidoirie', "Concours d'Éloquence", 'Stages Juridiques'],
        skills: ['Analyse de Jurisprudence', 'Plaidoirie', 'Conseil Juridique'],
      }
    ];

    for (const s of students) {
      await db.query(`
        INSERT INTO users (id, email, password_hash, role, status, email_verified)
        VALUES ($1, $2, $3, 'STUDENT', 'ACTIVE', TRUE)
      `, [s.id, s.email, hashedUserPassword]);

      await db.query(`
        INSERT INTO student_profiles (
          id, user_id, first_name, last_name, headline, bio, avatar_url, country, city,
          institution, faculty, field_of_study, academic_level, graduation_year, interests, skills, languages
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
        )
      `, [
        `prof_${s.id}`, s.id, s.firstName, s.lastName, s.headline, s.bio, s.avatar,
        s.country, s.city, s.institution, s.faculty, s.field, s.level, s.gradYear,
        JSON.stringify(s.interests), JSON.stringify(s.skills), JSON.stringify(['Français', 'Anglais'])
      ]);
    }

    // 4. Seed Verified Opportunities (Bourses, Stages, Concours)
    const opportunities = [
      {
        id: 'opp_001',
        authorId: adminId,
        title: 'Bourses France Excellence Eiffel — Session 2026/2027 (Master & Doctorat)',
        description: `Le programme de bourses Eiffel est un outil développé par le Ministère de l'Europe et des Affaires étrangères afin de permettre aux établissements français d'enseignement supérieur d'attirer les meilleurs étudiants étrangers dans des formations diplômantes au niveau Master et en Doctorat.

Prise en charge complète : allocation mensuelle (1 181 € en Master / 1 800 € en Doctorat), billet d'avion aller-retour pris en charge, sécurité sociale et activités culturelles.`,
        organization: 'Campus France / Ministère des Affaires Étrangères',
        country: 'France',
        category: 'SCHOLARSHIP_INTL',
        academicLevel: 'Licence 3 / Master 1 / Master 2',
        field: 'Sciences et Technologies, Économie, Droit',
        requirements: "Être de nationalité étrangère, avoir moins de 27 ans pour le volet Master, excellence du dossier académique (mentions exigées).",
        requiredDocuments: "Relevés de notes universitaires certifiés, CV détaillé, Lettre de motivation, Projet d'études ou de thèse, 2 lettres de recommandation d'enseignants.",
        applicationUrl: 'https://www.campusfrance.org/fr/le-programme-de-bourses-france-excellence-eiffel',
        deadline: new Date(Date.now() + 45 * 86400000).toISOString(),
        isVerified: true,
      },
      {
        id: 'opp_002',
        authorId: adminId,
        title: 'Programme de Stages Jeunes Talents — Orange Digital Center Afrique (Dakar & Abidjan)',
        description: "Orange Digital Center recrute 15 stagiaires passionnés par le numérique pour une durée de 6 mois avec indemnité mensuelle attractive. Projets d'envergure sur le Cloud, la Cybersécurité, l'IA et le développement d'applications Web/Mobile à fort impact social.",
        organization: 'Orange Digital Center Afrique',
        country: "Sénégal / Côte d'Ivoire",
        category: 'INTERNSHIP',
        academicLevel: 'Licence 3 / Master 1 / Master 2 / Ingénieur',
        field: 'Informatique & Télécoms, Data, Design UX',
        requirements: "Solides bases en programmation, esprit d'équipe et motivation à résoudre des défis concrets du continent.",
        requiredDocuments: "CV à jour, lien vers portfolio/GitHub, lettre d'intérêt.",
        applicationUrl: 'https://orangedigitalcenters.com',
        deadline: new Date(Date.now() + 20 * 86400000).toISOString(),
        isVerified: true,
      },
      {
        id: 'opp_003',
        authorId: modId,
        title: 'Bourses DAAD In-Country/In-Region — Afrique Subsaharienne 2026',
        description: `Bourses complètes accordées par l'Office Allemand d'Échanges Universitaires (DAAD) pour financer des études de Master et Doctorat au sein des centres d'excellence partenaires en Afrique (ex: 2iE Ouagadougou, AIMS Cameroun/Sénégal, UCAD, etc.).

Frais de scolarité intégralement couverts + allocation de subsistance mensuelle + assurance maladie.`,
        organization: 'DAAD (Deutscher Akademischer Austauschdienst)',
        country: 'Multi-pays Afrique',
        category: 'SCHOLARSHIP_INTL',
        academicLevel: 'Licence 3 / Master 2',
        field: 'Ingénierie, Énergies Renouvelables, Mathématiques, Santé',
        requirements: "Diplôme universitaire obtenu au cours des 6 dernières années, excellent niveau académique.",
        requiredDocuments: "Formulaire DAAD dument rempli, Diplômes et relevés de notes traduits ou légalisés, Lettres de recommandation.",
        applicationUrl: 'https://www.daad.de/en/information-services-for-higher-education-institutions/further-programmes/in-country-in-region-programmes-in-developing-countries/',
        deadline: new Date(Date.now() + 60 * 86400000).toISOString(),
        isVerified: true,
      },
      {
        id: 'opp_004',
        authorId: 'usr_student_006',
        title: 'Hackathon Innovation Tech Sahel 2026 — 10 000 000 FCFA de dotation',
        description: "Compétition inter-universitaire ouverte aux équipes étudiantes des universités d'Afrique francophone. Thématique : solutions numériques résilientes pour l'agriculture, l'éducation décentralisée et la santé mobile.",
        organization: 'Alliance Africaine des Technologies Innovantes',
        country: 'Burkina Faso / Mali / Sénégal / Niger',
        category: 'CONTEST',
        academicLevel: 'Tous niveaux universitaires',
        field: 'Toutes filières confondues',
        requirements: "Équipe de 3 à 5 étudiants (parité encouragée), prototype fonctionnel ou MVP attendu.",
        requiredDocuments: "Présentation de l'équipe, Note conceptuelle de 2 pages.",
        applicationUrl: 'https://techsahel-hackathon.org',
        deadline: new Date(Date.now() + 15 * 86400000).toISOString(),
        isVerified: true,
      }
    ];

    for (const op of opportunities) {
      await db.query(`
        INSERT INTO opportunities (
          id, author_id, title, description, organization, country, category,
          academic_level, field_of_study, requirements, required_documents, application_url,
          deadline, status, is_verified, verified_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'OPEN', $14, $15)
      `, [
        op.id, op.authorId, op.title, op.description, op.organization, op.country,
        op.category, op.academicLevel, op.field, op.requirements, op.requiredDocuments,
        op.applicationUrl, op.deadline, op.isVerified, adminId
      ]);
    }

    // 5. Seed Authentic Academic Resources (Documents Pédagogiques)
    const resources = [
      {
        id: 'res_001',
        uploaderId: 'usr_student_003',
        title: "Annales Complètes & Corrigés : Algorithmique Avancée & Structures de Données (Licence 2)",
        description: "Compilation de 5 années de sujets d'examens partiels et finaux du département Informatique de l'UCAD avec corrigés détaillés rédigés par les majors de promotion. Inclut les arbres AVL, graphes et programmation dynamique.",
        institution: 'Université Cheikh Anta Diop (UCAD)',
        field: 'Informatique & Mathématiques',
        level: 'Licence 2',
        subject: 'Algorithmique & Structures de Données',
        category: 'EXAM_SOLUTION',
        fileUrl: '/uploads/resources/annales_algo_ucad_l2.pdf',
        fileName: 'Annales_Corrigees_Algo_UCAD_L2.pdf',
        fileSize: 4820000,
        fileType: 'application/pdf',
        downloads: 342,
      },
      {
        id: 'res_002',
        uploaderId: 'usr_student_004',
        title: "Polycopié de Cours & Exercices Résolus : Économétrie des Séries Temporelles (Master 1)",
        description: "Support de cours exhaustif comprenant les tests de stationnarité (Dickey-Fuller, Phillips-Perron), modèles ARMA, ARIMA, cointégration et modélisation VAR avec applications pratiques sous R et Stata.",
        institution: 'Université Félix Houphouët-Boigny (UFHB)',
        field: 'Sciences Économiques & Gestion',
        level: 'Master 1',
        subject: 'Économétrie Avancée',
        category: 'COURSE',
        fileUrl: '/uploads/resources/cours_econometrie_ufhb_m1.pdf',
        fileName: 'Econometrie_Series_Temporelles_M1.pdf',
        fileSize: 6150000,
        fileType: 'application/pdf',
        downloads: 218,
      },
      {
        id: 'res_003',
        uploaderId: adminId,
        title: "Guide Méthodologique Officiel : Rédaction & Soutenance d'un Mémoire de Recherche Académique",
        description: "Méthodologie standardisée pour formuler une problématique, bâtir une revue de littérature rigoureuse, respecter les normes bibliographiques APA 7 et préparer les diapositives de soutenance devant le jury.",
        institution: 'Commission Académique Inter-Universitaire',
        field: 'Méthodologie Universitaire',
        level: 'Master 1 / Master 2',
        subject: 'Méthodologie de la Recherche',
        category: 'METHOD_GUIDE',
        fileUrl: '/uploads/resources/guide_methodologie_memoire_2026.pdf',
        fileName: 'Guide_Methodologie_Memoire_Master.pdf',
        fileSize: 3200000,
        fileType: 'application/pdf',
        downloads: 512,
      },
      {
        id: 'res_004',
        uploaderId: 'usr_student_007',
        title: "Recueil de Fiches de Révision & Cas Pratiques : Droit des Sociétés Commerciales OHADA",
        description: "Synthèse claire des actes uniformes de l'OHADA révisés : constitution des SARL et SA, gouvernance d'entreprise, responsabilité civile des dirigeants et dissolution. Cas pratiques corrigés inclus.",
        institution: "Université d'Abomey-Calavi (UAC)",
        field: 'Droit des Affaires',
        level: 'Licence 3',
        subject: 'Droit OHADA des Entreprises',
        category: 'TUTORIAL_TD',
        fileUrl: '/uploads/resources/recueil_ohada_droit_societes.pdf',
        fileName: 'Recueil_Fiches_OHADA_Droit_Societes.pdf',
        fileSize: 2900000,
        fileType: 'application/pdf',
        downloads: 189,
      }
    ];

    for (const r of resources) {
      await db.query(`
        INSERT INTO resources (
          id, uploader_id, title, description, institution, field_of_study,
          academic_level, subject, category, file_url, file_name, file_size,
          file_type, download_count, is_verified
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, TRUE)
      `, [
        r.id, r.uploaderId, r.title, r.description, r.institution, r.field,
        r.level, r.subject, r.category, r.fileUrl, r.fileName, r.fileSize,
        r.fileType, r.downloads
      ]);
    }

    // 6. Seed Academic Groups (Communautés Universitaires)
    const groups = [
      {
        id: 'grp_001',
        name: 'Informatique & Tech Afrique Francophone',
        description: "La plus grande communauté d'étudiants développeurs, data scientists et passionnés de tech des universités et écoles d'ingénieurs du continent.",
        category: 'FILIERE',
        institution: 'Panafricain',
        country: 'Afrique Francophone',
        avatar: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=256&q=80',
        creatorId: 'usr_student_003',
        members: 340,
      },
      {
        id: 'grp_002',
        name: 'Candidats Bourses Internationales (Eiffel, Chevening, DAAD)',
        description: "Espace d'entraide stratégique pour la préparation des candidatures : relecture mutuelle de lettres de motivation, conseils pour les entretiens et partage d'opportunités vérifiées.",
        category: 'MOBILITE',
        institution: 'Panafricain',
        country: 'Afrique Francophone',
        avatar: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=256&q=80',
        creatorId: adminId,
        members: 512,
      },
      {
        id: 'grp_003',
        name: 'UCAD Dakar — Campus & Entraide Étudiante',
        description: "Communauté des étudiants de l'Université Cheikh Anta Diop : actualités des facultés, bourses du COUD, partages d'annales et logement étudiant à Dakar.",
        category: 'UNIVERSITE',
        institution: 'Université Cheikh Anta Diop (UCAD)',
        country: 'Sénégal',
        avatar: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=256&q=80',
        creatorId: modId,
        members: 680,
      }
    ];

    for (const g of groups) {
      await db.query(`
        INSERT INTO groups (
          id, name, description, category, institution, country, avatar_url,
          is_private, created_by_id, members_count
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE, $8, $9)
      `, [g.id, g.name, g.description, g.category, g.institution, g.country, g.avatar, g.creatorId, g.members]);

      await db.query(`
        INSERT INTO group_memberships (id, group_id, user_id, role, status)
        VALUES ($1, $2, $3, 'ADMIN', 'ACTIVE')
      `, [`gm_${g.id}_${g.creatorId}`, g.id, g.creatorId]);
    }

    // 7. Seed Posts in Feed
    const posts = [
      {
        id: 'post_001',
        authorId: adminId,
        category: 'SCHOLARSHIP',
        content: `🎓 Rappel important à tous les étudiants préparant un dossier pour la bourse France Excellence Eiffel 2026/2027 !

N'oubliez pas que vous ne candidatez PAS directement auprès de Campus France, mais obligatoirement via l'université d'accueil française qui sélectionne puis transmet votre candidature. Assurez-vous d'avoir pris contact avec le responsable pédagogique de la formation ciblée dès ce mois-ci.

Nous avons mis à votre disposition un guide de cadrage complet dans la bibliothèque CampusHub. Bon courage à toutes et à tous ! 🌍🚀`,
        likes: 47,
        comments: 6,
        shares: 12,
        pinned: true,
      },
      {
        id: 'post_002',
        authorId: 'usr_student_003',
        category: 'ACADEMIC',
        content: `Bonsoir la communauté ! 👋 Avec les camarades du club de code de l'UCAD, nous venons de finaliser et téléverser les annales corrigées d'Algorithmique L2 dans l'onglet Ressources.

Chaque algorithme de tri et de parcours d'arbres a été annoté pas-à-pas avec des schémas explicatifs. Si vous avez des questions sur la programmation dynamique ou la complexité asymptotique, n'hésitez pas à commenter ci-dessous ! 👇`,
        likes: 38,
        comments: 4,
        shares: 8,
        pinned: false,
      },
      {
        id: 'post_003',
        authorId: 'usr_student_004',
        category: 'INTERNSHIP',
        content: `Excellente opportunité pour nos camarades en informatique et télécoms : Orange Digital Center a ouvert ses candidatures pour les stages 2026 à Abidjan et Dakar avec indemnité.

J'ai mis la fiche détaillée dans le module Opportunités. Date limite dans 20 jours, préparez bien votre CV technique ! 💼✨`,
        likes: 29,
        comments: 3,
        shares: 9,
        pinned: false,
      },
      {
        id: 'post_004',
        authorId: 'usr_student_006',
        category: 'ADVICE',
        content: `Conseil pour tous les étudiants en Master qui rédigent leur mémoire de recherche actuellement : fixez-vous un objectif de 300 à 500 mots rédigés par jour plutôt que d'attendre l'inspiration d'un bloc de 10 heures le week-end.

Utilisez un gestionnaire de références bibliographiques comme Zotero dès le premier article lu. Vous gagnerez des dizaines d'heures lors du rendu final ! 📚💡`,
        likes: 44,
        comments: 5,
        shares: 15,
        pinned: false,
      }
    ];

    for (const p of posts) {
      await db.query(`
        INSERT INTO posts (
          id, author_id, content, category, likes_count, comments_count, shares_count, is_pinned
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [p.id, p.authorId, p.content, p.category, p.likes, p.comments, p.shares, p.pinned]);
    }

    // Seed sample comments
    await db.query(`
      INSERT INTO post_comments (id, post_id, author_id, content)
      VALUES ($1, $2, $3, $4)
    `, ['cmt_001', 'post_002', 'usr_student_006', "Un travail formidable Mariama ! La clarté des explications sur les arbres AVL va sauver beaucoup de camarades pour les partiels."]);

    await db.query(`
      INSERT INTO post_comments (id, post_id, author_id, content)
      VALUES ($1, $2, $3, $4)
    `, ['cmt_002', 'post_002', 'usr_student_004', "Merci beaucoup pour le partage ! Est-ce que les corrigés sont également téléchargeables en format PDF ?"]);

    await db.query(`
      INSERT INTO post_comments (id, post_id, author_id, parent_id, content)
      VALUES ($1, $2, $3, $4, $5)
    `, ['cmt_003', 'post_002', 'usr_student_003', 'cmt_002', "Oui Jean-Philippe ! Le PDF complet est disponible directement dans l'onglet Ressources du menu avec téléchargement en un clic."]);

    // Seed conversation and messages
    const convId = 'conv_demo_001';
    await db.query(`
      INSERT INTO conversations (id, type, title)
      VALUES ($1, 'DIRECT', 'Mariama Diallo & Jean-Philippe Kouamé')
    `, [convId]);

    await db.query(`
      INSERT INTO conversation_participants (id, conversation_id, user_id)
      VALUES ($1, $2, $3), ($4, $5, $6)
    `, ['cp_001', convId, 'usr_student_003', 'cp_002', convId, 'usr_student_004']);

    await db.query(`
      INSERT INTO messages (id, conversation_id, sender_id, content, is_read)
      VALUES
        ($1, $2, $3, 'Salut Mariama, j''ai vu ton post sur les annales corrigées d''algorithmique. Bravo pour le travail !', TRUE),
        ($4, $5, $6, 'Merci Jean-Philippe ! J''espère que cela sera utile aux camarades. Comment se passe la préparation de ton dossier Eiffel ?', TRUE),
        ($7, $8, $9, 'Ça avance bien, je peaufine ma lettre de motivation pour Paris-Dauphine. Si tu as 5 minutes cette semaine pour un retour, ce serait super !', FALSE)
    `, [
      'msg_001', convId, 'usr_student_004',
      'msg_002', convId, 'usr_student_003',
      'msg_003', convId, 'usr_student_004'
    ]);

    // Seed notification
    await db.query(`
      INSERT INTO notifications (id, user_id, actor_id, type, title, message, link, is_read)
      VALUES ($1, $2, $3, 'MESSAGE', 'Nouveau message reçu', 'Jean-Philippe Kouamé vous a envoyé un message.', '/messages', FALSE)
    `, ['notif_001', 'usr_student_003', 'usr_student_004']);

    console.log('✅ CampusHub Africa seed data initialized successfully.');
  }
}
