// 📌 models/ActivityCanvas.js


const mongoose = require("mongoose");

const activityCanvasSchema = new mongoose.Schema(
  {
    room: { type: mongoose.Schema.Types.ObjectId, ref: "CanvasRoom" },
    board: { type: mongoose.Schema.Types.ObjectId, ref: "CanvasBoard" },

    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    action: String,
    metadata: Object,
  },
  { timestamps: true }
);

module.exports = mongoose.model("ActivityCanvas", activityCanvasSchema);
