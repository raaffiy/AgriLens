const db = require('../config/db');

exports.getAllDiscussions = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM discussions ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createDiscussion = async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) return res.status(400).json({ error: 'Content wajib diisi' });

        const [result] = await db.execute('INSERT INTO discussions (content) VALUES (?)', [content]);
        res.json({ success: true, message: "Diskusi berhasil dibuat", id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateDiscussion = async (req, res) => {
    try {
        const { id } = req.params;
        const { content, answer } = req.body;
        
        await db.execute(
            'UPDATE discussions SET content = ?, answer = ? WHERE id = ?',
            [content, answer, id]
        );

        res.json({ success: true, message: "Diskusi berhasil diperbarui" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteDiscussion = async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute('DELETE FROM discussions WHERE id = ?', [id]);
        res.json({ success: true, message: "Diskusi berhasil dihapus" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
