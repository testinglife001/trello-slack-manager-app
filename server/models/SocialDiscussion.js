const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", index: true, required: true },
    channel: { type: mongoose.Schema.Types.ObjectId, ref: "Channel", index: true, default: null },
    socialPost: { type: mongoose.Schema.Types.ObjectId, ref: "SocialPost", default: null },

    message: { type: String, required: true, trim: true },
    kind: { type: String, enum: ["discussion", "context", "note"], default: "discussion" },
    important: { type: Boolean, default: false },

    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SocialDiscussion", schema);
