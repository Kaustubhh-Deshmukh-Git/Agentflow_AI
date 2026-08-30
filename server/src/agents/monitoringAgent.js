const ExecutionLog = require('../models/ExecutionLog');
const mongoose = require('mongoose');
const { getIo } = require('../config/socket');

class MonitoringAgent {
  static async logEvent(executionId, workflowId, nodeId, agentName, level, message, metadata = {}) {
    console.log(`[${level.toUpperCase()}] ${agentName}: ${message}`);
    
    if (mongoose.connection.readyState === 1) {
      try {
        await ExecutionLog.create({
          executionId,
          workflowId,
          nodeId,
          agent: agentName,
          level,
          message,
          metadata
        });
      } catch (err) {
        console.error('Failed to write execution log:', err);
      }
    }
    
    // Emit Socket.io events to clients in the execution room
    getIo().to(executionId.toString()).emit('agent_event', {
      agent: agentName,
      level,
      message,
      metadata,
      createdAt: new Date().toISOString()
    });
  }
}

module.exports = MonitoringAgent;
