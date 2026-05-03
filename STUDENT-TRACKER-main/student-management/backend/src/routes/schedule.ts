import express from 'express';
import pool from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const userId = req.userId!;
        
        // Get events from schedule_events table (manually added classes/exams)
        const [scheduleEvents] = await pool.query(
            `SELECT 
                id, 
                event_type, 
                title, 
                DATE_FORMAT(date, '%Y-%m-%d') as date, 
                TIME_FORMAT(time, '%H:%i') as time, 
                location,
                'schedule' as source
             FROM schedule_events 
             WHERE user_id = ? 
             ORDER BY date, time`,
            [userId]
        );
        
        // Get study planner entries
        const [studyPlans] = await pool.query(
            `SELECT 
                id, 
                CASE 
                    WHEN topic = 'Exam' THEN 'exam'
                    ELSE 'class'
                END as event_type,
                subject as title, 
                DATE_FORMAT(study_date, '%Y-%m-%d') as date, 
                TIME_FORMAT(start_time, '%H:%i') as time, 
                CONCAT(IFNULL(location, ''), IF(topic = 'Exam', ' Exam', ' Class')) as location,
                'study_planner' as source
             FROM study_planner 
             WHERE user_id = ? 
             ORDER BY study_date, start_time`,
            [userId]
        );
        
        // Combine both arrays
        const allEvents = [...(scheduleEvents as any[]), ...(studyPlans as any[])];
        
        // Sort by date and time
        allEvents.sort((a, b) => {
            const dateCompare = a.date.localeCompare(b.date);
            if (dateCompare !== 0) return dateCompare;
            return a.time.localeCompare(b.time);
        });
        
        res.json(allEvents);
    } catch (err) {
        console.error('Error fetching schedule:', err);
        res.status(500).json({ error: 'Failed to fetch schedule: ' + (err as Error).message });
    }
});

router.post('/', authenticateToken, async (req: AuthRequest, res) => {
    const { event_type, title, date, time, location } = req.body;
    
    if (!event_type || !title || !date || !time) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    try {
        const [result] = await pool.query(
            `INSERT INTO schedule_events (user_id, event_type, title, date, time, location) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [req.userId, event_type, title, date, time, location || null]
        );
        
        res.json({ success: true, message: 'Event added successfully', id: (result as any).insertId });
    } catch (err) {
        console.error('Error adding event:', err);
        res.status(500).json({ error: 'Failed to add event' });
    }
});

router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM schedule_events WHERE id = ? AND user_id = ?',
            [req.params.id, req.userId]
        );
        
        if ((result as any).affectedRows === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        res.json({ success: true, message: 'Event deleted successfully' });
    } catch (err) {
        console.error('Error deleting event:', err);
        res.status(500).json({ error: 'Failed to delete event' });
    }
});

export default router;