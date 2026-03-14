// utils/mentionParser.js

const User = require("../models/User");

exports.extractMentions = async (content) => {
  const matches = [...content.matchAll(/@([a-zA-Z0-9_]+)/g)];
  const usernames = matches.map(m => m[1]);

  const users = await User.find({ username: { $in: usernames } });
  return users.map(u => u._id);
};
