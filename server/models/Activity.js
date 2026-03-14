// server/models/Activity.js
const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", index: true },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  
  entityType: { type: String, index: true }, // canvas, node, message
  entityId: { type: mongoose.Schema.Types.ObjectId, index: true },
  action: { type: String, index: true },    // created, updated, moved, deleted
  diff: mongoose.Schema.Types.Mixed,        // field changes
  meta: mongoose.Schema.Types.Mixed,        // optional: title, node info
  mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // for notifications
  isAudit: { type: Boolean, default: false }
}, { timestamps: true });

schema.index({ project: 1, createdAt: -1 });
schema.index({ actor: 1, createdAt: -1 });

module.exports = mongoose.model("Activity", schema);