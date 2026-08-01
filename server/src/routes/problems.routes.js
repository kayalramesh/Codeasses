const express = require('express');
const { getProblems, getProblem } = require('../controllers/problems.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', authMiddleware, getProblems);
router.get('/:slug', authMiddleware, getProblem);

module.exports = router;
