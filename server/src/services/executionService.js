const Execution = require('../models/Execution');
const ExecutionLog = require('../models/ExecutionLog');
const Workflow = require('../models/Workflow');
const mongoose = require('mongoose');

let memoryExecutions = [];
let memoryExecutionLogs = [];

class ExecutionService {
  static async startExecution(userId, workflowId) {
    let workflow;
    if (mongoose.connection.readyState !== 1) {
      // Try to find from in-memory workflow store (shared singleton)
      const WorkflowService = require('./workflowService');
      try {
        workflow = await WorkflowService.getWorkflowById(userId, workflowId);
      } catch (_) {
        workflow = { _id: workflowId, nodes: [], edges: [], name: 'Unknown' };
      }
    } else {
      workflow = await Workflow.findOne({ _id: workflowId, owner: userId });
      if (!workflow) throw new Error('Workflow not found or access denied');
    }

    const executionData = {
      workflowId,
      workflowSnapshot: {
        nodes: workflow.nodes || [],
        edges: workflow.edges || [],
        name: workflow.name,
      },
      status: 'PENDING',
      startTime: new Date(),
    };

    let execution;
    if (mongoose.connection.readyState !== 1) {
      execution = {
        _id: Date.now().toString(),
        ...executionData,
        ownerId: userId,
        retryCount: 0,
        createdAt: new Date(),
      };
      memoryExecutions.push(execution);
    } else {
      execution = await Execution.create(executionData);
    }

    return execution;
  }

  static async getExecutions(workflowId) {
    if (mongoose.connection.readyState !== 1) {
      if (workflowId) {
        return memoryExecutions.filter(e => e.workflowId === workflowId || e.workflowId?.toString() === workflowId);
      }
      return [...memoryExecutions].reverse(); // Newest first
    }
    const query = workflowId ? { workflowId } : {};
    return Execution.find(query).sort({ createdAt: -1 }).lean();
  }

  static async getExecutionById(executionId) {
    if (mongoose.connection.readyState !== 1) {
      return memoryExecutions.find(e => e._id?.toString() === executionId?.toString()) || null;
    }
    return Execution.findById(executionId).lean();
  }

  static async getExecutionLogs(executionId) {
    if (mongoose.connection.readyState !== 1) {
      return memoryExecutionLogs.filter(l => l.executionId?.toString() === executionId?.toString());
    }
    return ExecutionLog.find({ executionId }).sort({ createdAt: 1 }).lean();
  }

  static async updateExecutionStatus(executionId, status) {
    if (mongoose.connection.readyState !== 1) {
      const exec = memoryExecutions.find(e => e._id?.toString() === executionId?.toString());
      if (exec) {
        exec.status = status;
        if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(status)) {
          exec.endTime = new Date();
          exec.duration = exec.startTime ? (exec.endTime - new Date(exec.startTime)) : null;
        }
        return exec;
      }
      return null;
    }

    const update = { status };
    if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(status)) {
      update.endTime = new Date();
      // Compute duration using startTime stored in doc
      const doc = await Execution.findById(executionId);
      if (doc && doc.startTime) {
        update.duration = new Date() - new Date(doc.startTime);
      }
    }
    return Execution.findByIdAndUpdate(executionId, update, { returnDocument: 'after', new: true });
  }
}

module.exports = ExecutionService;
