require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('./config/db');

async function seed() {
  const email = 'shamindra343@gmail.com';
  const passwordHash = await bcrypt.hash('123456', 10);
  try {
    let [users] = await db.execute('SELECT user_id FROM users WHERE email = ?', [email]);
    let userId;
    if (users.length) {
      userId = users[0].user_id;
      await db.execute('UPDATE users SET name = ?, password = ?, role = ? WHERE user_id = ?',
        ['M. Shamindra', passwordHash, 'student', userId]);
      console.log('Updated demo student account.');
    } else {
      const [result] = await db.execute('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['M. Shamindra', email, passwordHash, 'student']);
      userId = result.insertId;
      console.log('Created demo student account.');
    }

    const [instructors] = await db.execute("SELECT user_id FROM users WHERE role = 'instructor' ORDER BY user_id LIMIT 1");
    let instructorId;
    if (instructors.length) instructorId = instructors[0].user_id;
    else {
      const [result] = await db.execute('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['LearnSphere Instructor', 'instructor@learnsphere.demo', passwordHash, 'instructor']);
      instructorId = result.insertId;
    }

    const subjects = [
      ['Python Programming', 'Learn Python fundamentals, variables, control flow, functions and practical problem solving.', 4],
      ['Database Management Systems', 'Understand SQL, relational databases, tables, keys, joins and database design.', 3],
      ['Web Development', 'Build responsive websites with HTML, CSS, JavaScript and introductory backend concepts.', 5]
    ];
    for (const [title, description, duration] of subjects) {
      const [existing] = await db.execute('SELECT course_id FROM courses WHERE title = ? AND instructor_id = ?', [title, instructorId]);
      if (!existing.length) await db.execute('INSERT INTO courses (title, description, instructor_id, price, duration) VALUES (?, ?, ?, 0, ?)', [title, description, instructorId, duration]);
    }
    console.log('Demo subjects are ready: Python Programming, DBMS and Web Development.');
    console.log('Login email: ' + email);
    console.log('Login password: 123456');
  } catch (error) {
    console.error('Demo setup failed:', error.message);
    process.exitCode = 1;
  } finally { await db.end(); }
}
seed();
