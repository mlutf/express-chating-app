const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { ensureAuthenticated } = require('../middleware/authMiddleware');

router.get('/chat', ensureAuthenticated, chatController.getChatPage);

module.exports = router;
