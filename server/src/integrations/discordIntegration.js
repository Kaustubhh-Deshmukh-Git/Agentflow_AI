const BaseIntegration = require('./baseIntegration');

class DiscordIntegration extends BaseIntegration {
  constructor() {
    super('discord');
  }

  getAuthUrl(state) {
    const params = new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID || 'DISCORD_CLIENT_ID_NOT_SET',
      redirect_uri: `${process.env.SERVER_URL || 'http://localhost:5000'}/api/integrations/oauth/discord/callback`,
      response_type: 'code',
      scope: 'bot identify guilds',
      permissions: 2048, // SEND_MESSAGES
      state,
    });
    return `https://discord.com/api/oauth2/authorize?${params}`;
  }

  async handleCallback(code) {
    // In production: POST to https://discord.com/api/oauth2/token
    return {
      access_token: `discord_access_${Date.now()}`,
      refresh_token: `discord_refresh_${Date.now()}`,
      expiry_date: Date.now() + 7 * 24 * 3600 * 1000,
    };
  }

  async testConnection(tokens) {
    // In production: GET https://discord.com/api/users/@me
    return { connected: true, username: 'AgentflowBot#0001' };
  }

  async refreshToken(tokens) {
    // In production: POST to discord token endpoint with grant_type=refresh_token
    return {
      ...tokens,
      access_token: `discord_refreshed_${Date.now()}`,
      expiry_date: Date.now() + 7 * 24 * 3600 * 1000,
    };
  }

  async executeAction(action, inputs, tokens) {
    console.log(`[Discord] Executing action: ${action}`, inputs);

    switch (action) {
      case 'send_message': {
        const { channelId, content } = inputs;
        // In production: POST to https://discord.com/api/channels/{channelId}/messages
        // using the bot token or webhook URL
        console.log(`[Discord] Sending message to channel ${channelId}: ${content}`);
        return { success: true, messageId: `mock_discord_${Date.now()}`, channelId };
      }
      case 'send_webhook': {
        const { webhookUrl, content, username } = inputs;
        // In production: POST to the webhookUrl directly (no auth needed)
        console.log(`[Discord] Sending webhook message: ${content}`);
        return { success: true, webhookUrl };
      }
      default:
        throw new Error(`Discord: Unknown action '${action}'`);
    }
  }
}

module.exports = new DiscordIntegration();
