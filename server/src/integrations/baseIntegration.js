class BaseIntegration {
  constructor(providerName) {
    this.providerName = providerName;
  }

  /**
   * Returns the OAuth authorization URL for this provider.
   * @param {string} state - User ID or CSRF token to pass through the OAuth flow
   * @returns {string} URL to redirect the user to
   */
  getAuthUrl(state) {
    throw new Error('getAuthUrl must be implemented');
  }

  /**
   * Exchanges the authorization code for access/refresh tokens.
   * @param {string} code - Authorization code from OAuth callback
   * @returns {Promise<object>} Token object { access_token, refresh_token, expiry_date }
   */
  async handleCallback(code) {
    throw new Error('handleCallback must be implemented');
  }

  /**
   * Verifies that the stored tokens are valid and the integration is connected.
   * @param {object} tokens - Decrypted token object
   * @returns {Promise<object>} Status object { connected: boolean, ... }
   */
  async testConnection(tokens) {
    throw new Error('testConnection must be implemented');
  }

  /**
   * Uses the refresh token to obtain a new access token.
   * @param {object} tokens - Current token object containing refresh_token
   * @returns {Promise<object>} New token object
   */
  async refreshToken(tokens) {
    throw new Error('refreshToken must be implemented');
  }

  /**
   * Executes an action against the third-party service.
   * @param {string} action - Action name (e.g. 'send_email', 'post_message')
   * @param {object} inputs - Action-specific input parameters
   * @param {object} tokens - Decrypted OAuth tokens
   * @returns {Promise<object>} Action result
   */
  async executeAction(action, inputs, tokens) {
    throw new Error('executeAction must be implemented');
  }
}

module.exports = BaseIntegration;
