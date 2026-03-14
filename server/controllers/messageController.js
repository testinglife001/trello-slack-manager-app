// controllers/messageController.js
const Message = require("../models/Message");
const { extractMentions } = require("../utils/mentionParser");
const { emitEvent } = require("../services/eventService");

exports.create = async (req, res) => {
  const message = await Message.create({
    channel: req.body.channel,
    sender: req.user._id,
    content: req.body.content
  });

  const mentions = await extractMentions(message.content);

  if (mentions.length) {
    await emitEvent({
      type: "mention",
      actor: req.user._id,
      refModel: "Message",
      refId: message._id,
      users: mentions,
      meta: { channel: message.channel }
    });
  }

  await emitActivity({
    type: "message_sent",
    actor: req.user._id,
    refModel: "Message",
    refId: message._id,
    users: channelMembers,
    meta: { channel: message.channel }
  });


  res.json(await message.populate("sender", "name avatar"));
};


exports.history = async (req, res) => {
  const list = await Message.find({ channel: req.params.id })
    .sort("-createdAt")
    .limit(50)
    .populate("sender", "name avatar");

  res.json(list.reverse());
};
