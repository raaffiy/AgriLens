const multer = require('multer');
const path = require('path');

// Menggunakan Memory Storage agar file tidak tersimpan di folder 'uploads' lokal
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    const extName = path.extname(file.originalname).toLowerCase();
    const isAllowed = allowed.test(extName);
    
    if (isAllowed) {
        cb(null, true);
    } else {
        cb(new Error('Hanya file gambar (jpeg/jpg/png/webp/gif) yang diizinkan'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Limit 5MB
});

// Middleware multer untuk upload file tunggal dengan field name 'image'
const uploadNews = upload;
const uploadModules = upload;

module.exports = { uploadNews, uploadModules };
