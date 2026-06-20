const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Strip /server prefix from URL if present (due to Phusion Passenger routing)
app.use((req, res, next) => {
    if (req.url.startsWith('/server')) {
        req.url = req.url.replace('/server', '');
    }
    next();
});

// Serve static files
app.use('/server/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes (Registered with and without /api prefix for hosting compatibility)
const newsRoutes = require('./routes/newsRoutes');
const moduleRoutes = require('./routes/moduleRoutes');
const discussionRoutes = require('./routes/discussionRoutes');
const aiRoutes = require('./routes/aiRoutes');
const authRoutes = require('./routes/authRoutes');

// Routes with /api prefix
app.use('/api/news', newsRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api', aiRoutes);
app.use('/api', authRoutes);

// Fallback routes without /api prefix (for when Passenger mounts app at /api and strips it)
app.use('/news', newsRoutes);
app.use('/modules', moduleRoutes);
app.use('/discussions', discussionRoutes);
app.use('/', aiRoutes);
app.use('/', authRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 400).json({ 
        success: false,
        error: err.message || 'Terjadi kesalahan pada server' 
    });
});

const PORT = process.env.PORT || 5000;
// Run app.listen on local environment or production hosting (like cPanel/Passenger), but skip on Vercel
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server backend berjalan di port ${PORT}`);
        console.log(`Mode: MVC (Model-View-Controller)`);
    });
}

module.exports = app;