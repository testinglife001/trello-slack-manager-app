// 📁 controllers/canvasActivitiesController.js
const CanvasActivity = require("../models/CanvasActivity");
const { recordActivity } = require("../services/canvasActivityService");
// const { recordActivity } = require("../services/canvasActivityService");
// const { recordActivity } = require("../services/canvasActivityService");
// const { recordActivity } = require("../services/canvasActivityService");

async function createActivity(req, res) {
  try {
    const activity = await recordActivity(req.body);
    res.status(201).json(activity);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getCanvasActivity(req, res) {
  try {
    const { canvasId } = req.params;

    const activities = await CanvasActivity
      .find({ canvasId })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(activities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  createActivity,
  getCanvasActivity
};
