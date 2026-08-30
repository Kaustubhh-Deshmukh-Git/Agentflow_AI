const IntegrationService = require('../services/integrationService');

const INTEGRATION_MAP = {
  gmail: () => require('./gmailIntegration'),
  slack: () => require('./slackIntegration'),
  discord: () => require('./discordIntegration'),
  'google-sheets': () => require('./googleSheetsIntegration'),
};

class ExecutionAgent {
  static async executeNode(node, inputs) {
    const nodeType = node.data?.type || 'default';
    console.log(`[ExecutionAgent] Executing node ${node.id} (type: ${nodeType})`);

    // Route node type to appropriate integration
    const integration = INTEGRATION_MAP[nodeType];

    if (integration) {
      // Try to fetch credentials for the current user (ownerId stored on node or passed via inputs)
      const ownerId = inputs._ownerId;
      let tokens = null;
      if (ownerId) {
        try {
          tokens = await IntegrationService.getCredentials(ownerId, nodeType);
        } catch (err) {
          // Surface as a typed error so RecoveryAgent can classify it
          if (err.message === 'INTEGRATION_NOT_CONNECTED') {
            throw new Error('INTEGRATION_NOT_CONNECTED');
          }
          if (err.message === 'AUTH_EXPIRED') {
            throw new Error('AUTH_EXPIRED');
          }
          throw err;
        }
      }

      const action = node.data?.action || ExecutionAgent._defaultAction(nodeType);
      const nodeInputs = { ...node.data?.config, ...inputs };

      const instance = integration();
      return await instance.executeAction(action, nodeInputs, tokens);
    }

    // Handle AI / trigger / generic nodes
    if (nodeType === 'ai') {
      return await ExecutionAgent._executeAINode(node, inputs);
    }

    if (nodeType === 'trigger') {
      console.log(`[ExecutionAgent] Trigger node ${node.id} — passing through`);
      return { success: true, result: 'Trigger fired', triggeredAt: new Date().toISOString() };
    }

    // Default: simulate successful processing
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      success: true,
      result: `Processed node: ${node.data?.label || nodeType}`,
      nodeId: node.id,
    };
  }

  static _defaultAction(nodeType) {
    const defaults = {
      gmail: 'send_email',
      slack: 'post_message',
      discord: 'send_message',
      'google-sheets': 'append_row',
    };
    return defaults[nodeType] || 'execute';
  }

  static async _executeAINode(node, inputs) {
    const env = require('../config/env');
    const axios = require('axios');

    const prompt = node.data?.prompt || 'Analyze the following input and provide a summary.';
    const inputText = JSON.stringify(inputs, null, 2);

    console.log(`[ExecutionAgent] Running AI node with prompt: ${prompt.substring(0, 60)}...`);

    if (env.OPENROUTER_API_KEY) {
      try {
        const response = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: 'openai/gpt-4-turbo',
            messages: [
              { role: 'system', content: prompt },
              { role: 'user', content: inputText },
            ],
          },
          {
            headers: {
              Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
              'Content-Type': 'application/json',
            },
          }
        );
        const aiResult = response.data.choices[0].message.content;
        return { success: true, result: aiResult, model: 'openrouter' };
      } catch (err) {
        console.warn('[ExecutionAgent] OpenRouter AI call failed:', err.message);
        throw new Error('API_FAILURE');
      }
    }

    // Fallback: echo mock
    await new Promise(resolve => setTimeout(resolve, 400));
    return {
      success: true,
      result: `[AI Mock] Processed with prompt: "${prompt}" — Input had ${inputText.length} chars.`,
      model: 'mock',
    };
  }
}

module.exports = ExecutionAgent;
