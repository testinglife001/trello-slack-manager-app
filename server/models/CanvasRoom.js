// 📌 models/CanvasRoom.js

const mongoose = require("mongoose");

const canvasRoomSchema = new mongoose.Schema(
  {
    name: { type: String, default: "Untitled Room" },
    channelId: { type: mongoose.Schema.Types.ObjectId, ref: "Channel" },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    settings: {
      leftWidth: Number,
      rightWidth: Number,
      leftOpen: Boolean,
      rightOpen: Boolean,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CanvasRoom", canvasRoomSchema);

