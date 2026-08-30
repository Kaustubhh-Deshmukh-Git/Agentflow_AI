const BaseIntegration = require('./baseIntegration');

class GmailIntegration extends BaseIntegration {
  constructor() {
    super('gmail');
  }

  getAuthUrl(state) {
    // In production: build real Google OAuth2 URL with gmail scopes
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || 'GOOGLE_CLIENT_ID_NOT_SET',
      redirect_uri: `${process.env.SERVER_URL || 'http://localhost:5000'}/api/integrations/oauth/gmail/callback`,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly',
      access_type: 'offline',
      prompt: 'consent',
      state,
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }

  async handleCallback(code) {
    // In production: exchange code for tokens via Google token endpoint
    // Returning mock tokens for prototype
    return {
      access_token: `gmail_access_${Date.now()}`,
      refresh_token: `gmail_refresh_${Date.now()}`,
      expiry_date: Date.now() + 3600 * 1000,
    };
  }

  async testConnection(tokens) {
    // In production: call https://www.googleapis.com/gmail/v1/users/me/profile
    return { connected: true, email: 'user@gmail.com' };
  }

  async refreshToken(tokens) {
    // In production: POST to Google token endpoint with refresh_token
    return {
      ...tokens,
      access_token: `gmail_refreshed_${Date.now()}`,
      expiry_date: Date.now() + 3600 * 1000,
    };
  }

  async executeAction(action, inputs, tokens) {
    console.log(`[Gmail] Executing action: ${action}`, inputs);

    switch (action) {
      case 'send_email': {
        // In production: use nodemailer with OAuth2 or call Gmail API
        const { to, subject, body } = inputs;
        console.log(`[Gmail] Sending email to ${to}: ${subject}`);
        return { success: true, messageId: `mock_msg_${Date.now()}`, to, subject };
      }
      case 'read_email': {
        console.log(`[Gmail] Reading latest emails`);
        return { success: true, emails: [{ id: 'mock_id', subject: 'Test Email', from: 'sender@example.com', snippet: 'Hello world...' }] };
      }
      default:
        throw new Error(`Gmail: Unknown action '${action}'`);
    }
  }
}

module.exports = new GmailIntegration();
