import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartOptions
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState<any>({
        avgMarks: 0,
        avgAttendance: 0,
        pendingTasks: 0,
        totalSubjects: 0,
        upcomingExams: [],
        todayClasses: [],
        subjectAvg: []
    });
    const [alerts, setAlerts] = useState<any[]>([]);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                setLoading(true);
                const res = await api.get('/dashboard');
                console.log('Dashboard API Response:', res.data);
                
                // Set data with fallback values
                setDashboardData({
                    avgMarks: res.data.avgMarks || 0,
                    avgAttendance: res.data.avgAttendance || 0,
                    pendingTasks: res.data.pendingTasks || 0,
                    totalSubjects: res.data.totalSubjects || 0,
                    upcomingExams: res.data.upcomingExams || [],
                    todayClasses: res.data.todayClasses || [],
                    subjectAvg: res.data.subjectAvg || []
                });
                setError('');
            } catch (error: any) {
                console.error('Error fetching dashboard:', error);
                setError(error.response?.data?.error || 'Failed to load dashboard');
            } finally {
                setLoading(false);
            }
        };
        
        const fetchAlerts = async () => {
            try {
                const res = await api.get('/alerts');
                setAlerts(res.data.alerts || []);
                setSuggestions(res.data.suggestions || []);
            } catch (error) {
                console.error('Error fetching alerts:', error);
            }
        };
        
        fetchDashboard();
        fetchAlerts();
    }, []);

    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading dashboard...</div>;
    if (error) return <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>Error: {error}</div>;

    const chartData = {
        labels: dashboardData.subjectAvg?.map((s: any) => s.subject) || [],
        datasets: [{
            label: 'Average Score (%)',
            data: dashboardData.subjectAvg?.map((s: any) => parseFloat(s.avg_percent).toFixed(1)) || [],
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            borderRadius: 5,
            barPercentage: 0.7
        }]
    };

    const options: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: true,
        onClick: () => navigate('/marks'),
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                ticks: { color: '#000000', font: { size: 18, weight: 'bold' }, stepSize: 20 },
                title: { display: true, text: 'Percentage (%)', color: '#000000', font: { size: 18, weight: 'bold' } }
            },
            x: {
                ticks: { color: '#000000', font: { size: 18, weight: 'bold' } },
                title: { display: true, text: 'Subjects', color: '#000000', font: { size: 18, weight: 'bold' } }
            }
        },
        plugins: {
            legend: { labels: { color: '#000000', font: { size: 18 } }, position: 'top' }
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2 style={{ fontSize: '30px', marginBottom: '20px' }}>📈 Performance Dashboard</h2>
            
            {/* Row 1: 4 Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
                <div style={{ background: 'white', padding: '20px', borderRadius: '10px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} onClick={() => navigate('/marks')}>
                    <p style={{ textAlign: 'center', fontSize: '30px', fontWeight: 'bold', margin: 0, color: '#303030' }}>📊 Average Marks</p>
                    <p style={{ textAlign: 'center', fontSize: '30px', fontWeight: 'bold', margin: '10px 0 0 0', color: '#303030' }}>{dashboardData.avgMarks}%</p>
                </div>
                
                <div style={{ background: 'white', padding: '20px', borderRadius: '10px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} onClick={() => navigate('/attendance')}>
                    <h3 style={{ textAlign: 'center', fontSize: '30px', fontWeight: 'bold', margin: 0, color: '#303030' }}>📅 Average Attendance</h3>
                    <p style={{ textAlign: 'center', fontSize: '30px', fontWeight: 'bold', margin: '10px 0 0 0', color: '#303030' }}>{dashboardData.avgAttendance}%</p>
                </div>
                
                <div style={{ background: 'white', padding: '20px', borderRadius: '10px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} onClick={() => navigate('/tasks')}>
                    <h3 style={{ textAlign: 'center', fontSize: '30px', fontWeight: 'bold', margin: 0, color: '#303030' }}>✅ Pending Tasks</h3>
                    <p style={{ textAlign: 'center', fontSize: '30px', fontWeight: 'bold', margin: '10px 0 0 0', color: '#303030'}}>{dashboardData.pendingTasks}</p>
                </div>
                
                <div style={{ background: 'white', padding: '20px', borderRadius: '10px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} onClick={() => navigate('/profile')}>
                    <h3 style={{ textAlign: 'center', fontSize: '30px', fontWeight: 'bold', margin: 0, color: '#303030' }}>📚 Subjects</h3><br></br>
                    <p style={{ textAlign: 'center', fontSize: '30px', fontWeight: 'bold', margin: '10px 0 0 0', color: '#303030' }}>{dashboardData.totalSubjects}</p>
                </div>
            </div>

            {/* Row 2: 4 Information Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
                {/* Upcoming Exams */}
                <div style={{ background: '#FFF3E0', padding: '15px', borderRadius: '10px', height: '250px', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ textAlign: 'center', fontSize: '30px', fontWeight: 'bold', cursor: 'pointer', color: '#E65100' }} onClick={() => navigate('/schedule')}>📝 Upcoming Exams →</h3>
                    <div style={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold', flex: 1, overflowY: 'auto' }}>
                        {dashboardData.upcomingExams && dashboardData.upcomingExams.length > 0 ? (
                            dashboardData.upcomingExams.map((exam: any, index: number) => (
                                <div key={index} style={{ padding: '8px 0', borderBottom: '1px solid #eee', cursor: 'pointer' }} onClick={() => navigate('/schedule')}>
                                    <strong>{exam.title}</strong>

                                </div>
                            ))
                        ) : (
                            <p style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>No upcoming exams</p>
                        )}
                    </div>
                </div>

                {/* Today's Classes */}
                <div style={{ background: '#E3F2FD', padding: '15px', borderRadius: '10px', height: '250px', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ textAlign: 'center', fontSize: '30px', fontWeight: 'bold',cursor: 'pointer', color: '#1976D2' }} onClick={() => navigate('/schedule')}>📖 Today's Classes →</h3>
                    <div style={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold',flex: 1, overflowY: 'auto' }}>
                        {dashboardData.todayClasses && dashboardData.todayClasses.length > 0 ? (
                            dashboardData.todayClasses.map((class_: any, index: number) => (
                                <div key={index} style={{ padding: '8px 0', borderBottom: '1px solid #eee', cursor: 'pointer' }} onClick={() => navigate('/schedule')}>
                                    <strong>{class_.title}</strong>
                                    <div style={{ fontSize: '12px', color: '#666' }}>{class_.time}</div>
                                    {class_.location && <small>{class_.location}</small>}
                                </div>
                            ))
                        ) : (
                            <p style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>No classes today</p>
                        )}
                    </div>
                </div>

                {/* Alerts */}
                <div style={{ background: '#FFEBEE', padding: '15px', borderRadius: '10px', height: '250px', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{textAlign: 'center', fontSize: '30px', fontWeight: 'bold', cursor: 'pointer', color: '#C62828' }} onClick={() => navigate('/alerts')}>⚠️ Alerts →</h3>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {alerts && alerts.length > 0 ? (
                            alerts.map((alert: any, index: number) => (
                                <div key={index} style={{ padding: '8px', margin: '5px 0', background: '#fff', borderRadius: '5px', fontSize: '15px' }}>
                                    {alert.message}
                                </div>
                            ))
                        ) : (
                            <p style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>No alerts! Great job! 🎉</p>
                        )}
                    </div>
                </div>

                {/* Suggestions */}
                <div style={{ background: '#E8F5E9', padding: '15px', borderRadius: '10px', height: '250px', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ textAlign: 'center', fontSize: '30px', fontWeight: 'bold',cursor: 'pointer', color: '#2E7D32' }} onClick={() => navigate('/alerts')}>💡Suggestions →</h3>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {suggestions && suggestions.length > 0 ? (
                            suggestions.map((suggestion: any, index: number) => (
                                <div key={index} style={{ padding: '8px', margin: '5px 0', background: '#fff', borderRadius: '5px', fontSize: '15px' }}>
                                    {suggestion.message}
                                </div>
                            ))
                        ) : (
                            <p style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>Keep up the good work! 👍</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Chart Section */}
            {dashboardData.subjectAvg && dashboardData.subjectAvg.length > 0 ? (
                <div style={{ background: 'white', padding: '20px', borderRadius: '10px', cursor: 'pointer' }} onClick={() => navigate('/marks')}>
                    <h3 style={{ textAlign: 'center' }}>Subject-wise Performance ↗</h3>
                    <Bar data={chartData} options={options} />
                </div>
            ) : (
                <div style={{ background: 'white', padding: '40px', borderRadius: '10px', textAlign: 'center' }}>
                    <h3>Subject-wise Performance</h3>
                    <p>No marks data available. Add marks to see chart.</p>
                </div>
            )}
        </div>
    );
}