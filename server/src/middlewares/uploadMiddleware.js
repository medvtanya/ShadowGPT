const multer = require('multer');
const { MAX_FILE_SIZE_MB } = require('../configs/envConfig');

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
    fileSize: MAX_FILE_SIZE_MB * 1024 * 1024,
  },
});

module.exports = upload;
