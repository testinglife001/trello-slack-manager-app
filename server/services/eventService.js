// /services/eventService.js
const { notifyUsers } = require("./notificationService");
const { getIO } = require("../sockets/io");

exports.emitEvent = async ({
  type,
  actor,
  refModel,
  refId,
  users = [],
  meta = {}
}) => {

  // Database notifications
  await notifyUsers(users, {
    type,
    actor,
    refModel,
    refId,
    meta
  });

  // Realtime broadcast
  const io = getIO();
  if (io) {
    io.emit("event", {
      type,
      actor,
      refModel,
      refId,
      meta
    });
  }
};














/*
const { notifyUsers } = require("./notificationService");

exports.cardAssigned = (card, actor) => {
  notifyUsers(card.assignees, {
    type: "card_assigned",
    actor,
    refModel: "Card",
    refId: card._id,
    meta: { title: card.title }
  });
};

exports.cardUpdated = (card, actor) => {
  notifyUsers(card.watchers, {
    type: "card_updated",
    actor,
    refModel: "Card",
    refId: card._id
  });
};
*/
