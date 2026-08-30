const ExecutionService = require('../services/executionService');

class ExecutionController {
  static async startExecution(req, res) {
    try {
      const { id: workflowId } = req.params;
      const ownerId = req.user.id;
      const execution = await ExecutionService.startExecution(ownerId, workflowId);

      // Kick off agent chain via BullMQ (or in-memory fallback), passing ownerId
      const { enqueueExecution } = require('../queues/executionQueue');
      await enqueueExecution(execution._id, workflowId, ownerId);

      res.status(201).json(execution);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async listExecutions(req, res) {
    try {
      const executions = await ExecutionService.getExecutions(req.query.workflowId);
      res.json(executions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getExecution(req, res) {
    try {
      const execution = await ExecutionService.getExecutionById(req.params.id);
      if (!execution) return res.status(404).json({ error: 'Execution not found' });
      res.json(execution);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getTimeline(req, res) {
    try {
      const logs = await ExecutionService.getExecutionLogs(req.params.id);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async pauseExecution(req, res) {
    try {
      const execution = await ExecutionService.updateExecutionStatus(req.params.id, 'PAUSED');
      res.json(execution);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async resumeExecution(req, res) {
    try {
      const execution = await ExecutionService.updateExecutionStatus(req.params.id, 'RUNNING');
      res.json(execution);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async cancelExecution(req, res) {
    try {
      const execution = await ExecutionService.updateExecutionStatus(req.params.id, 'CANCELLED');
      res.json(execution);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = ExecutionController;
