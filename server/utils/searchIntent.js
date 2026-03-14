// server/utils/searchIntent.js
exports.parseIntent = (q, user) => {
  const intent = {
    assignee: null,
    priority: null,
    keywords: []
  };

  const text = q.toLowerCase();

  if (text.includes("my")) intent.assignee = user._id;
  if (text.includes("urgent") || text.includes("high"))
    intent.priority = "high";

  intent.keywords = text.split(" ");

  return intent;
};
