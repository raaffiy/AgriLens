const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const { uploadNews } = require('../middlewares/upload');

router.get('/', newsController.getAllNews);
router.get('/:id', newsController.getNewsById);
router.post('/', uploadNews.single('image'), newsController.createNews);
router.put('/:id', uploadNews.single('image'), newsController.updateNews);
router.delete('/:id', newsController.deleteNews);

module.exports = router;
