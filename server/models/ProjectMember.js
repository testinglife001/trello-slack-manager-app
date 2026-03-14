// models/ProjectMember.js

const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },

  role: { type: String, enum: ["admin", "member", "guest"], default: "member" },
  permissions: [String],

  joinedAt: { type: Date, default: Date.now }
});

schema.index({ project: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("ProjectMember", schema);
