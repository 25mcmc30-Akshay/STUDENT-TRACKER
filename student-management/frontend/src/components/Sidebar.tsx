import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="sidebar">
            <h2>Student Portal</h2>
            <ul>
                <li><Link to="/">📊 Dashboard</Link></li>
                <li><Link to="/profile">👤 Profile</Link></li>
                <li><Link to="/marks">📊 Marks</Link></li>
                <li><Link to="/attendance">📅 Attendance</Link></li>
                <li><Link to="/study-planner">📖 Study Planner</Link></li>
                <li><Link to="/tasks">✅ Tasks</Link></li>
                <li><Link to="/schedule">📆 Schedule</Link></li>
                <li><Link to="/alerts">🔔 Alerts & Suggestions</Link></li>
            </ul>
            <button onClick={handleLogout} className="btn-secondary">Logout</button>
        </nav>
    );
}