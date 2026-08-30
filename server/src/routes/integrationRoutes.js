const express = require('express');
const IntegrationController = require('../controllers/integrationController');
const { authMiddleware } = require('./authRoutes');

const router = express.Router();

// OAuth callbacks don't use JWT auth middleware typically since they come from third-party redirects
// But state param carries the user ID. 
router.get('/oauth/:provider/callback', IntegrationController.handleOAuthCallback);

// Protected routes
router.use(authMiddleware);
router.get('/status', IntegrationController.getStatus);
router.get('/oauth/:provider/start', IntegrationController.startOAuth);
router.post('/:provider/disconnect', IntegrationController.disconnect);

module.exports = router;
