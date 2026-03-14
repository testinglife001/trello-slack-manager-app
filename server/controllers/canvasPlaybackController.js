// 2.2 canvasPlaybackController.js
const CanvasVersion = require("../models/CanvasVersion");
const CanvasOperation = require("../models/CanvasOperation");

exports.playback = async (req, res) => {
  const { channelId } = req.params;
  const { fromVersion } = req.query;

  let snapshot;
  if (fromVersion) {
    snapshot = await CanvasVersion.findOne({
      channel: channelId,
      version: Number(fromVersion)
    });
  } else {
    snapshot = await CanvasVersion.findOne({ channel: channelId }).sort("-version");
  }

  const baseVersion = snapshot?.version || 0;

  const operations = await CanvasOperation.find({
    channel: channelId,
    version: { $gt: baseVersion }
  }).sort("version");

  res.json({
    snapshot: snapshot?.snapshot || { nodes: [] },
    startVersion: baseVersion,
    operations
  });
};