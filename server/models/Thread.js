// models/Thread.js
// Thread
const mongoose = require("mongoose");

const schema = new mongoose.Schema(
{
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        index: true
    },

    channel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Channel",
        index: true
    },

    parentMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
        index: true
    },

    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    content: String,

    mentions: [
        { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    ],

    resolved:{
      type:Boolean,
      default:false
    }
},
{ timestamps: true }
);

module.exports = mongoose.model("Thread", schema);

