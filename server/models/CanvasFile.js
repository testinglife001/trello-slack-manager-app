// 📌 models/CanvasFile.js



const mongoose = require("mongoose");

const canvasFileSchema = new mongoose.Schema(
  {
    room: { type: mongoose.Schema.Types.ObjectId, ref: "CanvasRoom" },
    board: { type: mongoose.Schema.Types.ObjectId, ref: "CanvasBoard" },

    name: String,
    type: String,
    size: Number,
    url: String,

    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CanvasFile", canvasFileSchema);
