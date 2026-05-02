import express from 'express';
import pool from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM tasks WHERE user_id = ? ORDER BY due_date',
            [req.userId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

router.post('/', authenticateToken, async (req: AuthRequest, res) => {
    const { title, description, due_date, status } = req.body;
    if (!title || !due_date) {
        return res.status(400).json({ error: 'Title and due date required' });
    }
    try {
        await pool.query(
            'INSERT INTO tasks (user_id, title, description, due_date, status) VALUES (?, ?, ?, ?, ?)',
            [req.userId, title, description, due_date, status || 'pending']
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to add task' });
    }
});

router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
    const { title, description, due_date, status } = req.body;
    try {
        await pool.query(
            'UPDATE tasks SET title = ?, description = ?, due_date = ?, status = ? WHERE id = ? AND user_id = ?',
            [title, description, due_date, status, req.params.id, req.userId]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update task' });
    }
});

router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
        await pool.query('DELETE FROM tasks WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

export default router;