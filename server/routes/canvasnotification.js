// routes/canvasnotification.js
// 📁 routes/canvasnotification.js
const express = require("express");
const {
  getUserNotifications,
  markRead
} = require("../controllers/canvasNotificationController");

const router = express.Router();

router.get("/:userId", getUserNotifications);
router.put("/:id/read", markRead);

module.exports = router;

