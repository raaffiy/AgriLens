const db = require('../config/db');

exports.getAllDiscussions = async (req, res) => {
    try {
        const { data, error } = await db
            .from('discussions')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) return res.status(500).json({ error: error.message });
        res.json(data || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createDiscussion = async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) return res.status(400).json({ error: 'Content wajib diisi' });

        const { data, error } = await db
            .from('discussions')
            .insert([{ content }])
            .select('id')
            .single();

        if (error) return res.status(500).json({ error: error.message });
        res.json({ success: true, message: "Diskusi berhasil dibuat", id: data.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateDiscussion = async (req, res) => {
    try {
        const { id } = req.params;
        const { content, answer } = req.body;
        
        const { error } = await db
            .from('discussions')
            .update({ content, answer })
            .eq('id', id);

        if (error) return res.status(500).json({ error: error.message });
        res.json({ success: true, message: "Diskusi berhasil diperbarui" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteDiscussion = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await db
            .from('discussions')
            .delete()
            .eq('id', id);

        if (error) return res.status(500).json({ error: error.message });
        res.json({ success: true, message: "Diskusi berhasil dihapus" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
