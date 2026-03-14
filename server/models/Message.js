// models/Message.js
// Message
const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", index: true },
    channel: { type: mongoose.Schema.Types.ObjectId, ref: "Channel", index: true },

    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    content: String,
    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    attachments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Attachment" }],

    threadCount: { type: Number, default: 0 },

    editedAt:Date,
    deletedAt:Date,

    readBy:[{
      user:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
      at:Date
    }],
    },
  { timestamps: true }
);

schema.index({ content: "text" });

module.exports = mongoose.model("Message", schema);