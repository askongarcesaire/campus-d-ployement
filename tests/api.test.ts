import { getDb, query, queryOne } from '../server/db.ts';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

async function runTests() {
  console.log('🧪 Starting CampusHub Africa Automated Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Database Initialization
    const db = await getDb();
    assert(db !== null, 'Database initialization (PGlite / PostgreSQL)');

    // 2. Admin account verification
    const adminUser = await queryOne('SELECT * FROM users WHERE email = $1', ['admin@campushub.africa']);
    assert(adminUser !== null && adminUser.role === 'ADMIN', 'Initial Admin account exists with ADMIN role');

    const adminPasswordMatch = await bcrypt.compare('Admin@CampusHub2026!', adminUser.password_hash);
    assert(adminPasswordMatch, 'Admin password hash verification with bcrypt');

    // 3. Student Registration & Password Hashing
    const testEmail = `test.student.${Date.now()}@ucad.sn`;
    const hashedPwd = await bcrypt.hash('SecretPass2026!', 10);
    const testUserId = `test_usr_${Date.now()}`;
    await query(`
      INSERT INTO users (id, email, password_hash, role, status, email_verified)
      VALUES ($1, $2, $3, 'STUDENT', 'ACTIVE', TRUE)
    `, [testUserId, testEmail, hashedPwd]);

    const createdUser = await queryOne('SELECT * FROM users WHERE id = $1', [testUserId]);
    assert(createdUser !== null && createdUser.email === testEmail, 'User registration persisted in database');

    // 4. Student Profile Creation & Modification
    await query(`
      INSERT INTO student_profiles (
        id, user_id, first_name, last_name, country, institution, field_of_study, academic_level
      ) VALUES ($1, $2, 'Khadija', 'Ba', 'Sénégal', 'UCAD Dakar', 'Informatique', 'Master 1')
    `, [`prof_${testUserId}`, testUserId]);

    await query(`
      UPDATE student_profiles SET headline = 'Passionnée IA & Open Source' WHERE user_id = $1
    `, [testUserId]);

    const updatedProfile = await queryOne('SELECT headline FROM student_profiles WHERE user_id = $1', [testUserId]);
    assert(updatedProfile?.headline === 'Passionnée IA & Open Source', 'Student profile update functionality');

    // 5. Post Creation & Anti-Duplicate Like
    const testPostId = `test_post_${Date.now()}`;
    await query(`
      INSERT INTO posts (id, author_id, content, category, likes_count)
      VALUES ($1, $2, 'Préparation des examens semestriels : qui a les TD de maths ?', 'ACADEMIC', 0)
    `, [testPostId, testUserId]);

    const postRecord = await queryOne('SELECT * FROM posts WHERE id = $1', [testPostId]);
    assert(postRecord !== null && postRecord.content.includes('Préparation'), 'Academic post created');

    // Insert Like
    await query(`
      INSERT INTO post_likes (id, post_id, user_id)
      VALUES ($1, $2, $3)
    `, [`pl_${Date.now()}`, testPostId, testUserId]);
    await query('UPDATE posts SET likes_count = likes_count + 1 WHERE id = $1', [testPostId]);

    const likedPost = await queryOne('SELECT likes_count FROM posts WHERE id = $1', [testPostId]);
    assert(likedPost?.likes_count === 1, 'Post like counter incremented');

    // Verify duplicate like constraint
    let duplicateRejected = false;
    try {
      await query(`
        INSERT INTO post_likes (id, post_id, user_id)
        VALUES ($1, $2, $3)
      `, [`pl_dup_${Date.now()}`, testPostId, testUserId]);
    } catch (_e) {
      duplicateRejected = true;
    }
    assert(duplicateRejected, 'Unique constraint prevents duplicate likes on post');

    // 6. Post Comment & Reply
    const commentId = `test_cmt_${Date.now()}`;
    await query(`
      INSERT INTO post_comments (id, post_id, author_id, content)
      VALUES ($1, $2, $3, 'Je peux te passer les fiches dès demain en amphi !')
    `, [commentId, testPostId, adminUser.id]);

    const commentRecord = await queryOne('SELECT * FROM post_comments WHERE id = $1', [commentId]);
    assert(commentRecord !== null, 'Comment recorded in database');

    // 7. Opportunity (Bourse) Creation & Status
    const oppId = `test_opp_${Date.now()}`;
    await query(`
      INSERT INTO opportunities (
        id, author_id, title, description, organization, country, category, status, is_verified
      ) VALUES ($1, $2, 'Bourse d Excellence Régionale CEDEAO 2026', 'Financement complet Master et Doctorat', 'CEDEAO', 'Multi-pays', 'SCHOLARSHIP_INTL', 'OPEN', TRUE)
    `, [oppId, adminUser.id]);

    const oppRecord = await queryOne('SELECT * FROM opportunities WHERE id = $1', [oppId]);
    assert(oppRecord !== null && oppRecord.is_verified === true, 'Verified scholarship opportunity created');

    // 8. Resource Library Download Counter
    const resId = `test_res_${Date.now()}`;
    await query(`
      INSERT INTO resources (
        id, uploader_id, title, institution, field_of_study, academic_level, subject, category, file_url, file_name, file_type, download_count
      ) VALUES ($1, $2, 'TD Algorithmes de Tri L2', 'UCAD', 'Informatique', 'L2', 'Algo', 'TUTORIAL_TD', '/uploads/td.pdf', 'td.pdf', 'application/pdf', 10)
    `, [resId, testUserId]);

    await query('UPDATE resources SET download_count = download_count + 1 WHERE id = $1', [resId]);
    const updatedRes = await queryOne('SELECT download_count FROM resources WHERE id = $1', [resId]);
    assert(updatedRes?.download_count === 11, 'Academic resource download count tracking');

    // 9. Reporting and Moderation System
    const reportId = `test_rep_${Date.now()}`;
    await query(`
      INSERT INTO reports (id, reporter_id, target_type, target_id, reason, details, status)
      VALUES ($1, $2, 'POST', $3, 'SPAM', 'Lien suspect publicitaire', 'PENDING')
    `, [reportId, testUserId, testPostId]);

    const repRecord = await queryOne('SELECT * FROM reports WHERE id = $1', [reportId]);
    assert(repRecord !== null && repRecord.status === 'PENDING', 'Report filed with PENDING status');

    await query(`
      UPDATE reports SET status = 'RESOLVED', resolution_note = 'Contenu examiné et validé' WHERE id = $1
    `, [reportId]);
    const resolvedRep = await queryOne('SELECT status FROM reports WHERE id = $1', [reportId]);
    assert(resolvedRep?.status === 'RESOLVED', 'Moderator report resolution transition');

    // 10. Direct Messaging Persistence
    const convId = `test_conv_${Date.now()}`;
    await query(`INSERT INTO conversations (id, type) VALUES ($1, 'DIRECT')`, [convId]);
    await query(`
      INSERT INTO conversation_participants (id, conversation_id, user_id)
      VALUES ($1, $2, $3), ($4, $5, $6)
    `, [`cp_1_${Date.now()}`, convId, testUserId, `cp_2_${Date.now()}`, convId, adminUser.id]);

    const msgId = `test_msg_${Date.now()}`;
    await query(`
      INSERT INTO messages (id, conversation_id, sender_id, content, is_read)
      VALUES ($1, $2, $3, 'Bonjour Professeur, j''ai une question concernant le mémoire.', FALSE)
    `, [msgId, convId, testUserId]);

    const msgRecord = await queryOne('SELECT * FROM messages WHERE id = $1', [msgId]);
    assert(msgRecord !== null && msgRecord.content.includes('Bonjour'), 'Direct message saved to database');

    // 11. Site Settings & Logo Customization
    const settings = await queryOne('SELECT * FROM site_settings WHERE id = $1', ['default']);
    assert(settings !== null, 'Site settings initialized in database');

    await query(`
      UPDATE site_settings SET logo_type = 'icon_shield', primary_color = 'emerald' WHERE id = 'default'
    `);
    const updatedSettings = await queryOne('SELECT logo_type, primary_color FROM site_settings WHERE id = $1', ['default']);
    assert(updatedSettings?.logo_type === 'icon_shield' && updatedSettings?.primary_color === 'emerald', 'Site settings customization persisted in database');

    // Clean up test post & test user
    await query('DELETE FROM users WHERE id = $1', [testUserId]);
    const userDeleted = await queryOne('SELECT id FROM users WHERE id = $1', [testUserId]);
    assert(userDeleted === null, 'Cascade cleanup of test user');

    if (db) await db.close();
  } catch (err: any) {
    console.error('Fatal test error:', err);
    failed++;
  }

  console.log(`\n========================================`);
  console.log(`🏁 Test Results: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
