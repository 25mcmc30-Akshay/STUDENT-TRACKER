import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import marksRoutes from './routes/marks';
import attendanceRoutes from './routes/attendance';
import studyPlannerRoutes from './routes/studyPlanner';
import tasksRoutes from './routes/tasks';
import scheduleRoutes from './routes/schedule';
import alertsRoutes from './routes/alerts';
import dashboardRoutes from './routes/dashboard';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/marks', marksRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/study-planner', studyPlannerRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});