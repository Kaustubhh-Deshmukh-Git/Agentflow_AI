const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  workflowId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workflow' },
  executionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Execution' },
  type: {
    type: String,
    enum: ['execution_completed', 'execution_failed', 'execution_escalated', 'integration_error', 'system'],
    default: 'system'
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

notificationSchema.index({ owner: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
