const multer = require('multer');

// Настройка multer для загрузки файлов
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Проверяем, что загружается PDF файл
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB лимит
  },
});

module.exports = upload;
