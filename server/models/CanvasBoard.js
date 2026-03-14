// 📌 models/CanvasBoard.js

const mongoose = require("mongoose");

const canvasBoardSchema = new mongoose.Schema(
  {
    room: { type: mongoose.Schema.Types.ObjectId, ref: "CanvasRoom" },
    name: { type: String, default: "Board 1" },

    fabricJson: { type: Object, default: {} }, // entire canvas state

    lastEditedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CanvasBoard", canvasBoardSchema);

