const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDirs = ['uploads/news', 'uploads/modules'];
uploadDirs.forEach(dir => {
    const fullPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder = 'uploads/';
        if (req.originalUrl.includes('news')) {
            folder += 'news';
        } else if (req.originalUrl.includes('modules')) {
            folder += 'modules';
        }
        cb(null, path.join(__dirname, '..', folder));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
        cb(null, 'img_' + uniqueSuffix + path.extname(file.originalname));
    }
});

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

const uploadNews = upload;
const uploadModules = upload;

module.exports = { uploadNews, uploadModules };
