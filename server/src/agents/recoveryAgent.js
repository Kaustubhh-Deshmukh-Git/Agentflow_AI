const NotificationController = require('../controllers/notificationController');

/**
 * RecoveryAgent classifies execution failures and decides the recovery strategy.
 *
 * Error types:
 *  - MISSING_FIELDS      → escalate (bad workflow config)
 *  - API_FAILURE         → retry_with_backoff
 *  - AUTH_EXPIRED        → escalate + notify
 *  - INTEGRATION_NOT_CONNECTED → escalate + notify
 *  - RATE_LIMIT          → retry_with_backoff (with longer delay)
 *  - TRANSIENT           → retry_with_backoff
 *  - (default)           → escalate
 */
class RecoveryAgent {
  static async recover(errorMessage, { executionId, workflowId, ownerId } = {}) {
    console.log(`[RecoveryAgent] Handling error: "${errorMessage}"`);

    const message = errorMessage || '';

    // Classify the error
    let errorType = 'UNKNOWN';
    if (message.includes('MISSING_FIELDS')) errorType = 'MISSING_FIELDS';
    else if (message.includes('API_FAILURE'))              errorType = 'API_FAILURE';
    else if (message.includes('AUTH_EXPIRED'))             errorType = 'AUTH_EXPIRED';
    else if (message.includes('INTEGRATION_NOT_CONNECTED')) errorType = 'INTEGRATION_NOT_CONNECTED';
    else if (message.includes('RATE_LIMIT'))               errorType = 'RATE_LIMIT';
    else if (message.includes('TRANSIENT'))                errorType = 'TRANSIENT';
    else if (message.toLowerCase().includes('timeout'))    errorType = 'TRANSIENT';
    else if (message.toLowerCase().includes('network'))    errorType = 'TRANSIENT';

    const retryableErrors = ['API_FAILURE', 'RATE_LIMIT', 'TRANSIENT'];
    const escalateErrors  = ['MISSING_FIELDS', 'AUTH_EXPIRED', 'INTEGRATION_NOT_CONNECTED', 'UNKNOWN'];

    if (retryableErrors.includes(errorType)) {
      const delay = errorType === 'RATE_LIMIT' ? 5000 : 2000;
      return { action: 'retry_with_backoff', errorType, delay };
    }

    // Escalate — create a notification if we have owner context
    if (ownerId) {
      await NotificationController.create(ownerId, {
        type: 'execution_escalated',
        title: 'Execution Escalated',
        message: `A workflow step failed with error type ${errorType}: ${message.substring(0, 120)}`,
        workflowId,
        executionId,
      });
    }

    return { action: 'escalate', errorType };
  }
}

module.exports = RecoveryAgent;
