const router = require('express').Router();
const ChatController = require('../controllers/chatController');

// POST /api/chat - отправка сообщения в чат
router.post('/', ChatController.sendMessage);

// GET /api/chat/history/:sessionId - получение истории чата
router.get('/history/:sessionId', ChatController.getChatHistory);

module.exports = router;
