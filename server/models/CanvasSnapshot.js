// 📌 models/CanvasSnapshot.js


const mongoose = require("mongoose");

const canvasSnapshotSchema = new mongoose.Schema(
  {
    board: { type: mongoose.Schema.Types.ObjectId, ref: "CanvasBoard" },
    fabricJson: { type: Object },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CanvasSnapshot", canvasSnapshotSchema);
