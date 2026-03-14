// controllers/channelController.js
const Channel = require("../models/Channel");

exports.create = async (req, res) => {
  const channel = await Channel.create({
    ...req.body
  });
  res.json(channel);
};

exports.byProject = async (req, res) => {
  const list = await Channel.find({ project: req.params.id });
  res.json(list);
};

// GET ONE CHANNEL
exports.getOne = async (req, res) => {
  const channel = await Channel.findById(req.params.id);
  if (!channel) return res.status(404).json({ message: "Not found" });
  res.json(channel);
};


