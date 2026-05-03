import express from 'express';
import pool from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all attendance records
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, subject, attended, total, percentage, semester FROM attendance WHERE user_id = ?',
            [req.userId]
        );
        res.json(rows);
    } catch (err) {
        console.error('Error fetching attendance:', err);
        res.status(500).json({ error: 'Failed to fetch attendance' });
    }
});

// Add new attendance record
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
    const { subject, attended, total, percentage, semester } = req.body;
    
    console.log('Received attendance data:', { subject, attended, total, percentage, semester });
    
    if (!subject || attended === undefined || total === undefined || !semester) {
        return res.status(400).json({ error: 'Missing fields: subject, attended, total, and semester are required' });
    }
    
    if (attended > total) {
        return res.status(400).json({ error: 'Attended classes cannot be more than total classes' });
    }
    
    try {
        const [result] = await pool.query(
            'INSERT INTO attendance (user_id, subject, attended, total, percentage, semester) VALUES (?, ?, ?, ?, ?, ?)',
            [req.userId, subject, attended, total, percentage, semester]
        );
        
        console.log('Attendance added successfully:', result);
        res.json({ success: true, message: 'Attendance added successfully' });
    } catch (err) {
        console.error('Error adding attendance:', err);
        res.status(500).json({ error: 'Failed to add attendance' });
    }
});

// Delete attendance record
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM attendance WHERE id = ? AND user_id = ?', 
            [req.params.id, req.userId]
        );
        
        if ((result as any).affectedRows === 0) {
            return res.status(404).json({ error: 'Attendance record not found' });
        }
        
        res.json({ success: true, message: 'Attendance deleted successfully' });
    } catch (err) {
        console.error('Error deleting attendance:', err);
        res.status(500).json({ error: 'Failed to delete attendance' });
    }
});

// Update attendance record (optional)
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
    const { subject, attended, total, percentage, semester } = req.body;
    
    if (!subject || attended === undefined || total === undefined || !semester) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (attended > total) {
        return res.status(400).json({ error: 'Attended classes cannot be more than total classes' });
    }
    
    try {
        const [result] = await pool.query(
            'UPDATE attendance SET subject = ?, attended = ?, total = ?, percentage = ?, semester = ? WHERE id = ? AND user_id = ?',
            [subject, attended, total, percentage, semester, req.params.id, req.userId]
        );
        
        if ((result as any).affectedRows === 0) {
            return res.status(404).json({ error: 'Attendance record not found' });
        }
        
        res.json({ success: true, message: 'Attendance updated successfully' });
    } catch (err) {
        console.error('Error updating attendance:', err);
        res.status(500).json({ error: 'Failed to update attendance' });
    }
});

export default router;