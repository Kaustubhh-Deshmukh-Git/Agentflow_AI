const Notification = require('../models/Notification');
const mongoose = require('mongoose');

let memoryNotifications = [];

class NotificationController {
  static async list(req, res) {
    try {
      let notifications;
      if (mongoose.connection.readyState === 1) {
        notifications = await Notification.find({ owner: req.user.id })
          .sort({ createdAt: -1 })
          .limit(50);
      } else {
        notifications = memoryNotifications
          .filter(n => n.owner === req.user.id)
          .slice(0, 50);
      }
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async markRead(req, res) {
    try {
      const { id } = req.params;
      if (mongoose.connection.readyState === 1) {
        await Notification.findOneAndUpdate(
          { _id: id, owner: req.user.id },
          { isRead: true }
        );
      } else {
        const n = memoryNotifications.find(n => n._id === id && n.owner === req.user.id);
        if (n) n.isRead = true;
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async markAllRead(req, res) {
    try {
      if (mongoose.connection.readyState === 1) {
        await Notification.updateMany({ owner: req.user.id, isRead: false }, { isRead: true });
      } else {
        memoryNotifications.forEach(n => {
          if (n.owner === req.user.id) n.isRead = true;
        });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Static helper used by agents/services to create notifications without HTTP context
  static async create(ownerId, data) {
    const notif = {
      owner: ownerId,
      type: data.type || 'system',
      title: data.title,
      message: data.message,
      workflowId: data.workflowId || null,
      executionId: data.executionId || null,
      isRead: false,
    };

    if (mongoose.connection.readyState === 1) {
      try {
        return await Notification.create(notif);
      } catch (_) { /* silent */ }
    } else {
      const stored = { _id: Date.now().toString(), ...notif, createdAt: new Date() };
      memoryNotifications.push(stored);
      return stored;
    }
  }
}

module.exports = NotificationController;
