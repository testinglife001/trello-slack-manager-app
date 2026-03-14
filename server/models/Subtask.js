// models/Subtask.js
const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    card: { type: mongoose.Schema.Types.ObjectId, ref: "Card", index: true },
    parentSubtask: { type: mongoose.Schema.Types.ObjectId, ref: "Subtask", default: null },

    title: String,
    completed: { type: Boolean, default: false },

    assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    dueDate: Date,

    order: Number
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subtask", schema);
