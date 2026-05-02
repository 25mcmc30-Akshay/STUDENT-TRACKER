import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [rollNumber, setRollNumber] = useState('');
    const [classValue, setClassValue] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            if (isLogin) {
                await login(username, password);
                navigate('/');
            } else {
                await register({ name, username, password, roll_number: rollNumber, class: classValue, email });
                setIsLogin(true);
                alert('Registration successful! Please login.');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Something went wrong');
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1>📚 Student Management System</h1>
                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <>
                            <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required />
                            <input type="text" placeholder="Roll Number" value={rollNumber} onChange={e => setRollNumber(e.target.value)} required />
                            <input type="text" placeholder="Class" value={classValue} onChange={e => setClassValue(e.target.value)} required />
                            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
                        </>
                    )}
                    <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
                    <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                    <button type="submit" className="btn-primary">{isLogin ? 'Login' : 'Register'}</button>
                </form>
                <p className="toggle-link" onClick={() => setIsLogin(!isLogin)}>
                    {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
                </p>
                {error && <div className="error-message">{error}</div>}
                {isLogin && <div className="demo-credentials">Demo: student1 / pass123</div>}
            </div>
        </div>
    );
}