import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db';

const router = express.Router();

router.post('/register', async (req, res) => {
    const { name, username, password, roll_number, class: className, email } = req.body;
    
    console.log('Registration attempt:', { name, username, roll_number, className, email });
    
    // Validate required fields
    if (!name || !username || !password || !roll_number || !className || !email) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    
    try {
        // Check if user already exists
        const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
        if ((existing as any[]).length > 0) {
            return res.status(400).json({ error: 'Username already taken' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert new user
        const [result] = await pool.query(
            'INSERT INTO users (username, password, name, roll_number, class, email) VALUES (?, ?, ?, ?, ?, ?)',
            [username, hashedPassword, name, roll_number, className, email]
        );
        
        console.log('User registered successfully:', username);
        res.status(201).json({ success: true, message: 'Registration successful' });
        
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    console.log('Login attempt:', username);
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }
    
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        const users = rows as any[];
        
        if (users.length === 0) {
            console.log('User not found:', username);
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const user = users[0];
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            console.log('Invalid password for user:', username);
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, username: user.username },
            process.env.JWT_SECRET || 'your_default_secret_key_change_this',
            { expiresIn: '7d' }
        );
        
        console.log('Login successful:', username);
        
        res.json({ 
            success: true, 
            token, 
            user: { 
                id: user.id, 
                username: user.username, 
                name: user.name 
            } 
        });
        
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed. Please try again.' });
    }
});

export default router;