const express = require('express');
const { runCode, submitCode } = require('../controllers/submissions.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/run', authMiddleware, runCode);
router.post('/submit', authMiddleware, submitCode);

module.exports = router;
