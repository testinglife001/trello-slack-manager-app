// server/services/searchRanker.js
const dayjs = require("dayjs");

exports.rankResults = ({ user, intent, cards, channels, notes }) => {
  const results = [];

  const scoreBase = (r) => {
    let s = 0;

    // recency boost
    if (r.updatedAt)
      s += Math.max(0, 100 - dayjs().diff(r.updatedAt, "hour"));

    // assigned to me
    if (intent.assignee && r.assignees?.includes(intent.assignee))
      s += 200;

    // priority
    if (intent.priority && r.priority === intent.priority)
      s += 150;

    // unread
    if (r.unread) s += 120;

    return s;
  };

  cards.forEach(c =>
    results.push({ type: "card", ...c.toObject(), score: scoreBase(c) })
  );

  channels.forEach(c =>
    results.push({ type: "channel", ...c.toObject(), score: scoreBase(c) })
  );

  notes.forEach(n =>
    results.push({ type: "note", ...n.toObject(), score: scoreBase(n) })
  );

  return results.sort((a, b) => b.score - a.score);
};

