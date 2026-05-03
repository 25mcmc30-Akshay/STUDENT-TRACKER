import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Function to check if link is active
    const isActive = (path: string) => {
        return location.pathname === path;
    };

    return (
        <nav className="sidebar">
            <h2>Student Portal</h2>
            <ul>
                <li>
                    <Link 
                        to="/" 
                        style={isActive('/') ? { background: '#667eea', color: 'white' } : {}}
                    >
                        📊 Dashboard
                    </Link>
                </li>
                <li>
                    <Link 
                        to="/profile" 
                        style={isActive('/profile') ? { background: '#667eea', color: 'white' } : {}}
                    >
                        👤 Profile
                    </Link>
                </li>
                <li>
                    <Link 
                        to="/marks" 
                        style={isActive('/marks') ? { background: '#667eea', color: 'white' } : {}}
                    >
                        📊 Marks
                    </Link>
                </li>
                <li>
                    <Link 
                        to="/attendance" 
                        style={isActive('/attendance') ? { background: '#667eea', color: 'white' } : {}}
                    >
                        📅 Attendance
                    </Link>
                </li>
                <li>
                    <Link 
                        to="/study-planner" 
                        style={isActive('/study-planner') ? { background: '#667eea', color: 'white' } : {}}
                    >
                        📖 Study Planner
                    </Link>
                </li>
                <li>
                    <Link 
                        to="/tasks" 
                        style={isActive('/tasks') ? { background: '#667eea', color: 'white' } : {}}
                    >
                        ✅ Tasks
                    </Link>
                </li>
                <li>
                    <Link 
                        to="/schedule" 
                        style={isActive('/schedule') ? { background: '#667eea', color: 'white' } : {}}
                    >
                        📆 Schedule
                    </Link>
                </li>
                <li>
                    <Link 
                        to="/alerts" 
                        style={isActive('/alerts') ? { background: '#667eea', color: 'white' } : {}}
                    >
                        🔔 Alerts & Suggestions
                    </Link>
                </li>
            </ul>
            <button onClick={handleLogout} className="btn-secondary">Logout</button>
        </nav>
    );
}