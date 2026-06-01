const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { data: users, error } = await db
            .from('users')
            .select('*')
            .eq('email', email);

        if (error) return res.status(500).json({ error: error.message });
        if (!users || users.length === 0) return res.status(401).json({ message: "Email tidak ditemukan" });

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            res.json({ message: "Login berhasil", user: { id: user.id, nama: user.nama, email: user.email } });
        } else {
            res.status(401).json({ message: "Password salah" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.register = async (req, res) => {
    try {
        const { nama, email, password } = req.body;
        if (!nama || !email || !password) return res.status(400).json({ message: "Semua field harus diisi" });

        const { data: existingUsers, error: checkError } = await db
            .from('users')
            .select('email')
            .eq('email', email);

        if (checkError) return res.status(500).json({ error: checkError.message });
        if (existingUsers && existingUsers.length > 0) return res.status(400).json({ message: "Email sudah terdaftar" });

        const hashedPassword = await bcrypt.hash(password, 12);
        const { data: newUser, error: insertError } = await db
            .from('users')
            .insert([{ nama, email, password: hashedPassword }])
            .select('id')
            .single();

        if (insertError) return res.status(500).json({ error: insertError.message });

        res.json({ success: true, message: "Registrasi berhasil", userId: newUser.id });
    } catch (error) {
        res.status(500).json({ error: "Gagal memproses registrasi" });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { email, nama } = req.body;
        const { error } = await db
            .from('users')
            .update({ nama })
            .eq('email', email);

        if (error) return res.status(500).json({ success: false, message: error.message });
        res.json({ success: true, message: "Profil berhasil diperbarui" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
