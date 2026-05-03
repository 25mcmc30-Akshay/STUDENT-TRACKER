import express from 'express';
import pool from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM study_planner WHERE user_id = ? ORDER BY study_date, start_time',
            [req.userId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch study planner' });
    }
});

router.post('/', authenticateToken, async (req: AuthRequest, res) => {
    const { subject, study_date, start_time, end_time, topic } = req.body;
    if (!subject || !study_date || !start_time || !end_time) {
        return res.status(400).json({ error: 'Missing fields' });
    }
    try {
        await pool.query(
            'INSERT INTO study_planner (user_id, subject, study_date, start_time, end_time, topic) VALUES (?, ?, ?, ?, ?, ?)',
            [req.userId, subject, study_date, start_time, end_time, topic]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to add study session' });
    }
});

router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
        await pool.query('DELETE FROM study_planner WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete study session' });
    }
});

export default router;