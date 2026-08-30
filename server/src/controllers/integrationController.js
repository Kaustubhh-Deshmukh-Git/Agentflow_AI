const IntegrationService = require('../services/integrationService');

class IntegrationController {
  static async getStatus(req, res) {
    try {
      const statuses = await IntegrationService.getStatus(req.user.id);
      res.json(statuses);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async startOAuth(req, res) {
    const { provider } = req.params;
    // In a real app, we would redirect to Google/Slack OAuth URL
    // For this prototype, we'll simulate a redirect to a mock consent screen
    const mockAuthUrl = `${process.env.CLIENT_URL}/integrations?mock_oauth=${provider}&state=${req.user.id}`;
    res.json({ url: mockAuthUrl });
  }

  static async handleOAuthCallback(req, res) {
    const { provider } = req.params;
    const { code, state: userId } = req.query;

    try {
      // Simulate token exchange
      const mockTokens = {
        access_token: `mock_access_${provider}_${Date.now()}`,
        refresh_token: `mock_refresh_${provider}_${Date.now()}`,
        expiry_date: Date.now() + 3600000 // 1 hour
      };

      await IntegrationService.saveCredentials(userId, provider, mockTokens);
      
      // Redirect back to frontend
      res.redirect(`${process.env.CLIENT_URL}/integrations?success=${provider}`);
    } catch (error) {
      res.redirect(`${process.env.CLIENT_URL}/integrations?error=${provider}`);
    }
  }

  static async disconnect(req, res) {
    const { provider } = req.params;
    try {
      // For now, we simulate disconnect by overriding with empty tokens and isConnected = false
      if (require('mongoose').connection.readyState === 1) {
        await require('../models/Integration').findOneAndUpdate(
          { owner: req.user.id, provider },
          { isConnected: false, encryptedTokens: null }
        );
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = IntegrationController;
