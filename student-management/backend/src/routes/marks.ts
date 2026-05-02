import express from 'express';
import pool from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const [marks] = await pool.query(
            'SELECT id, subject, marks_obtained, total_marks, exam_type FROM marks WHERE user_id = ? ORDER BY subject, exam_type',
            [req.userId]
        );
        const marksList = marks as any[];
        const subjectMap: any = {};
        marksList.forEach(m => {
            if (!subjectMap[m.subject]) subjectMap[m.subject] = { total: 0, count: 0 };
            subjectMap[m.subject].total += (m.marks_obtained / m.total_marks) * 100;
            subjectMap[m.subject].count++;
        });
        const averages = Object.keys(subjectMap).map(subject => ({
            subject,
            average: (subjectMap[subject].total / subjectMap[subject].count).toFixed(1)
        }));
        res.json({ marks: marksList, averages });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch marks' });
    }
});

router.post('/', authenticateToken, async (req: AuthRequest, res) => {
    const { subject, marks_obtained, total_marks, exam_type } = req.body;
    if (!subject || marks_obtained === undefined || !total_marks || !exam_type) {
        return res.status(400).json({ error: 'Missing fields' });
    }
    try {
        await pool.query(
            'INSERT INTO marks (user_id, subject, marks_obtained, total_marks, exam_type) VALUES (?, ?, ?, ?, ?)',
            [req.userId, subject, marks_obtained, total_marks, exam_type]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to add mark' });
    }
});

router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
        await pool.query('DELETE FROM marks WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete mark' });
    }
});

export default router;