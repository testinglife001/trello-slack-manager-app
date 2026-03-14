// server/models/Notification.js
const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },

    type: String, // mention, share, etc

    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    refModel: String,
    refId: mongoose.Schema.Types.ObjectId,

    meta: mongoose.Schema.Types.Mixed,

    isRead: { type: Boolean, default: false }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model("Notification", schema);
