const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files
app.use('/admin/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const newsRoutes = require('./routes/newsRoutes');
const moduleRoutes = require('./routes/moduleRoutes');
const discussionRoutes = require('./routes/discussionRoutes');
const aiRoutes = require('./routes/aiRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/api/news', newsRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api', aiRoutes); // For analyze-image and generate-quiz
app.use('/api', authRoutes); // For login, register, update-profile

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 400).json({ 
        success: false,
        error: err.message || 'Terjadi kesalahan pada server' 
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server backend berjalan di http://localhost:${PORT}`);
    console.log(`Mode: MVC (Model-View-Controller)`);
});
