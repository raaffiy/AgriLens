const express = require('express');
const router = express.Router();
const moduleController = require('../controllers/moduleController');
const { uploadModules } = require('../middlewares/upload');

router.get('/', moduleController.getAllModules);
router.get('/:id', moduleController.getModuleById);
router.get('/category/:category', moduleController.getModulesByCategory);
router.post('/', uploadModules.single('image'), moduleController.createModule);
router.put('/:id', uploadModules.single('image'), moduleController.updateModule);
router.delete('/:id', moduleController.deleteModule);

module.exports = router;
