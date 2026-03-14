// server/models/Note.js
const mongoose = require("mongoose");

const historySchema = new mongoose.Schema(
  {
    content: mongoose.Schema.Types.Mixed,
    editedAt: Date,
    editedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { _id: false }
);

const schema = new mongoose.Schema(
  {
    // owner
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    // optional project
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
      index: true
    },

    // links
    linkedCard: { type: mongoose.Schema.Types.ObjectId, ref: "Card", default: null },
    linkedSubtask: { type: mongoose.Schema.Types.ObjectId, ref: "Subtask", default: null },

    // wiki
    parentNote: { type: mongoose.Schema.Types.ObjectId, ref: "Note", default: null },
    path: { type: String, index: true },

    // content
    title: String,
    content: mongoose.Schema.Types.Mixed,

    // mentions
    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // visibility
    visibility: {
      type: String,
      enum: ["private", "shared", "project", "public"],
      default: "private",
      index: true
    },

    sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // meta
    pinned: { type: Boolean, default: false },
    archived: { type: Boolean, default: false },

    favoritedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // realtime editing
    version: { type: Number, default: 1 },

    history: [historySchema]
  },
  { timestamps: true }
);

schema.index({ title: "text" });

module.exports = mongoose.model("Note", schema);
