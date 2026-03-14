// models/Channel.js
// Channel
const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", index: true },
    name: String,
    type: { type: String, enum: ["public", "private"], default: "public" },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Channel", schema);