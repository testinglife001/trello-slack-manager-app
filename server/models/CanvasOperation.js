// 📁 models/CanvasOperation.js
const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", index: true },
  channel: { type: mongoose.Schema.Types.ObjectId, ref: "Channel", index: true },
  
  op: mongoose.Schema.Types.Mixed, // raw operation {type, payload, nodeId, etc}
  version: Number,                 // version number
  actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  // optional mentions for notifications
  mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
}, { timestamps: true });

schema.index({ channel: 1, version: 1 });

module.exports = mongoose.model("CanvasOperation", schema);