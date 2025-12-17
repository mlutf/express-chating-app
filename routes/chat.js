const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { ensureAuthenticated } = require('../middleware/authMiddleware');

router.get('/chat', ensureAuthenticated, chatController.getChatPage);
router.get('/chat/:receiverId', ensureAuthenticated, chatController.getChatPage);
// router.get('/layout/:receiverId', ensureAuthenticated, chatController.layout);
// router.get('/layout', ensureAuthenticated, chatController.layout);

module.exports = router;
