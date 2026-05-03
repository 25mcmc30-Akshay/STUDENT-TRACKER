import express from 'express';
import pool from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all tasks
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, title, description, DATE_FORMAT(due_date, "%Y-%m-%d") as due_date, status FROM tasks WHERE user_id = ? ORDER BY FIELD(status, "pending", "completed"), due_date',
            [req.userId]
        );
        res.json(rows);
    } catch (err) {
        console.error('Error fetching tasks:', err);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// Add new task
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
    const { title, description, due_date, status } = req.body;
    
    if (!title || !due_date) {
        return res.status(400).json({ error: 'Title and due date required' });
    }
    
    try {
        const [result] = await pool.query(
            'INSERT INTO tasks (user_id, title, description, due_date, status) VALUES (?, ?, ?, ?, ?)',
            [req.userId, title, description, due_date, status || 'pending']
        );
        res.json({ success: true, id: (result as any).insertId });
    } catch (err) {
        console.error('Error adding task:', err);
        res.status(500).json({ error: 'Failed to add task' });
    }
});

// Update task status (for complete button)
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
    const { status } = req.body;
    const taskId = req.params.id;
    
    console.log(`Updating task ${taskId} to status: ${status}`);
    
    try {
        const [result] = await pool.query(
            'UPDATE tasks SET status = ? WHERE id = ? AND user_id = ?',
            [status, taskId, req.userId]
        );
        
        if ((result as any).affectedRows === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        res.json({ success: true, message: 'Task updated successfully' });
    } catch (err) {
        console.error('Error updating task:', err);
        res.status(500).json({ error: 'Failed to update task' });
    }
});

// Delete task
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM tasks WHERE id = ? AND user_id = ?',
            [req.params.id, req.userId]
        );
        
        if ((result as any).affectedRows === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        res.json({ success: true });
    } catch (err) {
        console.error('Error deleting task:', err);
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

export default router;