// 📁 controllers/canvasNotificationController.js

const CanvasNotification = require("../models/CanvasNotification");

async function getUserNotifications(req, res) {
  try {
    const { userId } = req.params;

    const data = await CanvasNotification
      .find({ userId })
      .sort({ createdAt: -1 });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function markRead(req, res) {
  try {
    await CanvasNotification.findByIdAndUpdate(
      req.params.id,
      { read: true }
    );

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getUserNotifications,
  markRead
};

