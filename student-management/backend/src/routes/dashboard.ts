import express from 'express';
import pool from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const userId = req.userId!;
        console.log("Dashboard - userId:", userId);

        // Average marks
        const [marks] = await pool.query(
            'SELECT marks_obtained, total_marks FROM marks WHERE user_id = ?',
            [userId]
        );
        let totalPercent = 0;
        const marksArray = marks as any[];
        marksArray.forEach((m: any) => {
            if (m.total_marks > 0) {
                totalPercent += (m.marks_obtained / m.total_marks) * 100;
            }
        });
        const avgMarks = marksArray.length > 0 ? parseFloat((totalPercent / marksArray.length).toFixed(1)) : 0;

        // Average attendance
        const [attendance] = await pool.query(
            'SELECT attended, total FROM attendance WHERE user_id = ?',
            [userId]
        );
        let totalAttended = 0;
        let totalClasses = 0;
        const attendanceArray = attendance as any[];
        attendanceArray.forEach((a: any) => {
            totalAttended += a.attended || 0;
            totalClasses += a.total || 0;
        });
        const avgAttendance = totalClasses > 0 ? parseFloat(((totalAttended / totalClasses) * 100).toFixed(1)) : 0;

        // Pending tasks
        const [pendingTasks] = await pool.query(
            'SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND status = "pending"',
            [userId]
        );
        const pendingCount = (pendingTasks as any[])[0]?.count || 0;

        // Get today's date
        const today = new Date();
        const todayDateStr = today.toISOString().slice(0, 10);
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const todayDayName = dayNames[today.getDay()];
        
        console.log("Today's date:", todayDateStr);
        console.log("Today's day name:", todayDayName);

        // ========== GET TODAY'S CLASSES ==========
        let allTodayClasses: any[] = [];
        
        try {
            // 1. From schedule_events table (manual classes with today's exact date)
            const [scheduleClasses] = await pool.query(
                `SELECT title, time, location, DATE_FORMAT(date, '%Y-%m-%d') as date, 'Manual' as source
                 FROM schedule_events
                 WHERE user_id = ? AND event_type = 'class' AND date = ?
                 ORDER BY time`,
                [userId, todayDateStr]
            );
            console.log("Schedule classes found:", (scheduleClasses as any[]).length);
            allTodayClasses.push(...(scheduleClasses as any[]));
        } catch (err) {
            console.error("Error fetching schedule classes:", err);
        }
        
        try {
            // 2. From study_planner table - get all non-exam entries
            const [studyPlannerData] = await pool.query(
                `SELECT subject as title, start_time as time, location, DATE_FORMAT(study_date, '%Y-%m-%d') as date, topic
                 FROM study_planner
                 WHERE user_id = ? AND (topic != 'Exam' OR topic IS NULL)`,
                [userId]
            );
            
            console.log("Study planner entries found:", (studyPlannerData as any[]).length);
            
            // Filter by day name in JavaScript
            const studyClasses = (studyPlannerData as any[]).filter((item: any) => {
                if (!item.date) return false;
                const itemDate = new Date(item.date);
                const itemDayName = dayNames[itemDate.getDay()];
                return itemDayName === todayDayName;
            }).map((item: any) => ({
                title: item.title,
                time: item.time,
                location: item.location,
                date: item.date,
                source: 'Study Plan'
            }));
            
            console.log("Study planner classes for today:", studyClasses.length);
            allTodayClasses.push(...studyClasses);
        } catch (err) {
            console.error("Error fetching study planner classes:", err);
        }
        
        // Sort by time
        allTodayClasses.sort((a, b) => {
            const timeA = a.time || '';
            const timeB = b.time || '';
            return timeA.localeCompare(timeB);
        });

        // ========== GET UPCOMING EXAMS ==========
        let allUpcomingExams: any[] = [];
        
        try {
            // 1. From schedule_events table (manual exams)
            const [scheduleExams] = await pool.query(
                `SELECT title, DATE_FORMAT(date, '%Y-%m-%d') as date, time, location, 'Manual' as source
                 FROM schedule_events
                 WHERE user_id = ? AND event_type = 'exam' AND date >= ?
                 ORDER BY date LIMIT 5`,
                [userId, todayDateStr]
            );
            console.log("Schedule exams found:", (scheduleExams as any[]).length);
            allUpcomingExams.push(...(scheduleExams as any[]));
        } catch (err) {
            console.error("Error fetching schedule exams:", err);
        }
        
        try {
            // 2. From study_planner table (exam entries)
            const [studyExams] = await pool.query(
                `SELECT CONCAT(subject, ' Exam') as title, DATE_FORMAT(study_date, '%Y-%m-%d') as date, start_time as time, location, 'Study Plan' as source
                 FROM study_planner
                 WHERE user_id = ? AND topic = 'Exam' AND study_date >= ?
                 ORDER BY study_date LIMIT 5`,
                [userId, todayDateStr]
            );
            console.log("Study planner exams found:", (studyExams as any[]).length);
            allUpcomingExams.push(...(studyExams as any[]));
        } catch (err) {
            console.error("Error fetching study planner exams:", err);
        }
        
        // Sort exams by date (convert to string safely)
        allUpcomingExams.sort((a, b) => {
            const dateA = a.date ? String(a.date) : '';
            const dateB = b.date ? String(b.date) : '';
            return dateA.localeCompare(dateB);
        });

        // Subject-wise average marks
        const [subjectAvg] = await pool.query(
            `SELECT subject, AVG((marks_obtained * 100.0) / total_marks) as avg_percent
             FROM marks WHERE user_id = ? GROUP BY subject`,
            [userId]
        );

        const totalSubjects = (subjectAvg as any[]).length;

        console.log("Final - Today's Classes:", allTodayClasses.length);
        console.log("Final - Upcoming Exams:", allUpcomingExams.length);

        const responseData = {
            avgMarks: avgMarks,
            avgAttendance: avgAttendance,
            pendingTasks: pendingCount,
            totalSubjects: totalSubjects,
            upcomingExams: allUpcomingExams,
            todayClasses: allTodayClasses,
            subjectAvg: subjectAvg || []
        };

        res.json(responseData);
        
    } catch (err) {
        console.error('Dashboard error:', err);
        res.status(500).json({ error: 'Failed to fetch dashboard data: ' + (err as Error).message });
    }
});

export default router;