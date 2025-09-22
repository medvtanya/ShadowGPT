require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const serverConfig = require('./configs/serverConfig');
const indexRouter = require('./routes/indexRouter');

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

serverConfig(app);

app.use('/api', indexRouter);

// Centralized error handler (including multer errors)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const isMulterError = err && (err.code === 'LIMIT_FILE_SIZE' || err.message === 'Only PDF files are allowed');
  if (isMulterError) {
    return res.status(400).json({ statusCode: 400, message: err.message || 'Invalid file', data: null, error: err.message });
  }
  return res.status(500).json({ statusCode: 500, message: 'Internal server error', data: null, error: err && err.message ? err.message : 'Unknown error' });
});

// Export app for testing; start server only if not under test
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
}

module.exports = app;
