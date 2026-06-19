const db = require('../config/db');
const fs = require('fs');
const path = require('path');

const deleteLocalFile = (filePath) => {
    if (!filePath || filePath.startsWith('http')) return;
    
    // Convert URL path to local file path
    // Example: /admin/uploads/news/img.jpg -> uploads/news/img.jpg
    const relativePath = filePath.replace('/admin/uploads/', 'uploads/');
    const fullPath = path.join(__dirname, '..', relativePath);
    
    if (fs.existsSync(fullPath)) {
        try {
            fs.unlinkSync(fullPath);
        } catch (err) {
            console.error('Gagal menghapus file lokal:', err.message);
        }
    }
};

exports.getAllNews = async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT id, image, title, category, post_date, long_desc FROM news ORDER BY post_date DESC'
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getNewsById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.execute('SELECT * FROM news WHERE id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Berita tidak ditemukan" });
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createNews = async (req, res) => {
    try {
        const { title, category, post_date, long_desc } = req.body;
        let userId = req.body.userId;
        if (Array.isArray(userId)) {
            userId = userId[0];
        }

        if (!userId || userId === 'undefined' || userId === 'null') {
            userId = null;
        }

        if (!title || !category || !post_date || !long_desc) {
            return res.status(400).json({ error: 'Field title, category, post_date, dan long_desc wajib diisi' });
        }
        
        let imagePath = null;
        if (req.file) {
            // Path yang disimpan ke DB disesuaikan dengan static serve di server.js
            imagePath = `/admin/uploads/news/${req.file.filename}`;
        }
        
        const [result] = await db.execute(
            'INSERT INTO news (userId, image, title, category, post_date, long_desc) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, imagePath, title, category, post_date, long_desc]
        );

        res.json({ 
            success: true, 
            message: "Berita berhasil ditambahkan", 
            id: result.insertId 
        });
    } catch (err) {
        console.error("Error creating news:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.updateNews = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, category, post_date, long_desc } = req.body;
        let userId = req.body.userId;
        if (Array.isArray(userId)) {
            userId = userId[0];
        }

        if (!userId || userId === 'undefined' || userId === 'null') {
            userId = null;
        }

        const [existing] = await db.execute('SELECT image, userId FROM news WHERE id = ?', [id]);

        if (existing.length === 0) {
            return res.status(404).json({ error: "Berita tidak ditemukan" });
        }

        const oldImage = existing[0].image;
        const currentUserId = existing[0].userId;
        let imagePath = oldImage;

        if (req.file) {
            imagePath = `/admin/uploads/news/${req.file.filename}`;
            if (oldImage) deleteLocalFile(oldImage);
        } else if (typeof req.body.image === 'string' && req.body.image !== oldImage && !req.body.image.startsWith('[object')) {
            imagePath = req.body.image;
            if (oldImage) deleteLocalFile(oldImage);
        }

        const finalUserId = userId || currentUserId;

        await db.execute(
            'UPDATE news SET userId = ?, image = ?, title = ?, category = ?, post_date = ?, long_desc = ? WHERE id = ?',
            [finalUserId, imagePath, title, category, post_date, long_desc, id]
        );

        res.json({ success: true, message: "Berita berhasil diperbarui" });
    } catch (err) {
        console.error("Error updating news:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.deleteNews = async (req, res) => {
    try {
        const { id } = req.params;
        const [existing] = await db.execute('SELECT image FROM news WHERE id = ?', [id]);

        if (existing.length === 0) {
            return res.status(404).json({ error: "Berita tidak ditemukan" });
        }

        const oldImage = existing[0].image;
        await db.execute('DELETE FROM news WHERE id = ?', [id]);

        if (oldImage) deleteLocalFile(oldImage);
        res.json({ success: true, message: "Berita berhasil dihapus" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
