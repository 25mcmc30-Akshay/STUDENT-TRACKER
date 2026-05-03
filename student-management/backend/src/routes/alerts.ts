import express from 'express';
import pool from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const userId = req.userId!;
        console.log("Alerts called for USER ID:", userId);
        
        // Get marks data
        const [marks] = await pool.query(
            'SELECT subject, marks_obtained, total_marks FROM marks WHERE user_id = ?',
            [userId]
        );
        
        // Get attendance data with new fields
        const [attendance] = await pool.query(
            'SELECT subject, attended, total, percentage FROM attendance WHERE user_id = ?',
            [userId]
        );
        
        // Get pending tasks count
        const [pendingTasks] = await pool.query(
            'SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND status = "pending"',
            [userId]
        );

        const alerts: any[] = [];
        const suggestions: any[] = [];

        // Process attendance alerts and suggestions
        (attendance as any[]).forEach((att: any) => {
            const percentage = att.percentage;
            const neededToReach75 = Math.ceil((0.75 * att.total) - att.attended);
            
            if (percentage < 75) {
                alerts.push({ 
                    type: 'warning', 
                    message: `⚠️ Attendance in ${att.subject} is ${percentage}% (${att.attended}/${att.total} classes) - Below 75%` 
                });
                suggestions.push({ 
                    type: 'attendance', 
                    message: `📚 You need to attend ${neededToReach75} more classes in ${att.subject} to reach 75% attendance.` 
                });
            } else if (percentage < 85) {
                suggestions.push({ 
                    type: 'attendance', 
                    message: `✅ Good attendance in ${att.subject} (${percentage}%). Keep it up!` 
                });
            } else if (percentage >= 85) {
                suggestions.push({ 
                    type: 'attendance', 
                    message: `🎉 Excellent attendance in ${att.subject} (${percentage}%)! Great job!` 
                });
            }
        });

        // Process marks alerts and suggestions
        const subjectMap: any = {};
        (marks as any[]).forEach((m: any) => {
            const perc = (m.marks_obtained / m.total_marks) * 100;
            if (!subjectMap[m.subject]) subjectMap[m.subject] = [];
            subjectMap[m.subject].push(perc);
        });
        
        for (const subject in subjectMap) {
            const avg = subjectMap[subject].reduce((a: number, b: number) => a + b, 0) / subjectMap[subject].length;
            if (avg < 60) {
                alerts.push({ 
                    type: 'danger', 
                    message: `🔴 Average in ${subject} is ${avg.toFixed(1)}% - Needs immediate improvement` 
                });
                suggestions.push({ 
                    type: 'academic', 
                    message: `📖 Create a dedicated study schedule for ${subject} and consider seeking help from teachers.` 
                });
            } else if (avg < 75) {
                alerts.push({ 
                    type: 'info', 
                    message: `ℹ️ Average in ${subject} is ${avg.toFixed(1)}% - Could be improved` 
                });
                suggestions.push({ 
                    type: 'academic', 
                    message: `💡 Practice more problems in ${subject} and review your mistakes.` 
                });
            } else if (avg >= 90) {
                suggestions.push({ 
                    type: 'achievement', 
                    message: `🎉 Excellent performance in ${subject}! (${avg.toFixed(1)}%) Keep up the great work!` 
                });
            } else if (avg >= 75 && avg < 90) {
                suggestions.push({ 
                    type: 'academic', 
                    message: `👍 Good performance in ${subject} (${avg.toFixed(1)}%). Aim for 90%+ next time!` 
                });
            }
        }

        // Task-related alerts
        const pendingCount = (pendingTasks as any[])[0].count;
        if (pendingCount > 5) {
            alerts.push({ 
                type: 'task', 
                message: `📋 You have ${pendingCount} pending tasks! Prioritize completing them soon.` 
            });
        } else if (pendingCount > 3) {
            alerts.push({ 
                type: 'task', 
                message: `⚠️ You have ${pendingCount} pending tasks. Try to complete them this week.` 
            });
        } else if (pendingCount > 0 && pendingCount <= 3) {
            suggestions.push({ 
                type: 'task', 
                message: `✅ You have only ${pendingCount} pending task(s). Finish them to stay on track!` 
            });
        } else if (pendingCount === 0) {
            suggestions.push({ 
                type: 'task', 
                message: `🎯 Great job! No pending tasks. Keep up the productivity!` 
            });
        }

        console.log(`Generated ${alerts.length} alerts and ${suggestions.length} suggestions`);
        res.json({ alerts, suggestions });
        
    } catch (err) {
        console.error('Alerts error:', err);
        res.status(500).json({ error: 'Failed to fetch alerts' });
    }
});

export default router;