// server/services/notificationService.js
const Notification = require("../models/Notification");
const { getIO } = require("../sockets/io");


// remove duplicates + actor
const cleanUsers = (users = [], actor) => {
  const map = new Set();

  users.forEach(u => {
    const id = u.toString();
    if (id !== actor.toString()) map.add(id);
  });

  return [...map];
};


exports.notifyUsers = async (users, payload) => {
  try {
    if (!users || users.length === 0) return;

    const recipients = cleanUsers(users, payload.actor);
    if (recipients.length === 0) return;

    const docs = recipients.map(u => ({
      user: u,
      type: payload.type,
      actor: payload.actor,
      refModel: payload.refModel,
      refId: payload.refId,
      meta: payload.meta || {}
    }));

    // write database
    const created = await Notification.insertMany(docs);

    // realtime
    const io = getIO();
    if (io) {
      recipients.forEach(u => {
        io.to(u.toString()).emit("notification:new", {
          type: payload.type,
          actor: payload.actor,
          refModel: payload.refModel,
          refId: payload.refId,
          meta: payload.meta || {}
        });
      });
    }

    return created;
  } catch (err) {
    console.error("Notification error:", err.message);
  }
};


// add inside notificationService.js
exports.notifyMention = (users, actor, model, id) =>
  exports.notifyUsers(users, {
    type: "mention",
    actor,
    refModel: model,
    refId: id
  });

exports.notifyShare = (users, actor, model, id) =>
  exports.notifyUsers(users, {
    type: "shared",
    actor,
    refModel: model,
    refId: id
  });
