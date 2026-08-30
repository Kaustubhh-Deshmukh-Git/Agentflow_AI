const WorkflowService = require('../services/workflowService');
const ExecutionService = require('../services/executionService');
const AIService = require('../services/aiService');

class WorkflowController {
  static async getDashboard(req, res) {
    try {
      const stats = await WorkflowService.getDashboardStats(req.user.id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async listWorkflows(req, res) {
    try {
      const workflows = await WorkflowService.getWorkflows(req.user.id, req.query);
      res.json(workflows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async createWorkflow(req, res) {
    try {
      const workflow = await WorkflowService.createWorkflow(req.user.id, req.body);
      res.status(201).json(workflow);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async generateWorkflow(req, res) {
    try {
      const { prompt } = req.body;
      if (!prompt) return res.status(400).json({ error: 'prompt is required' });

      const graph = await AIService.generateWorkflowGraph(prompt);

      const newWorkflow = await WorkflowService.createWorkflow(req.user.id, {
        name: `AI: ${prompt.substring(0, 40).trim()}${prompt.length > 40 ? '...' : ''}`,
        description: `Auto-generated from prompt: "${prompt.substring(0, 100)}"`,
        nodes: graph.nodes,
        edges: graph.edges,
        status: 'draft',
      });

      res.status(201).json(newWorkflow);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getWorkflow(req, res) {
    try {
      const workflow = await WorkflowService.getWorkflowById(req.user.id, req.params.id);
      res.json(workflow);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  static async updateWorkflow(req, res) {
    try {
      const workflow = await WorkflowService.updateWorkflow(req.user.id, req.params.id, req.body);
      res.json(workflow);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async duplicateWorkflow(req, res) {
    try {
      const workflow = await WorkflowService.duplicateWorkflow(req.user.id, req.params.id);
      res.status(201).json(workflow);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async executeWorkflow(req, res) {
    try {
      const { id: workflowId } = req.params;
      const ownerId = req.user.id;

      const execution = await ExecutionService.startExecution(ownerId, workflowId);

      const { enqueueExecution } = require('../queues/executionQueue');
      await enqueueExecution(execution._id, workflowId, ownerId);

      res.status(201).json(execution);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  static async deleteWorkflow(req, res) {
    try {
      await WorkflowService.deleteWorkflow(req.user.id, req.params.id);
      res.json({ message: 'Workflow deleted successfully' });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
}

module.exports = WorkflowController;
