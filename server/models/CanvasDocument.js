// models/CanvasDocument.js
const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true
    },

    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
      unique: true, // 🚀 ONE DOC PER CHANNEL
      index: true
    },

    title: { type: String, default: "Canvas" },

    // MUST match reducer
    content: {
      type: mongoose.Schema.Types.Mixed,
      default: { nodes: [] }
    },

    version: { type: Number, default: 0 },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("CanvasDocument", schema);
