import express from 'express';
import pool from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const userId = req.userId!;
        const [marks] = await pool.query(
            'SELECT subject, marks_obtained, total_marks FROM marks WHERE user_id = ?',
            [userId]
        );
        const [attendance] = await pool.query(
            'SELECT subject, percentage FROM attendance WHERE user_id = ?',
            [userId]
        );
        const [pendingTasks] = await pool.query(
            'SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND status = "pending"',
            [userId]
        );

        const alerts: any[] = [];
        const suggestions: any[] = [];

        (attendance as any[]).forEach((att: any) => {
            if (att.percentage < 75) {
                alerts.push({ type: 'warning', message: `⚠️ Attendance in ${att.subject} is ${att.percentage}% (below 75%)` });
                suggestions.push({ type: 'attendance', message: `📚 Focus on attending ${att.subject} classes regularly.` });
            } else if (att.percentage < 85) {
                suggestions.push({ type: 'attendance', message: `✅ Good attendance in ${att.subject} (${att.percentage}%). Keep it up!` });
            }
        });

        const subjectMap: any = {};
        (marks as any[]).forEach((m: any) => {
            const perc = (m.marks_obtained / m.total_marks) * 100;
            if (!subjectMap[m.subject]) subjectMap[m.subject] = [];
            subjectMap[m.subject].push(perc);
        });
        for (const subject in subjectMap) {
            const avg = subjectMap[subject].reduce((a: number, b: number) => a + b, 0) / subjectMap[subject].length;
            if (avg < 60) {
                alerts.push({ type: 'danger', message: `🔴 Average in ${subject} is ${avg.toFixed(1)}% - Needs improvement` });
                suggestions.push({ type: 'academic', message: `📖 Create a study schedule for ${subject} and seek help.` });
            } else if (avg < 75) {
                alerts.push({ type: 'info', message: `ℹ️ Average in ${subject} is ${avg.toFixed(1)}% - Could be improved` });
                suggestions.push({ type: 'academic', message: `💡 Practice more in ${subject}.` });
            } else if (avg >= 90) {
                suggestions.push({ type: 'achievement', message: `🎉 Excellent in ${subject}! (${avg.toFixed(1)}%)` });
            }
        }

        if ((pendingTasks as any[])[0].count > 3) {
            alerts.push({ type: 'task', message: `📋 You have ${(pendingTasks as any[])[0].count} pending tasks. Prioritize them.` });
        }

        res.json({ alerts, suggestions });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch alerts' });
    }
});

export default router;