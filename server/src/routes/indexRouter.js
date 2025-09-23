const router = require('express').Router();

const uploadRouter = require('./uploadRouter');
const chatRouter = require('./chatRouter');
const formatResponse = require('../utils/formatResponse');
// Health under /api
router.get('/health', (req, res) => {
  res.status(200).json(formatResponse(200, 'OK'));
});

// API маршруты

router.use('/upload', uploadRouter);
router.use('/chat', chatRouter);

// 404 обработчик
router.use((req, res) => {
  res.status(404).json(formatResponse(404, 'Not found'));
});

module.exports = router;