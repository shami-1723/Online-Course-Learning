const express = require('express');
const db = require('../config/db');
const { requireLogin, requireRole } = require('../middleware/auth');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT c.course_id, c.title, c.description, c.price, c.duration, c.instructor_id,
              u.name AS instructor_name,
              (SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.course_id) AS lesson_count
       FROM courses c JOIN users u ON c.instructor_id = u.user_id ORDER BY c.course_id DESC`
    );
    res.json(rows);
  } catch (e) { console.error(e); res.status(500).json({ message: 'Could not load courses.' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT c.*, u.name AS instructor_name FROM courses c
       JOIN users u ON c.instructor_id = u.user_id WHERE c.course_id = ?`, [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Course not found.' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ message: 'Could not load course.' }); }
});

router.post('/', requireLogin, requireRole('instructor'), async (req, res) => {
  try {
    const { title, description, price, duration } = req.body;
    if (!title) return res.status(400).json({ message: 'Course title is required.' });
    const [r] = await db.execute(
      'INSERT INTO courses (title, description, instructor_id, price, duration) VALUES (?, ?, ?, ?, ?)',
      [title, description || '', req.session.user.user_id, Number(price) || 0, Number(duration) || 1]
    );
    res.status(201).json({ message: 'Course created.', course_id: r.insertId });
  } catch (e) { console.error(e); res.status(500).json({ message: 'Could not create course.' }); }
});

router.delete('/:id', requireLogin, requireRole('instructor'), async (req, res) => {
  try {
    const [r] = await db.execute('DELETE FROM courses WHERE course_id = ? AND instructor_id = ?',
      [req.params.id, req.session.user.user_id]);
    if (!r.affectedRows) return res.status(404).json({ message: 'Course not found or not yours.' });
    res.json({ message: 'Course deleted.' });
  } catch (e) { res.status(500).json({ message: 'Could not delete course.' }); }
});

module.exports = router;
