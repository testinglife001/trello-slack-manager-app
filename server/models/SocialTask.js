const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", index: true, required: true },
    channel: { type: mongoose.Schema.Types.ObjectId, ref: "Channel", index: true, default: null },

    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },

    status: {
      type: String,
      enum: ["todo", "in_progress", "review", "done"],
      default: "todo",
      index: true,
    },

    priority: { type: String, enum: ["low", "normal", "high", "urgent"], default: "normal" },
    dueDate: { type: Date, default: null },

    assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    socialPost: { type: mongoose.Schema.Types.ObjectId, ref: "SocialPost", default: null },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SocialTask", schema);
