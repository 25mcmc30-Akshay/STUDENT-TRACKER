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

    // Function to allow only alphabets and spaces for full name
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Allow only letters, spaces, and dots
        const filteredValue = value.replace(/[^a-zA-Z\s\.]/g, '');
        setName(filteredValue);
    };

    // Function to allow only numbers and limit to 10 digits for roll number
    const handleRollNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Allow only numbers and limit to 10 digits
        const filteredValue = value.replace(/[^0-9][^a-zA-Z]\./g, '').slice(0, 10);
        setRollNumber(filteredValue);
    };

    // Function to allow only letters, numbers, and basic punctuation for class
    const handleClassChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Allow letters, numbers, spaces, and hyphens
        const filteredValue = value.replace(/[^a-zA-Z0-9\s\-]/g, '');
        setClassValue(filteredValue);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        // Additional validation
        if (!isLogin) {
            if (name.trim().length < 2) {
                setError('Full name must be at least 2 characters');
                return;
            }
            if (rollNumber.length > 10) {
                setError('Roll number must be less than 10 digits');
                return;
            }
            if (!classValue.trim()) {
                setError('Class is required');
                return;
            }
            if (!email.includes('@') || !email.includes('.')) {
                setError('Please enter a valid email address');
                return;
            }
        }
        
        if (!username.trim()) {
            setError('Username is required');
            return;
        }
        if (password.length < 4) {
            setError('Password must be at least 4 characters');
            return;
        }
        
        try {
            if (isLogin) {
                await login(username, password);
                navigate('/');
            } else {
                await register({ name, username, password, roll_number: rollNumber, class: classValue, email });
                setIsLogin(true);
                alert('Registration successful! Please login.');
                // Clear registration form
                setName('');
                setRollNumber('');
                setClassValue('');
                setEmail('');
                setUsername('');
                setPassword('');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Something went wrong');
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1>Student Management System</h1>
                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <>
                            <input 
                                type="text" 
                                placeholder="Full Name" 
                                value={name} 
                                onChange={handleNameChange} 
                                required 
                                title="Only alphabets and spaces allowed"
                            />
                            <input 
                                type="text" 
                                placeholder="Roll Number" 
                                value={rollNumber} 
                                onChange={handleRollNumberChange} 
                                required 
                                maxLength={10}
                                title="Maximum 10 digits allowed"
                            />
                            
                            <input 
                                type="text" 
                                placeholder="Class " 
                                value={classValue} 
                                onChange={handleClassChange} 
                                required 
                            />
                            <input 
                                type="email" 
                                placeholder="Email" 
                                value={email} 
                                onChange={e => setEmail(e.target.value)} 
                                required 
                            />
                        </>
                    )}
                    <input 
                        type="text" 
                        placeholder="Username" 
                        value={username} 
                        onChange={e => setUsername(e.target.value)} 
                        required 
                    />
                    <input 
                        type="password" 
                        placeholder="Password " 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        required 
                        minLength={4}
                    />
                    <button type="submit" className="btn-primary">
                        {isLogin ? 'Login' : 'Register'}
                    </button>
                </form>
                <p className="toggle-link" onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                    // Clear form when switching
                    if (!isLogin) {
                        setName('');
                        setRollNumber('');
                        setClassValue('');
                        setEmail('');
                        setUsername('');
                        setPassword('');
                    }
                }}>
                    {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
                </p>
                {error && <div className="error-message">{error}</div>}
            </div>
        </div>
    );
}