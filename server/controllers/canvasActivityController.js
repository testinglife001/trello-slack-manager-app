// canvasActivityController.js
const CanvasOperation = require("../models/CanvasOperation");
const CanvasVersion = require("../models/CanvasVersion");
const Activity = require("../models/Activity");

exports.logOperation = async ({ project, channel, actor, op, diff, meta, mentions }) => {
  // get latest version
  const lastOp = await CanvasOperation.findOne({ channel }).sort("-version");
  const version = lastOp ? lastOp.version + 1 : 1;

  // save operation
  const operation = await CanvasOperation.create({ project, channel, actor, op, version, mentions });

  // save activity feed
  await Activity.create({
    project,
    actor,
    entityType: op.entityType || "canvas",
    entityId: op.nodeId || channel,
    action: op.action || "updated",
    diff,
    meta,
    mentions
  });

  // real-time notifications for mentions
  if (mentions && mentions.length) {
    mentions.forEach(userId => {
      global.io.to(`user:${userId}`).emit("mention", { channel, op, actor });
    });
  }

  return operation;
};

// Snapshot periodically or manually
exports.createSnapshot = async ({ project, channel, snapshot, createdBy }) => {
  const lastVersion = await CanvasVersion.findOne({ channel }).sort("-version");
  const version = lastVersion ? lastVersion.version + 1 : 1;

  const canvasVersion = await CanvasVersion.create({ project, channel, version, snapshot, createdBy });
  return canvasVersion;
};