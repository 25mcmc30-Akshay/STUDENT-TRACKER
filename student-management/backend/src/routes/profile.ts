import express from 'express';
import pool from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, username, name, roll_number, class, email FROM users WHERE id = ?',
            [req.userId]
        );
        const user = (rows as any[])[0];
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

export default router;