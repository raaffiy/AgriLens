const db = require('../config/db');
const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

        if (!users || users.length === 0) {
            return res.status(401).json({ message: "Email tidak ditemukan" });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            res.json({ 
                message: "Login berhasil", 
                user: { id: user.id, nama: user.nama, email: user.email } 
            });
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
        if (!nama || !email || !password) {
            return res.status(400).json({ message: "Semua field harus diisi" });
        }

        const [existingUsers] = await db.execute('SELECT email FROM users WHERE email = ?', [email]);
        if (existingUsers && existingUsers.length > 0) {
            return res.status(400).json({ message: "Email sudah terdaftar" });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const [result] = await db.execute(
            'INSERT INTO users (nama, email, password) VALUES (?, ?, ?)',
            [nama, email, hashedPassword]
        );

        res.json({ 
            success: true, 
            message: "Registrasi berhasil", 
            userId: result.insertId 
        });
    } catch (error) {
        res.status(500).json({ error: error.message || "Gagal memproses registrasi" });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { email, nama } = req.body;
        const [result] = await db.execute(
            'UPDATE users SET nama = ? WHERE email = ?',
            [nama, email]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "User tidak ditemukan" });
        }

        res.json({ success: true, message: "Profil berhasil diperbarui" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updatePassword = async (req, res) => {
    try {
        const { email, old_password, new_password } = req.body;

        if (!email || !old_password || !new_password) {
            return res.status(400).json({ success: false, message: "Semua field harus diisi" });
        }

        // Get user from DB
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (!users || users.length === 0) {
            return res.status(404).json({ success: false, message: "User tidak ditemukan" });
        }

        const user = users[0];

        // Verify old password
        const isMatch = await bcrypt.compare(old_password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Password lama salah" });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(new_password, 12);

        // Update password in DB
        await db.execute('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);

        res.json({ success: true, message: "Password berhasil diperbarui" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message || "Gagal memperbarui password" });
    }
};
