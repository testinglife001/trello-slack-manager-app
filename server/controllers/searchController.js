// controllers/searchController.js
const Card = require("../models/Card");
const Channel = require("../models/Channel");
const Note = require("../models/Note");
const { parseIntent } = require("../utils/searchIntent");
const { rankResults } = require("../services/searchRanker");

exports.search = async (req, res) => {
  const q = req.query.q || "";
  const intent = parseIntent(q, req.user);

  const [cards, channels, notes] = await Promise.all([
    Card.find({ $text: { $search: q } }).limit(20),
    Channel.find({ name: new RegExp(q, "i") }).limit(10),
    Note.find({ $text: { $search: q } }).limit(10)
  ]);

  const ranked = rankResults({
    user: req.user,
    intent,
    cards,
    channels,
    notes
  });

  res.json(ranked.slice(0, 20));
};
