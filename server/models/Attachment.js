// models/Attachment.js
const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", index: true },

    linkedCard: { type: mongoose.Schema.Types.ObjectId, ref: "Card", index: true },

    fileName: String,
    mimeType: String,
    size: Number,

    localPath: String,

    cloudUrl: String,
    cloudPublicId: String,

    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attachment", schema);
