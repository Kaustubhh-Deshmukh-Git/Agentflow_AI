const Workflow = require('../models/Workflow');
const Execution = require('../models/Execution');
const mongoose = require('mongoose');

let memoryWorkflows = [];

class WorkflowService {
  static async getWorkflows(userId, query = {}) {
    if (mongoose.connection.readyState !== 1) {
      let results = memoryWorkflows.filter(w => w.owner === userId);
      if (query.status) results = results.filter(w => w.status === query.status);
      if (query.search) {
        const s = query.search.toLowerCase();
        results = results.filter(w => w.name.toLowerCase().includes(s));
      }
      return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    const dbQuery = { owner: userId };
    if (query.status) dbQuery.status = query.status;
    if (query.search) dbQuery.name = { $regex: query.search, $options: 'i' };
    return Workflow.find(dbQuery).sort({ createdAt: -1 }).lean();
  }

  static async getDashboardStats(userId) {
    if (mongoose.connection.readyState !== 1) {
      const userWorkflows = memoryWorkflows.filter(w => w.owner === userId);
      const activeCount = userWorkflows.filter(w => w.status === 'active').length;
      return {
        totalWorkflows: userWorkflows.length,
        activeWorkflows: activeCount,
        totalExecutions: 0,
        successRate: 0,
        recentExecutions: [],
      };
    }
    const [totalWorkflows, activeWorkflows, executionAgg] = await Promise.all([
      Workflow.countDocuments({ owner: userId }),
      Workflow.countDocuments({ owner: userId, status: 'active' }),
      Execution.aggregate([
        {
          $lookup: {
            from: 'workflows',
            localField: 'workflowId',
            foreignField: '_id',
            as: 'workflow',
          },
        },
        { $match: { 'workflow.owner': new mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            completed: { $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] } },
          },
        },
      ]),
    ]);

    const agg = executionAgg[0] || { total: 0, completed: 0 };
    const successRate = agg.total > 0 ? Math.round((agg.completed / agg.total) * 100) : 0;

    const recentExecutions = await Execution.find()
      .populate({ path: 'workflowId', match: { owner: userId }, select: 'name' })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return {
      totalWorkflows,
      activeWorkflows,
      totalExecutions: agg.total,
      successRate,
      recentExecutions: recentExecutions.filter(e => e.workflowId),
    };
  }

  static async getWorkflowById(userId, workflowId) {
    if (mongoose.connection.readyState !== 1) {
      const workflow = memoryWorkflows.find(w => w._id === workflowId && w.owner === userId);
      if (!workflow) throw new Error('Workflow not found');
      return workflow;
    }
    const workflow = await Workflow.findOne({ _id: workflowId, owner: userId });
    if (!workflow) throw new Error('Workflow not found');
    return workflow;
  }

  static async createWorkflow(userId, data) {
    if (mongoose.connection.readyState !== 1) {
      const newWorkflow = {
        _id: Date.now().toString(),
        owner: userId,
        status: data.status || 'draft',
        version: 1,
        tags: [],
        triggerConfig: {},
        ...data,
        nodes: data.nodes || [],
        edges: data.edges || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryWorkflows.push(newWorkflow);
      return newWorkflow;
    }
    return Workflow.create({ ...data, owner: userId });
  }

  static async updateWorkflow(userId, workflowId, data) {
    if (mongoose.connection.readyState !== 1) {
      const idx = memoryWorkflows.findIndex(w => w._id === workflowId && w.owner === userId);
      if (idx === -1) throw new Error('Workflow not found');
      memoryWorkflows[idx] = {
        ...memoryWorkflows[idx],
        ...data,
        version: memoryWorkflows[idx].version + 1,
        updatedAt: new Date(),
      };
      return memoryWorkflows[idx];
    }
    const workflow = await Workflow.findOneAndUpdate(
      { _id: workflowId, owner: userId },
      { $set: data, $inc: { version: 1 } },
      { returnDocument: 'after', new: true }
    );
    if (!workflow) throw new Error('Workflow not found');
    return workflow;
  }

  static async duplicateWorkflow(userId, workflowId) {
    const original = await this.getWorkflowById(userId, workflowId);
    const copy = {
      name: `${original.name} (Copy)`,
      description: original.description,
      nodes: original.nodes,
      edges: original.edges,
      tags: original.tags,
      triggerConfig: original.triggerConfig,
      status: 'draft',
    };
    return this.createWorkflow(userId, copy);
  }

  static async deleteWorkflow(userId, workflowId) {
    if (mongoose.connection.readyState !== 1) {
      const idx = memoryWorkflows.findIndex(w => w._id === workflowId && w.owner === userId);
      if (idx === -1) throw new Error('Workflow not found');
      memoryWorkflows.splice(idx, 1);
      return { success: true };
    }
    const result = await Workflow.deleteOne({ _id: workflowId, owner: userId });
    if (result.deletedCount === 0) throw new Error('Workflow not found');
    return { success: true };
  }
}

module.exports = WorkflowService;
