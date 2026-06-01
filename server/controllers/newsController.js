const db = require('../config/db');

// Bucket Name di Supabase Storage
const BUCKET_NAME = 'agrilens';

const uploadToSupabase = async (file, folder) => {
    try {
        if (!file || !file.buffer) return null;
        
        const fileName = `${folder}/${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`;
        
        const { data, error } = await db.storage
            .from(BUCKET_NAME)
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                upsert: true
            });

        if (error) throw error;

        const { data: publicData } = db.storage
            .from(BUCKET_NAME)
            .getPublicUrl(fileName);

        return publicData.publicUrl;
    } catch (err) {
        console.error('Supabase Upload Error:', err.message);
        throw err;
    }
};

const deleteFromSupabase = async (fileUrl) => {
    if (!fileUrl || !fileUrl.includes('supabase.co')) return;
    try {
        const urlParts = fileUrl.split(`${BUCKET_NAME}/`);
        if (urlParts.length < 2) return;
        
        const filePath = urlParts[1];
        const { error } = await db.storage
            .from(BUCKET_NAME)
            .remove([filePath]);

        if (error) throw error;
    } catch (err) {
        console.error('Supabase Delete Error:', err.message);
    }
};

exports.getAllNews = async (req, res) => {
    try {
        const { data, error } = await db
            .from('news')
            .select('id, image, title, category, post_date, long_desc')
            .order('post_date', { ascending: false });

        if (error) return res.status(500).json({ error: error.message });
        res.json(data || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getNewsById = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await db
            .from('news')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return res.status(404).json({ error: "Berita tidak ditemukan" });
            return res.status(500).json({ error: error.message });
        }
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createNews = async (req, res) => {
    try {
        const { title, category, post_date, long_desc } = req.body;
        let userId = req.body.userId;

        if (!userId || userId === 'undefined' || userId === 'null') {
            userId = null;
        }

        if (!title || !category || !post_date || !long_desc) {
            return res.status(400).json({ error: 'Field title, category, post_date, dan long_desc wajib diisi' });
        }
        
        let imagePath = null;
        if (req.file) {
            imagePath = await uploadToSupabase(req.file, 'news');
        }
        
        const { data, error } = await db
            .from('news')
            .insert([{ userid: userId, image: imagePath, title, category, post_date, long_desc }])
            .select('id')
            .single();

        if (error) return res.status(500).json({ error: error.message });
        res.json({ success: true, message: "Berita berhasil ditambahkan", id: data.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateNews = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, category, post_date, long_desc } = req.body;
        let userId = req.body.userId;

        if (!userId || userId === 'undefined' || userId === 'null') {
            userId = null;
        }

        const { data: existing, error: fetchError } = await db
            .from('news')
            .select('image, userid')
            .eq('id', id)
            .single();

        if (fetchError) {
            if (fetchError.code === 'PGRST116') return res.status(404).json({ error: "Berita tidak ditemukan" });
            return res.status(500).json({ error: fetchError.message });
        }

        const oldImage = existing.image;
        const currentUserId = existing.userid;
        let imagePath = oldImage;

        if (req.file) {
            imagePath = await uploadToSupabase(req.file, 'news');
            if (oldImage) await deleteFromSupabase(oldImage);
        }

        const finalUserId = userId || currentUserId;

        const { error: updateError } = await db
            .from('news')
            .update({ userid: finalUserId, image: imagePath, title, category, post_date, long_desc })
            .eq('id', id);

        if (updateError) return res.status(500).json({ error: updateError.message });
        res.json({ success: true, message: "Berita berhasil diperbarui" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteNews = async (req, res) => {
    try {
        const { id } = req.params;
        const { data: existing, error: fetchError } = await db
            .from('news')
            .select('image')
            .eq('id', id)
            .single();

        if (fetchError) {
            if (fetchError.code === 'PGRST116') return res.status(404).json({ error: "Berita tidak ditemukan" });
            return res.status(500).json({ error: fetchError.message });
        }

        const oldImage = existing.image;
        const { error: deleteError } = await db
            .from('news')
            .delete()
            .eq('id', id);

        if (deleteError) return res.status(500).json({ error: deleteError.message });
        
        if (oldImage) await deleteFromSupabase(oldImage);
        res.json({ success: true, message: "Berita berhasil dihapus" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
