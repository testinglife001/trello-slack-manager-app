// controllers/activityController.js
// Get project activity
const Activity = require("../models/Activity");


// By project
exports.byProject = async (req, res) => {
  const { projectId } = req.params;
  const { cursor, limit = 30 } = req.query;

  const query = { project: projectId };
  if (cursor) query.createdAt = { $lt: new Date(cursor) };

  const activities = await Activity.find(query)
    .sort("-createdAt")
    .limit(Number(limit))
    .populate("actor", "name avatar")
    .populate("project", "name");

  res.json(activities);
};

// By user
exports.byUser = async (req, res) => {
  const { cursor, limit = 30 } = req.query;
  const query = { actor: req.user._id };
  if (cursor) query.createdAt = { $lt: new Date(cursor) };

  const activities = await Activity.find(query)
    .sort("-createdAt")
    .limit(Number(limit))
    .populate("actor", "name avatar")
    .populate("project", "name");

  res.json(activities);
};


// Create activity log
exports.create = async ({ project, actor, entityType, entityId, action, diff, meta, mentions = [], highlights = [] }) => {
  const activity = await Activity.create({ project, actor, entityType, entityId, action, diff, meta, mentions, highlights });
  return activity;
};
