// 📁 utils/extractMentions.js
const User = require("../models/User");

module.exports = async function extractMentions(text) {
  const matches = text.match(/@(\w+)/g) || [];
  const names = matches.map(m => m.slice(1));

  const users = await User.find({ username: { $in: names } });

  return users.map(u => u._id);
};
