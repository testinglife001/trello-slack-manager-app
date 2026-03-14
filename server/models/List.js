// models/List.js

const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  board: { type: mongoose.Schema.Types.ObjectId, ref: "Board", index: true },
  name: String,
  order: Number
});

module.exports = mongoose.model("List", schema);
