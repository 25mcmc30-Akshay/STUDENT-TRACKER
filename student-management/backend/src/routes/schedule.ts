import express from 'express';
import pool from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM schedule_events WHERE user_id = ? ORDER BY date, time',
            [req.userId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch schedule' });
    }
});

export default router;