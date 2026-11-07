const express = require('express');
const db = require('../config/db');
const { requireLogin, requireRole } = require('../middleware/auth');
const router = express.Router();

router.get('/course/:courseId', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM lessons WHERE course_id = ? ORDER BY sequence_no, lesson_id', [req.params.courseId]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ message: 'Could not load lessons.' }); }
});

router.post('/', requireLogin, requireRole('instructor'), async (req, res) => {
  try {
    const { course_id, lesson_title, content, video_url, sequence_no } = req.body;
    const [owned] = await db.execute('SELECT course_id FROM courses WHERE course_id = ? AND instructor_id = ?',
      [course_id, req.session.user.user_id]);
    if (!owned.length) return res.status(403).json({ message: 'You can only add lessons to your own courses.' });
    const [r] = await db.execute(
      'INSERT INTO lessons (course_id, lesson_title, content, video_url, sequence_no) VALUES (?, ?, ?, ?, ?)',
      [course_id, lesson_title, content || '', video_url || '', Number(sequence_no) || 1]
    );
    res.status(201).json({ message: 'Lesson added.', lesson_id: r.insertId });
  } catch (e) { console.error(e); res.status(500).json({ message: 'Could not add lesson.' }); }
});

module.exports = router;
