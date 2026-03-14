// models/SubtaskNote.js
const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    subtask: { type: mongoose.Schema.Types.ObjectId, ref: "Subtask", index: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // content
    title: String,
    content: mongoose.Schema.Types.Mixed,
    sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    history: [
      {
        content: mongoose.Schema.Types.Mixed,
        editedAt: Date
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("SubtaskNote", schema);
