// import { useEffect, useState } from 'react';
// import api from '../api';
// import { Bar } from 'react-chartjs-2';
// import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
// import { color } from 'chart.js/helpers';

// ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// export default function Dashboard() {
//     const [data, setData] = useState<any>(null);

//     useEffect(() => {
//         api.get('/dashboard').then(res => setData(res.data));
//     }, []);

//     if (!data) return <div>Loading dashboard...</div>;

//     const chartData = {
//         labels: data.subjectAvg.map((s: any) => s.subject),
//         datasets: [{
//             label: 'Average Score (%)',
//             data: data.subjectAvg.map((s: any) => parseFloat(s.avg_percent).toFixed(1)),
//             backgroundColor: 'rgb(255, 255, 255)',
//             borderColor: 'rgb(255, 255, 255)',
//             borderWidth: 1
//         }]
//     };

//     return (
//         <div>
//             <h2>📈 Performance Dashboard</h2>
//             <div className="stats-cards">
//                 <div className="stat-card"><h3>📊 Average Marks</h3><p>{data.avgMarks}%</p></div>
//                 <div className="stat-card"><h3>📅 Overall Attendance</h3><p>{data.avgAttendance}%</p></div>
//                 <div className="stat-card"><h3>✅ Pending Tasks</h3><p>{data.pendingTasks}</p></div>
//                 <div className="stat-card"><h3>📝 Upcoming Exams</h3><p>{data.upcomingExams.map((e: any) => e.title + ' (' + e.date + ')').join('<br>') || 'None'}</p></div>
//             </div>
//             <div className="chart-container"><Bar data={chartData} /></div>
//         </div>
//     );
// }

import { useEffect, useState } from 'react';
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
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        api.get('/dashboard').then(res => setData(res.data));
    }, []);

    if (!data) return <div>Loading dashboard...</div>;

    const chartData = {
        labels: data.subjectAvg.map((s: any) => s.subject),
        datasets: [{
            label: 'Average Score (%)',
            data: data.subjectAvg.map((s: any) => parseFloat(s.avg_percent).toFixed(1)),
            backgroundColor: 'rgba(0, 47, 255, 0.6)',
            borderColor: 'rgb(0, 47, 255)',
            borderWidth: 1
        }]
    };

    const options: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
            y: {
                ticks: {
                    color: '#000000',
                    font: { size: 12, weight: 'bold' }
                },
                title: {
                    display: true,
                    text: 'Percentage (%)',
                    color: '#000000',
                    font: { size: 14, weight: 'bold' }
                },
                grid: {
                    color: '#ecf0f1'
                }
            },
            x: {
                ticks: {
                    color: '#000000',
                    font: { size: 12, weight: 'bold' }
                },
                title: {
                    display: true,
                    text: 'Subjects',
                    color: '#000000',
                    font: { size: 14, weight: 'bold' }
                },
                grid: {
                    color: '#ffffff'
                }
            }
        },
        plugins: {
            legend: {
                labels: {
                    color: '#000000',
                    font: { size: 12 }
                }
            },
            tooltip: {
                bodyColor: '#ffffff',
                titleColor: '#e3e3e3'
            }
        }
    };

    return (
        <div>
            <h2>📈 Performance Dashboard</h2>
            <div className="stats-cards">
                <div className="stat-card"><h3>📊 Average Marks</h3><p>{data.avgMarks}%</p></div>
                <div className="stat-card"><h3>📅 Overall Attendance</h3><p>{data.avgAttendance}%</p></div>
                <div className="stat-card"><h3>✅ Pending Tasks</h3><p>{data.pendingTasks}</p></div>
                <div className="stat-card"><h3>📝 Upcoming Exams</h3>
                    <p dangerouslySetInnerHTML={{ __html: data.upcomingExams.map((e: any) => e.title + ' (' + e.date + ')').join('<br>') || 'None' }}></p>
                </div>
            </div>
            <div className="chart-container">
                <Bar data={chartData} options={options} />
            </div>
        </div>
    );
}






