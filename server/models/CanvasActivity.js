// models/CanvasActivity.js
const mongoose = require("mongoose");

const CanvasActivitySchema = new mongoose.Schema(
  {
    canvasId: { 
      type: String, 
      required: true,
      index: true 
    },

    userId: { 
      type: String, 
      required: true 
    },

    username: { 
      type: String, 
      required: true 
    },

    type: {
      type: String,
      required: true,
      enum: [
        "OBJECT_ADD",
        "OBJECT_UPDATE",
        "OBJECT_DELETE",
        "CANVAS_PAN",
        "CANVAS_ZOOM",
        "LAYER_REORDER",
        "NODE_EDIT",
        "COMMENT",
        "UNDO",
        "REDO"
      ]
    },

    objectId: {
      type: String,
      default: null
    },

    metadata: {
      before: mongoose.Schema.Types.Mixed,
      after: mongoose.Schema.Types.Mixed,
      position: mongoose.Schema.Types.Mixed,
      extra: mongoose.Schema.Types.Mixed
    },

    mentions: {
      type: [String],
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("CanvasActivity", CanvasActivitySchema);
