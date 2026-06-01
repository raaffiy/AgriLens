const express = require('express');
const router = express.Router();
const discussionController = require('../controllers/discussionController');

router.get('/', discussionController.getAllDiscussions);
router.post('/', discussionController.createDiscussion);
router.put('/:id', discussionController.updateDiscussion);
router.delete('/:id', discussionController.deleteDiscussion);

module.exports = router;
