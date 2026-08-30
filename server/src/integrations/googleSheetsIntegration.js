const BaseIntegration = require('./baseIntegration');

class GoogleSheetsIntegration extends BaseIntegration {
  constructor() {
    super('google-sheets');
  }

  getAuthUrl(state) {
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || 'GOOGLE_CLIENT_ID_NOT_SET',
      redirect_uri: `${process.env.SERVER_URL || 'http://localhost:5000'}/api/integrations/oauth/google-sheets/callback`,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      access_type: 'offline',
      prompt: 'consent',
      state,
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }

  async handleCallback(code) {
    return {
      access_token: `sheets_access_${Date.now()}`,
      refresh_token: `sheets_refresh_${Date.now()}`,
      expiry_date: Date.now() + 3600 * 1000,
    };
  }

  async testConnection(tokens) {
    return { connected: true, quota: { used: 0, total: 100 } };
  }

  async refreshToken(tokens) {
    return {
      ...tokens,
      access_token: `sheets_refreshed_${Date.now()}`,
      expiry_date: Date.now() + 3600 * 1000,
    };
  }

  async executeAction(action, inputs, tokens) {
    console.log(`[Google Sheets] Executing action: ${action}`, inputs);

    switch (action) {
      case 'append_row': {
        const { spreadsheetId, range, values } = inputs;
        // In production: POST to https://sheets.googleapis.com/v4/spreadsheets/{id}/values/{range}:append
        console.log(`[Sheets] Appending row to ${spreadsheetId} range ${range}:`, values);
        return { success: true, updatedRange: range, updatedRows: 1, spreadsheetId };
      }
      case 'read_range': {
        const { spreadsheetId, range } = inputs;
        // In production: GET https://sheets.googleapis.com/v4/spreadsheets/{id}/values/{range}
        console.log(`[Sheets] Reading range ${range} from ${spreadsheetId}`);
        return { success: true, values: [['Col A', 'Col B'], ['val1', 'val2']], range };
      }
      case 'clear_range': {
        const { spreadsheetId, range } = inputs;
        console.log(`[Sheets] Clearing range ${range}`);
        return { success: true, cleared: true, range };
      }
      default:
        throw new Error(`GoogleSheets: Unknown action '${action}'`);
    }
  }
}

module.exports = new GoogleSheetsIntegration();
