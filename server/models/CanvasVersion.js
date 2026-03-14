// 📁 models/CanvasVersion.js
const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", index: true },
  channel: { type: mongoose.Schema.Types.ObjectId, ref: "Channel", index: true },

  version: Number,
  snapshot: mongoose.Schema.Types.Mixed, // entire canvas JSON
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

module.exports = mongoose.model("CanvasVersion", schema);