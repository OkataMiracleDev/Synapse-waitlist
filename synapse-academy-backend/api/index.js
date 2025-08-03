require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path'); // For serving static files

const app = express();

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the public directory (adjust path to reach sibling folder)
app.use(express.static(path.join(__dirname, '../../public')));

// Rate limiting for API
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: 'Too many requests, please try again later.',
});
app.use('/api/waitlist', limiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

// Waitlist submission endpoint
app.post('/api/waitlist', async (req, res) => {
    const { email } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Valid email is required' });
    }

    try {
        const { error } = await supabase
            .from('waitlist')
            .insert([{ email: email.trim().toLowerCase() }]);

        if (error) {
            if (error.code === '23505') {
                return res.status(200).json({ message: 'You are already on the waitlist!' });
            }
            return res.status(500).json({ error: 'Something went wrong' });
        }

        return res.status(200).json({ message: 'Successfully added to the waitlist!' });
    } catch (err) {
        console.error('Error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
});

// Catch-all route to serve index.html for non-API requests
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public', 'index.html'));
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});