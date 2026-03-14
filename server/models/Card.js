// // models/Card.js
const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", index: true },
    board: { type: mongoose.Schema.Types.ObjectId, ref: "Board", index: true },
    list: { type: mongoose.Schema.Types.ObjectId, ref: "List", index: true },

    title: { type: String, required: true },
    description: mongoose.Schema.Types.Mixed,

    priority: { type: String, default: "normal" },
    status: { type: String, default: "todo" },
    labels: [String],

    startDate: Date,
    dueDate: Date,

    assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    watchers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    checklistProgress: { type: Number, default: 0 }, // %
    timeTracked: { type: Number, default: 0 }, // seconds
    isTimerRunning: { type: Boolean, default: false },
    timerStartedAt: Date,

    attachmentsCount: { type: Number, default: 0 },
    subtaskCount: { type: Number, default: 0 },
    completedSubtaskCount: { type: Number, default: 0 },

    order: Number,

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

schema.virtual("isOverdue").get(function () {
  return this.dueDate && new Date() > this.dueDate;
});

schema.index({ title: "text" });

module.exports = mongoose.model("Card", schema);
