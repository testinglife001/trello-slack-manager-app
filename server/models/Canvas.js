// models/Canvas.js
// Canvas
const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", index: true },
    channel: { type: mongoose.Schema.Types.ObjectId, ref: "Channel", index: true },

    title: String,
    content: mongoose.Schema.Types.Mixed,

    version: { type: Number, default: 1 },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("CanvasDocument", schema);
