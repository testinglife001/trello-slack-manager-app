// services/mentionParser.js
function extractMentions(text = "") {
  const regex = /@([a-zA-Z0-9_]+)/g;
  const matches = [...text.matchAll(regex)];
  return matches.map(m => m[1]);
}

module.exports = {
  extractMentions
};
