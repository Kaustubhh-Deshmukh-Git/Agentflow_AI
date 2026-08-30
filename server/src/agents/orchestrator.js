const ExecutionService = require('../services/executionService');
const PlannerAgent = require('./plannerAgent');
const ExecutionAgent = require('./executionAgent');
const ValidationAgent = require('./validationAgent');
const RecoveryAgent = require('./recoveryAgent');
const MonitoringAgent = require('./monitoringAgent');
const NotificationController = require('../controllers/notificationController');
const Execution = require('../models/Execution');
const mongoose = require('mongoose');

class Orchestrator {
  static async runExecution(executionId, workflowId, ownerId) {
    try {
      await ExecutionService.updateExecutionStatus(executionId, 'RUNNING');
      await MonitoringAgent.logEvent(
        executionId, workflowId, null, 'system', 'info',
        `Execution started. langGraph: 'not-installed' (running custom orchestrator loop)`
      );

      // 1. Fetch execution snapshot
      let execution;
      if (mongoose.connection.readyState === 1) {
        execution = await Execution.findById(executionId);
      } else {
        // In-memory fallback — pull from ExecutionService memory store
        const execs = await ExecutionService.getExecutions();
        execution = execs.find(e => e._id.toString() === executionId.toString());
      }

      if (!execution || !execution.workflowSnapshot) {
        throw new Error('Invalid execution snapshot');
      }

      // 2. Planning Phase
      await MonitoringAgent.logEvent(executionId, workflowId, null, 'planner', 'info', 'Starting planning phase');
      const planResult = await PlannerAgent.plan(execution.workflowSnapshot);
      await MonitoringAgent.logEvent(
        executionId, workflowId, null, 'planner', 'success',
        `Plan generated with ${planResult.plan.length} nodes`,
        { confidenceScore: planResult.confidenceScore }
      );

      // Pass owner context so ExecutionAgent can fetch integration credentials
      let inputs = { _ownerId: ownerId || execution.ownerId };

      // 3. Execution Loop
      for (const nodeId of planResult.plan) {
        const node = execution.workflowSnapshot.nodes.find(n => n.id === nodeId);
        if (!node) continue;

        // Check if cancelled/paused before each node
        if (mongoose.connection.readyState === 1) {
          const currentExec = await Execution.findById(executionId);
          if (currentExec.status === 'CANCELLED') {
            await MonitoringAgent.logEvent(executionId, workflowId, nodeId, 'system', 'warning', 'Execution cancelled by user');
            return;
          }
          if (currentExec.status === 'PAUSED') {
            await MonitoringAgent.logEvent(executionId, workflowId, nodeId, 'system', 'info', 'Execution paused — waiting for resume');
            // Poll for resume or cancellation (max 10 min)
            const paused = await Orchestrator._waitForResume(executionId, 600);
            if (!paused) {
              await MonitoringAgent.logEvent(executionId, workflowId, nodeId, 'system', 'warning', 'Execution timed out while paused');
              await ExecutionService.updateExecutionStatus(executionId, 'FAILED');
              return;
            }
          }
          currentExec.currentNode = nodeId;
          await currentExec.save();
        }

        await MonitoringAgent.logEvent(executionId, workflowId, nodeId, 'execution', 'info',
          `Executing node: ${node.data?.label || nodeId} (type: ${node.data?.type || 'default'})`
        );

        let success = false;
        let retries = 0;
        const maxRetries = 2;

        while (!success && retries <= maxRetries) {
          try {
            const result = await ExecutionAgent.executeNode(node, inputs);
            const validation = await ValidationAgent.validate(node, result);

            if (validation.isValid) {
              await MonitoringAgent.logEvent(executionId, workflowId, nodeId, 'validation', 'success',
                'Node output validated successfully'
              );
              inputs = { ...inputs, [nodeId]: result };
              success = true;
            } else {
              throw new Error(validation.error || 'MISSING_FIELDS');
            }
          } catch (error) {
            await MonitoringAgent.logEvent(executionId, workflowId, nodeId, 'execution', 'error',
              `Node execution failed: ${error.message}`
            );

            const recoveryAction = await RecoveryAgent.recover(error.message, {
              executionId,
              workflowId,
              ownerId,
            });

            await MonitoringAgent.logEvent(executionId, workflowId, nodeId, 'recovery', 'info',
              `Recovery decision: ${recoveryAction.action} (${recoveryAction.errorType})`,
              { action: recoveryAction.action, errorType: recoveryAction.errorType }
            );

            if (recoveryAction.action === 'retry_with_backoff' && retries < maxRetries) {
              retries++;
              const delay = recoveryAction.delay || 1000 * retries;
              await MonitoringAgent.logEvent(executionId, workflowId, nodeId, 'system', 'info',
                `Retrying (${retries}/${maxRetries}) in ${delay}ms...`
              );
              await new Promise(r => setTimeout(r, delay));
            } else {
              throw error; // Escalate out of the while loop
            }
          }
        }
      }

      // 4. Completion
      await ExecutionService.updateExecutionStatus(executionId, 'COMPLETED');
      await MonitoringAgent.logEvent(executionId, workflowId, null, 'system', 'success',
        'Workflow execution completed successfully'
      );

      if (ownerId) {
        await NotificationController.create(ownerId, {
          type: 'execution_completed',
          title: 'Execution Completed',
          message: `Your workflow execution finished successfully.`,
          workflowId,
          executionId,
        });
      }
    } catch (error) {
      await ExecutionService.updateExecutionStatus(executionId, 'FAILED');
      await MonitoringAgent.logEvent(executionId, workflowId, null, 'system', 'error',
        `Execution failed: ${error.message}`
      );
      if (ownerId) {
        await NotificationController.create(ownerId, {
          type: 'execution_failed',
          title: 'Execution Failed',
          message: error.message,
          workflowId,
          executionId,
        });
      }
    }
  }

  /**
   * Polls until the execution is no longer PAUSED or timeoutSeconds is reached.
   * Returns true if resumed, false if timed out.
   */
  static async _waitForResume(executionId, timeoutSeconds) {
    const start = Date.now();
    while (Date.now() - start < timeoutSeconds * 1000) {
      await new Promise(r => setTimeout(r, 3000));
      if (mongoose.connection.readyState === 1) {
        const exec = await Execution.findById(executionId);
        if (exec.status === 'RUNNING') return true;
        if (exec.status === 'CANCELLED') return false;
      }
    }
    return false;
  }
}

module.exports = Orchestrator;
