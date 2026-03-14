// models/CardNote.js
const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    card: { type: mongoose.Schema.Types.ObjectId, ref: "Card", index: true },
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

module.exports = mongoose.model("CardNote", schema);
