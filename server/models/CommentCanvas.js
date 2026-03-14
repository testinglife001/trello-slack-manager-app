const mongoose = require("mongoose");
const CommentCanvasSchema = new mongoose.Schema(
  {
    canvasId: String,
    objectId: String,
    text: String,
    author: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("CommentCanvas", CommentCanvasSchema);

