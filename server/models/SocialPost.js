const mongoose = require("mongoose");

const postNoteSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    nodeId: { type: String, default: null },
    important: { type: Boolean, default: false },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const schema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", index: true, required: true },
    channel: { type: mongoose.Schema.Types.ObjectId, ref: "Channel", index: true, default: null },

    title: { type: String, required: true, trim: true },
    caption: { type: String, default: "" },
    contentType: { type: String, enum: ["image", "video", "text", "carousel", "blog"], default: "text" },
    contentHtml: { type: String, default: "" },

    imageUrl: { type: String, default: "" },
    videoUrl: { type: String, default: "" },
    media: [
      {
        type: {
          type: String,
          enum: ["image", "video"],
        },
        name: { type: String, default: "" },
        url: { type: String, default: "" },
      },
    ],

    platforms: [{ type: String, enum: ["facebook", "instagram", "x", "linkedin", "youtube", "tiktok"] }],

    status: {
      type: String,
      enum: ["draft", "review", "planned", "scheduled", "published", "cancelled"],
      default: "draft",
      index: true,
    },

    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    scheduledAt: { type: Date, default: null, index: true },
    publishedAt: { type: Date, default: null },

    tags: [{ type: String }],
    notes: [postNoteSchema],

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SocialPost", schema);
