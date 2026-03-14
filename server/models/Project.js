// models/Project.js

const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true, index: true },
    description: String,

    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },

    visibility: { type: String, enum: ["private", "public"], default: "private" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
