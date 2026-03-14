// models/CanvasNotification.js
const mongoose = require("mongoose");

const CanvasNotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },

    canvasId: {
      type: String,
      required: true
    },

    type: {
      type: String,
      enum: ["mention", "activity", "assignment"],
      required: true
    },

    message: {
      type: String,
      required: true
    },

    activityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CanvasActivity"
    },

    read: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("CanvasNotification", CanvasNotificationSchema);
