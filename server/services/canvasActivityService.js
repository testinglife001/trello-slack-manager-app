// services/canvasActivityService.js
const CanvasActivity = require("../models/CanvasActivity");
const CanvasNotification = require("../models/CanvasNotification");
const { extractMentions } = require("../utils/mentionParser");
// const { extractMentions } = require("./mentionParser");

async function recordActivity(payload) {
  if (
    !payload ||
    !payload.canvasId ||
    !payload.userId ||
    !payload.username ||
    !payload.type
  ) {
    throw new Error("Invalid activity payload");
  }

  let textContent = "";

  if (
    payload.metadata &&
    payload.metadata.after &&
    typeof payload.metadata.after === "object"
  ) {
    textContent =
      payload.metadata.after.text ||
      payload.metadata.after.content ||
      "";
  }

  const mentions = extractMentions(textContent);

  const activity = await CanvasActivity.create({
    ...payload,
    mentions
  });

  if (mentions.length > 0) {
    const uniqueMentions = [...new Set(mentions)];

    const notifications = uniqueMentions.map(username => ({
      userId: username, // replace with real userId lookup
      canvasId: payload.canvasId,
      type: "mention",
      message: `${payload.username} mentioned you`,
      activityId: activity._id
    }));

    if (notifications.length) {
      await CanvasNotification.insertMany(notifications, { ordered: false });
    }
  }

  return activity;
}

module.exports = {
  recordActivity
};
