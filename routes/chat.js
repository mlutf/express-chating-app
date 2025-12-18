const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { ensureAuthenticated } = require('../middleware/authMiddleware');

router.get('/chat', ensureAuthenticated, chatController.getChatPage);
router.get('/api/messages', ensureAuthenticated, chatController.getMessages);
module.exports = router;
