import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Marks from './pages/Marks';
import Attendance from './pages/Attendance';
import StudyPlanner from './pages/StudyPlanner';
import Tasks from './pages/Tasks';
import Schedule from './pages/Schedule';
import Alerts from './pages/Alerts';
import Sidebar from './components/Sidebar';
import './styles/App.css';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<PrivateRoute><div className="app-container"><Sidebar /><div className="main-content"><Dashboard /></div></div></PrivateRoute>} />
                    <Route path="/profile" element={<PrivateRoute><div className="app-container"><Sidebar /><div className="main-content"><Profile /></div></div></PrivateRoute>} />
                    <Route path="/marks" element={<PrivateRoute><div className="app-container"><Sidebar /><div className="main-content"><Marks /></div></div></PrivateRoute>} />
                    <Route path="/attendance" element={<PrivateRoute><div className="app-container"><Sidebar /><div className="main-content"><Attendance /></div></div></PrivateRoute>} />
                    <Route path="/study-planner" element={<PrivateRoute><div className="app-container"><Sidebar /><div className="main-content"><StudyPlanner /></div></div></PrivateRoute>} />
                    <Route path="/tasks" element={<PrivateRoute><div className="app-container"><Sidebar /><div className="main-content"><Tasks /></div></div></PrivateRoute>} />
                    <Route path="/schedule" element={<PrivateRoute><div className="app-container"><Sidebar /><div className="main-content"><Schedule /></div></div></PrivateRoute>} />
                    <Route path="/alerts" element={<PrivateRoute><div className="app-container"><Sidebar /><div className="main-content"><Alerts /></div></div></PrivateRoute>} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;