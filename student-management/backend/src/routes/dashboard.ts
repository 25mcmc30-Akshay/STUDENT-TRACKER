import express from 'express';
import pool from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const userId = req.userId!;
        const [marks] = await pool.query('SELECT marks_obtained, total_marks FROM marks WHERE user_id = ?', [userId]);
        let totalPercent = 0;
        (marks as any[]).forEach(m => { totalPercent += (m.marks_obtained / m.total_marks) * 100; });
        const avgMarks = (marks as any[]).length ? (totalPercent / (marks as any[]).length).toFixed(1) : 0;

        const [attendance] = await pool.query('SELECT percentage FROM attendance WHERE user_id = ?', [userId]);
        let totalAtt = 0;
        (attendance as any[]).forEach(a => { totalAtt += a.percentage; });
        const avgAttendance = (attendance as any[]).length ? (totalAtt / (attendance as any[]).length).toFixed(1) : 0;

        const [pendingTasks] = await pool.query('SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND status = "pending"', [userId]);
        const today = new Date().toISOString().slice(0,10);
        const nextWeek = new Date(Date.now() + 7*24*60*60*1000).toISOString().slice(0,10);
        const [upcomingExams] = await pool.query(
            'SELECT title, date FROM schedule_events WHERE user_id = ? AND event_type = "exam" AND date >= ? AND date <= ? ORDER BY date LIMIT 3',
            [userId, today, nextWeek]
        );
        const [subjectAvg] = await pool.query(
            `SELECT subject, AVG((marks_obtained * 100.0) / total_marks) as avg_percent 
             FROM marks WHERE user_id = ? GROUP BY subject`,
            [userId]
        );
        res.json({
            avgMarks: parseFloat(avgMarks as string),
            avgAttendance: parseFloat(avgAttendance as string),
            pendingTasks: (pendingTasks as any[])[0].count,
            upcomingExams,
            subjectAvg
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

export default router;