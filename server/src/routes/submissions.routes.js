const express = require('express');
const { getAttempt, recordOffense, runCode, submitCode, downloadPdf } = require('../controllers/submissions.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/attempt/:problemId', authMiddleware, getAttempt);
router.post('/offense', authMiddleware, recordOffense);
router.post('/run', authMiddleware, runCode);
router.post('/submit', authMiddleware, submitCode);
router.get('/results/:userId/pdf', authMiddleware, downloadPdf);

module.exports = router;
