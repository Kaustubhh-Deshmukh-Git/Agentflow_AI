const express = require('express');
const ExecutionController = require('../controllers/executionController');
const { authMiddleware } = require('./authRoutes');

const router = express.Router();

router.use(authMiddleware);

router.get('/', ExecutionController.listExecutions);
router.get('/:id', ExecutionController.getExecution);
router.get('/:id/timeline', ExecutionController.getTimeline);
router.post('/:id/pause', ExecutionController.pauseExecution);
router.post('/:id/resume', ExecutionController.resumeExecution);
router.post('/:id/cancel', ExecutionController.cancelExecution);

module.exports = router;
