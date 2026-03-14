// services/activityService.js
// server/services/activityService.js
const Activity = require("../models/Activity");
const { getIO } = require("../sockets/io");
const { notifyUsers } = require("./notificationService");
// const { getIO } = require("../sockets/io");

const clean = (users = [], actor) => {
  const set = new Set();

  users.forEach(u => {
    const id = u.toString();
    if (id !== actor.toString()) set.add(id);
  });

  return [...set];
};

exports.emitActivity = async ({
  type,
  actor,
  refModel,
  refId,
  users = [],
  meta = {}
}) => {
  const recipients = clean(users, actor);

  if (recipients.length) {
    await notifyUsers(recipients, {
      type,
      actor,
      refModel,
      refId,
      meta
    });
  }

  // realtime broadcast
  const io = getIO();
  if (io) {
    io.emit("activity:event", {
      type,
      actor,
      refModel,
      refId,
      meta
    });
  }
};



exports.logActivity = async ({
  project,
  actor,
  type,
  refModel,
  refId,
  meta = {}
}) => {
  try {
    const activity = await Activity.create({
      project,
      actor,
      type,
      refModel,
      refId,
      meta
    });

    const io = getIO();
    if (io && project) {
      io.to(`project:${project.toString()}`).emit(
        "activity:new",
        activity
      );
    }

    return activity;
  } catch (err) {
    console.error("Activity log error:", err.message);
  }
};



exports.log = async ({
  project,
  actor,
  entityType,
  entityId,
  action,
  diff = null,
  meta = {},
  isAudit = false
}) => {
  const activity = await Activity.create({
    project,
    actor,
    entityType,
    entityId,
    action,
    diff,
    meta,
    isAudit
  });

  // realtime broadcast to project room
  const io = getIO();
  if (io && project) {
    io.to(`project:${project.toString()}`).emit("activity:new", activity);
  }

  return activity;
};




/*
const Activity = require("../models/Activity");

exports.log = async ({ project, actor, type, entity, entityId, data }) => {
  try {
    await Activity.create({ project, actor, type, entity, entityId, data });
  } catch {}
};
*/
