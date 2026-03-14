// controllers/subtaskController.js
const Subtask = require("../models/Subtask");
const SubtaskNote = require("../models/SubtaskNote");
const Card = require("../models/Card");
const { notifyUsers } = require("../services/notificationService");
const { emitEvent } = require("../services/eventService");

const recalc = async (cardId) => {
  const total = await Subtask.countDocuments({ card: cardId });
  const done = await Subtask.countDocuments({ card: cardId, completed: true });

  const progress = total === 0 ? 0 : Math.round((done / total) * 100);

  await Card.findByIdAndUpdate(cardId, {
    subtaskCount: total,
    completedSubtaskCount: done,
    checklistProgress: progress
  });
};


// CREATE
exports.create = async (req, res) => {
  try {
    const subtask = await Subtask.create(req.body);

    const card = await Card.findById(subtask.card);

    if (card?.assignees?.length) {
      await notifyUsers(card.assignees, {
        type: "subtask_added",
        actor: req.user._id,
        refModel: "Subtask",
        refId: subtask._id,
        meta: { title: subtask.title }
      });
    }

   /*  
    await emitEvent({
      type: "subtask_created",
      actor: req.user._id,
      refModel: "Subtask",
      refId: subtask._id,
      users: card.assignees,
      meta: { title: subtask.title }
    });
    */
   
    await recalc(subtask.card);
    res.json(subtask);
  } catch (err) {
    res.status(500).json({ message: "Create failed" });
  }
};


// UPDATE
exports.update = async (req, res) => {
  const subtask = await Subtask.findByIdAndUpdate(req.params.id, req.body, { new: true });
  const card = await Card.findById(subtask.card);

  if (card?.assignees?.length) {
    await notifyUsers(card.assignees, {
      type: "subtask_added",
      actor: req.user._id,
      refModel: "Subtask",
      refId: subtask._id,
      meta: { title: subtask.title }
    });
  }
  await recalc(subtask.card);
  res.json(subtask);
};


// DELETE
exports.remove = async (req, res) => {
  try {
    const s = await Subtask.findById(req.params.id);

    if (!s) {
      return res.status(404).json({ message: "Subtask not found" });
    }

    await Subtask.findByIdAndDelete(req.params.id);

    // Remove associated notes
    await SubtaskNote.deleteMany({ subtask: s._id });

    if (s.card) {
      await recalc(s.card);
      
      const card = await Card.findById(s.card);

      if (card?.assignees?.length) {
        await notifyUsers(card.assignees, {
          type: "subtask_deleted",
          actor: req.user._id,
          refModel: "Subtask",
          refId: s._id,
          meta: { title: s.title }
        });
      }
    }
   
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete failed" });
  }
};



// BY CARD
exports.byCard = async (req, res) => {
  const list = await Subtask.find({ card: req.params.cardId }).sort("order");
  res.json(list);
};

