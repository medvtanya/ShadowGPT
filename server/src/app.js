require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const formatResponse = require('./utils/formatResponse');
const { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX } = require('./configs/envConfig');
const serverConfig = require('./configs/serverConfig');
const indexRouter = require('./routes/indexRouter');
const PdfService = require('./services/pdfService');

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: formatResponse(429, 'Too many requests from this IP, please try again later.'),
});
app.use(limiter);

serverConfig(app);

// Health endpoints
app.get('/', (req, res) => {
  res.status(200).json(formatResponse(200, 'OK'));
});

app.use('/api', indexRouter);

// Centralized error handler (including multer errors)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const isMulterError = err && (err.code === 'LIMIT_FILE_SIZE' || err.message === 'Only PDF files are allowed');
  if (isMulterError) {
    return res.status(400).json(formatResponse(400, err.message || 'Invalid file', null, err.message));
  }
  return res.status(500).json(formatResponse(500, 'Internal server error', null, err && err.message ? err.message : 'Unknown error'));
});

// Export app for testing; start server only if not under test
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3001;
  // start cleanup scheduler for PDF sessions
  PdfService.initCleanupScheduler();
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
}

module.exports = app;
