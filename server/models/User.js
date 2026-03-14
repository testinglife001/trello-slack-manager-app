// User Model
// models/User.js

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, trim: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },

    avatar: String,
    bio: String,
    location: { type: String, default: "" },
    website: { type: String, default: "" },
    social: {
      github: String,
      twitter: String,
      linkedin: String
    },

    roleGlobal: { type: String, enum: ["superadmin", "user"], default: "user" },

    isOnline: { type: Boolean, default: false, index: true },
    lastSeen: Date
  },
  { timestamps: true }
);

userSchema.index({ name: "text", username: "text" });



module.exports = mongoose.model("User", userSchema);
