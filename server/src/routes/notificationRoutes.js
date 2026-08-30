const express = require('express');
const NotificationController = require('../controllers/notificationController');
const { authMiddleware } = require('./authRoutes');

const router = express.Router();

router.use(authMiddleware);

router.get('/', NotificationController.list);
router.patch('/:id/read', NotificationController.markRead);
router.patch('/read-all', NotificationController.markAllRead);

module.exports = router;
