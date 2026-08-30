const BaseIntegration = require('./baseIntegration');

class SlackIntegration extends BaseIntegration {
  constructor() {
    super('slack');
  }

  getAuthUrl(state) {
    const params = new URLSearchParams({
      client_id: process.env.SLACK_CLIENT_ID || 'SLACK_CLIENT_ID_NOT_SET',
      scope: 'chat:write,channels:read,incoming-webhook',
      redirect_uri: `${process.env.SERVER_URL || 'http://localhost:5000'}/api/integrations/oauth/slack/callback`,
      state,
    });
    return `https://slack.com/oauth/v2/authorize?${params}`;
  }

  async handleCallback(code) {
    // In production: POST to https://slack.com/api/oauth.v2.access
    return {
      access_token: `slack_access_${Date.now()}`,
      refresh_token: null,
      team: { id: 'T_MOCK', name: 'Mock Workspace' },
    };
  }

  async testConnection(tokens) {
    // In production: call https://slack.com/api/auth.test
    return { connected: true, team: 'Mock Workspace' };
  }

  async refreshToken(tokens) {
    return tokens; // Slack uses long-lived tokens; no refresh needed in most cases
  }

  async executeAction(action, inputs, tokens) {
    console.log(`[Slack] Executing action: ${action}`, inputs);

    switch (action) {
      case 'post_message': {
        const { channel, text } = inputs;
        // In production: POST to https://slack.com/api/chat.postMessage
        console.log(`[Slack] Posting to #${channel}: ${text}`);
        return { success: true, channel, ts: Date.now().toString() };
      }
      case 'list_channels': {
        return { success: true, channels: [{ id: 'C_MOCK', name: 'general' }] };
      }
      default:
        throw new Error(`Slack: Unknown action '${action}'`);
    }
  }
}

module.exports = new SlackIntegration();
