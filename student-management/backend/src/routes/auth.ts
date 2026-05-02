import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db';

const router = express.Router();

router.post('/register', async (req, res) => {
    const { name, username, password, roll_number, class: className, email } = req.body;
    if (!name || !username || !password || !roll_number || !className || !email) {
        return res.status(400).json({ error: 'All fields required' });
    }
    try {
        const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
        if ((existing as any[]).length > 0) {
            return res.status(400).json({ error: 'Username already taken' });
        }
        const hashed = await bcrypt.hash(password, 10);
        await pool.query(
            'INSERT INTO users (username, password, name, roll_number, class, email) VALUES (?, ?, ?, ?, ?, ?)',
            [username, hashed, name, roll_number, className, email]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Registration failed' });
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        const users = rows as any[];
        if (users.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
        const user = users[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: 'Invalid credentials' });
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
        res.json({ success: true, token, user: { id: user.id, username: user.username, name: user.name } });
    } catch (err) {
        res.status(500).json({ error: 'Login failed' });
    }
});

export default router;