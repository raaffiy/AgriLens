const db = require('../config/db');
const fs = require('fs');
const path = require('path');

const deleteLocalFile = (filePath) => {
    if (!filePath || filePath.startsWith('http')) return;
    
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

exports.getAllModules = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM modules ORDER BY id ASC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getModulesByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const decodedCategory = decodeURIComponent(category);
        const [rows] = await db.execute(
            'SELECT * FROM modules WHERE category = ? ORDER BY id ASC',
            [decodedCategory]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getModuleById = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.execute('SELECT * FROM modules WHERE id = ?', [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Modul tidak ditemukan" });
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createModule = async (req, res) => {
    try {
        const { title, category, short_desc = '', long_desc = '', benefits = '', planting_steps = '', care_tips = '' } = req.body;
        let userId = req.body.userId;
        if (Array.isArray(userId)) {
            userId = userId[0];
        }
        
        if (!userId || userId === 'undefined' || userId === 'null') {
            userId = null;
        }

        if (!title || !category) return res.status(400).json({ error: 'Title dan Category wajib diisi' });

        let imagePath = req.body.image || null;
        if (req.file) {
            imagePath = `/admin/uploads/modules/${req.file.filename}`;
        } else if (typeof imagePath === 'string' && imagePath.startsWith('[object')) {
            imagePath = null;
        }

        const [result] = await db.execute(
            'INSERT INTO modules (userId, image, title, category, short_desc, long_desc, benefits, planting_steps, care_tips) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [userId, imagePath, title, category, short_desc, long_desc, benefits, planting_steps, care_tips]
        );

        res.json({ 
            success: true, 
            message: "Modul berhasil ditambahkan", 
            id: result.insertId 
        });
    } catch (err) {
        console.error("Error creating module:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.updateModule = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, category, short_desc = '', long_desc = '', benefits = '', planting_steps = '', care_tips = '' } = req.body;
        let userId = req.body.userId;
        if (Array.isArray(userId)) {
            userId = userId[0];
        }
        
        if (!userId || userId === 'undefined' || userId === 'null') {
            userId = null;
        }

        const [existing] = await db.execute('SELECT image, userId FROM modules WHERE id = ?', [id]);

        if (existing.length === 0) {
            return res.status(404).json({ error: "Modul tidak ditemukan" });
        }

        const oldImage = existing[0].image;
        const currentUserId = existing[0].userId;
        let imagePath = oldImage;

        if (req.file) {
            imagePath = `/admin/uploads/modules/${req.file.filename}`;
            if (oldImage) deleteLocalFile(oldImage);
        } else if (typeof req.body.image === 'string' && req.body.image !== oldImage && !req.body.image.startsWith('[object')) {
            imagePath = req.body.image;
            if (oldImage) deleteLocalFile(oldImage);
        }

        const finalUserId = userId || currentUserId;

        await db.execute(
            'UPDATE modules SET userId = ?, image = ?, title = ?, category = ?, short_desc = ?, long_desc = ?, benefits = ?, planting_steps = ?, care_tips = ? WHERE id = ?',
            [finalUserId, imagePath, title, category, short_desc, long_desc, benefits, planting_steps, care_tips, id]
        );

        res.json({ success: true, message: "Modul berhasil diperbarui" });
    } catch (err) {
        console.error("Error updating module:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.deleteModule = async (req, res) => {
    try {
        const { id } = req.params;
        const [existing] = await db.execute('SELECT image FROM modules WHERE id = ?', [id]);

        if (existing.length === 0) {
            return res.status(404).json({ error: "Modul tidak ditemukan" });
        }

        const oldImage = existing[0].image;
        await db.execute('DELETE FROM modules WHERE id = ?', [id]);

        if (oldImage) deleteLocalFile(oldImage);
        res.json({ success: true, message: "Modul berhasil dihapus" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
