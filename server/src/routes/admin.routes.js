const express = require('express');
const { getAllResults, downloadExcel } = require('../controllers/admin.controller');
const { downloadPdf } = require('../controllers/submissions.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { adminMiddleware } = require('../middleware/admin.middleware');

const router = express.Router();

router.get('/results', authMiddleware, adminMiddleware, getAllResults);
router.get('/results/excel', authMiddleware, adminMiddleware, downloadExcel);
router.get('/results/:userId/pdf', authMiddleware, adminMiddleware, downloadPdf);

module.exports = router;
