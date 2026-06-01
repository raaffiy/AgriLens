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

        // Dapatkan URL Publik
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

exports.getAllModules = async (req, res) => {
    try {
        const { data, error } = await db
            .from('modules')
            .select('*')
            .order('id', { ascending: true });

        if (error) return res.status(500).json({ error: error.message });
        res.json(data || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getModulesByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const decodedCategory = decodeURIComponent(category);
        const { data, error } = await db
            .from('modules')
            .select('*')
            .eq('category', decodedCategory)
            .order('id', { ascending: true });

        if (error) return res.status(500).json({ error: error.message });
        res.json(data || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getModuleById = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await db
            .from('modules')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return res.status(404).json({ error: "Modul tidak ditemukan" });
            return res.status(500).json({ error: error.message });
        }
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createModule = async (req, res) => {
    try {
        const { title, category, short_desc = '', long_desc = '', benefits = '', planting_steps = '', care_tips = '' } = req.body;
        let userId = req.body.userId;
        
        if (!userId || userId === 'undefined' || userId === 'null') {
            userId = null;
        }

        if (!title || !category) return res.status(400).json({ error: 'Title dan Category wajib diisi' });

        let imagePath = req.body.image || null;
        if (req.file) {
            imagePath = await uploadToSupabase(req.file, 'modules');
        }

        const { data, error } = await db
            .from('modules')
            .insert([{ 
                userid: userId, 
                image: imagePath, 
                title, 
                category, 
                short_desc, 
                long_desc, 
                benefits, 
                planting_steps, 
                care_tips 
            }])
            .select('id')
            .single();

        if (error) return res.status(500).json({ error: error.message });
        res.json({ success: true, message: "Modul berhasil ditambahkan", id: data.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateModule = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, category, short_desc = '', long_desc = '', benefits = '', planting_steps = '', care_tips = '' } = req.body;
        let userId = req.body.userId;
        
        if (!userId || userId === 'undefined' || userId === 'null') {
            userId = null;
        }

        const { data: existing, error: fetchError } = await db
            .from('modules')
            .select('image, userid')
            .eq('id', id)
            .single();

        if (fetchError) {
            if (fetchError.code === 'PGRST116') return res.status(404).json({ error: "Modul tidak ditemukan" });
            return res.status(500).json({ error: fetchError.message });
        }

        const oldImage = existing.image;
        const currentUserId = existing.userid;
        let imagePath = req.body.image || oldImage;

        if (req.file) {
            imagePath = await uploadToSupabase(req.file, 'modules');
            if (oldImage) await deleteFromSupabase(oldImage);
        } else if (req.body.image && req.body.image !== oldImage) {
            if (oldImage) await deleteFromSupabase(oldImage);
        }

        const finalUserId = userId || currentUserId;

        const { error: updateError } = await db
            .from('modules')
            .update({ 
                userid: finalUserId, 
                image: imagePath, 
                title, 
                category, 
                short_desc, 
                long_desc, 
                benefits, 
                planting_steps, 
                care_tips 
            })
            .eq('id', id);

        if (updateError) return res.status(500).json({ error: updateError.message });
        res.json({ success: true, message: "Modul berhasil diperbarui" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteModule = async (req, res) => {
    try {
        const { id } = req.params;
        const { data: existing, error: fetchError } = await db
            .from('modules')
            .select('image')
            .eq('id', id)
            .single();

        if (fetchError) {
            if (fetchError.code === 'PGRST116') return res.status(404).json({ error: "Modul tidak ditemukan" });
            return res.status(500).json({ error: fetchError.message });
        }

        const oldImage = existing.image;
        const { error: deleteError } = await db
            .from('modules')
            .delete()
            .eq('id', id);

        if (deleteError) return res.status(500).json({ error: deleteError.message });
        
        if (oldImage) await deleteFromSupabase(oldImage);
        res.json({ success: true, message: "Modul berhasil dihapus" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
