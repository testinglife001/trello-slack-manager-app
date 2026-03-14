// 📁 controllers/canvasHistoryController.js
// List versions
const Version = require("../models/CanvasVersion");
const Canvas = require("../models/CanvasDocument");

exports.list = async (req, res) => {
  const items = await Version.find({
    channel: req.params.channelId
  })
    .sort("-version")
    .limit(100)
    .populate("createdBy", "name");

  res.json(items);
};

exports.getVersion = async (req, res) => {
  const v = await Version.findOne({
    channel: req.params.channelId,
    version: req.params.version
  });

  res.json(v);
};



exports.restore = async (req, res) => {
  const v = await Version.findOne({
    channel: req.params.channelId,
    version: req.params.version
  });

  if (!v) return res.status(404).end();

  const doc = await Canvas.findOneAndUpdate(
    { channel: req.params.channelId },
    {
      content: v.snapshot,
      version: v.version
    },
    { new: true }
  );

  global.io.to(req.params.channelId).emit("canvas:restore", doc);

  res.json(doc);
};

