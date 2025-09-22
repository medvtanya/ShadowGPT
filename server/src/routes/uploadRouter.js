const router = require('express').Router();
const upload = require('../middlewares/uploadMiddleware');
const UploadController = require('../controllers/uploadController');

// POST /api/upload - загрузка PDF файла
router.post('/', upload.single('file'), UploadController.uploadPdf);

// GET /api/upload/session/:sessionId - проверка статуса сессии
router.get('/session/:sessionId', UploadController.checkSession);

module.exports = router;
