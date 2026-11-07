const express = require('express');
const db = require('../config/db');
const { requireLogin, requireRole } = require('../middleware/auth');
const router = express.Router();

router.post('/', requireLogin, requireRole('student'), async (req, res) => {
  try {
    const { course_id } = req.body;
    await db.execute(
      `INSERT INTO enrollments (user_id, course_id, enrollment_date, progress, status)
       VALUES (?, ?, CURDATE(), 0, 'Active')`,
      [req.session.user.user_id, course_id]
    );
    res.status(201).json({ message: 'Successfully enrolled.' });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'You are already enrolled in this course.' });
    console.error(e); res.status(500).json({ message: 'Could not enrol. Check that the course exists.' });
  }
});

router.get('/mine', requireLogin, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT e.enrollment_id, e.course_id, e.enrollment_date, e.progress, e.status,
              c.title, c.description, c.duration
       FROM enrollments e JOIN courses c ON e.course_id = c.course_id
       WHERE e.user_id = ? ORDER BY e.enrollment_id DESC`, [req.session.user.user_id]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ message: 'Could not load enrolments.' }); }
});

router.patch('/:id/progress', requireLogin, requireRole('student'), async (req, res) => {
  try {
    const progress = Math.max(0, Math.min(100, Number(req.body.progress) || 0));
    const [r] = await db.execute(
      `UPDATE enrollments SET progress = ?, status = ? WHERE enrollment_id = ? AND user_id = ?`,
      [progress, progress === 100 ? 'Completed' : 'Active', req.params.id, req.session.user.user_id]
    );
    if (!r.affectedRows) return res.status(404).json({ message: 'Enrolment not found.' });
    res.json({ message: 'Progress updated.', progress });
  } catch (e) { res.status(500).json({ message: 'Could not update progress.' }); }
});

module.exports = router;
