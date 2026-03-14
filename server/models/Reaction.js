// models/Reaction.js
// Reaction
const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    message: { type: mongoose.Schema.Types.ObjectId, ref: "Message", index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    emoji: String
  },
  { timestamps: true }
);

schema.index({ message: 1, user: 1, emoji: 1 }, { unique: true });

module.exports = mongoose.model("Reaction", schema);
