// server/controllers/notificationController.js
const Notification = require("../models/Notification");


// GET MY
exports.mine = async (req, res) => {
  const list = await Notification.find({ user: req.user._id })
    .sort("-createdAt")
    .limit(50)
    .populate("actor", "name avatar");

  res.json(list);
};


// MARK READ
exports.read = async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
  res.json({ success: true });
};


// READ ALL
exports.readAll = async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, isRead: false },
    { isRead: true }
  );

  res.json({ success: true });
};

