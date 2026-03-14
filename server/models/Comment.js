// models/Comment.js

const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    card: { type: mongoose.Schema.Types.ObjectId, ref: "Card", index: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    content: String,
    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Comment", schema);
