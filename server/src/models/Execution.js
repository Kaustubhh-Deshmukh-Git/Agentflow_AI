const mongoose = require('mongoose');

const executionSchema = new mongoose.Schema({
  workflowId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workflow', required: true },
  workflowSnapshot: { type: mongoose.Schema.Types.Mixed, required: true }, // immutable copy of graph at run time
  status: { type: String, enum: ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'RETRYING', 'PAUSED', 'CANCELLED'], default: 'PENDING' },
  currentNode: { type: String, default: null },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  duration: { type: Number },
  inputs: { type: mongoose.Schema.Types.Mixed, default: {} },
  outputs: { type: mongoose.Schema.Types.Mixed, default: {} },
  error: { type: String },
  retryCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Execution', executionSchema);
