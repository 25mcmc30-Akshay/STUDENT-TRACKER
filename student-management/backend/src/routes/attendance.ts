import express from 'express';
import pool from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, subject, percentage, semester FROM attendance WHERE user_id = ?',
            [req.userId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch attendance' });
    }
});

router.post('/', authenticateToken, async (req: AuthRequest, res) => {
    const { subject, percentage, semester } = req.body;
    if (!subject || percentage === undefined || !semester) {
        return res.status(400).json({ error: 'Missing fields' });
    }
    try {
        await pool.query(
            'INSERT INTO attendance (user_id, subject, percentage, semester) VALUES (?, ?, ?, ?)',
            [req.userId, subject, percentage, semester]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to add attendance' });
    }
});

router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
        await pool.query('DELETE FROM attendance WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete attendance' });
    }
});

export default router;