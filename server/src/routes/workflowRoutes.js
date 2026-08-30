const express = require('express');
const WorkflowController = require('../controllers/workflowController');
const { authMiddleware } = require('./authRoutes');

const router = express.Router();

router.use(authMiddleware);

router.get('/dashboard', WorkflowController.getDashboard);
router.get('/', WorkflowController.listWorkflows);
router.post('/', WorkflowController.createWorkflow);
router.post('/generate', WorkflowController.generateWorkflow);
router.get('/:id', WorkflowController.getWorkflow);
router.put('/:id', WorkflowController.updateWorkflow);
router.post('/:id/duplicate', WorkflowController.duplicateWorkflow);
router.post('/:id/execute', WorkflowController.executeWorkflow);
router.delete('/:id', WorkflowController.deleteWorkflow);

module.exports = router;
