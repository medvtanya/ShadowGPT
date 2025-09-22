const router = require('express').Router();
const postRouter = require('./postRouter');
const formatResponse = require('../utils/formatResponse');
const authRouter = require('./authRouter');

router.use('/posts', postRouter);
router.use('/auth', authRouter);
  
router.use((req, res) => {
  res.status(404).json(formatResponse(404, 'Not found'));
});

module.exports = router;