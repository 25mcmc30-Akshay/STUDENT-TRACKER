const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

router.post('/register', async (req, res) => {
    const { name, username, password, roll_number, class: className, email } = req.body;
    
    if (!name || !username || !password || !roll_number || !className || !email) {
        return res.status(400).json({ error: 'All fields required' });
    }
    
    try {
        const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Username already taken' });
        }
        
        const hashed = await bcrypt.hash(password, 10);
        await pool.query(
            'INSERT INTO users (username, password, name, roll_number, class, email) VALUES (?, ?, ?, ?, ?, ?)',
            [username, hashed, name, roll_number, className, email]
        );
        
        res.json({ success: true, message: 'Registration successful' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Registration failed' });
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }
    
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const user = rows[0];
        const match = await bcrypt.compare(password, user.password);
        
        if (!match) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const token = jwt.sign(
            { userId: user.id, username: user.username },
            process.env.JWT_SECRET || 'default_secret_key',
            { expiresIn: '7d' }
        );
        
        res.json({ 
            success: true, 
            token, 
            user: { id: user.id, username: user.username, name: user.name } 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Login failed' });
    }
});

module.exports = router;