// server/controllers/cardController.js
const Card = require("../models/Card");
const Attachment = require("../models/Attachment");
const CardNote = require("../models/CardNote");
const SubtaskNote = require("../models/SubtaskNote");
const { notifyUsers } = require("../services/notificationService");
const Note = require("../models/Note");
const { extractMentions } = require("../utils/mentionParser");
const { computeDiff } = require("../utils/diffEngine");
const Activity = require("../models/Activity");
const { emitActivity, logActivity } = require("../services/activityService");
// const { computeDiff } = require("../utils/diffEngine");
const activity = require("../services/activityService");


// helper
const normalize = (arr = []) =>
  [...new Set(arr.map(id => id.toString()))];



/* =====================================================
   CREATE CARD
===================================================== */
exports.create = async (req, res) => {
  try {
    if (!req.body.title?.trim()) {
      return res.status(400).json({ message: "Title required" });
    }

    const assignees = normalize(req.body.assignees || []);

    const card = await Card.create({
      ...req.body,
      title: req.body.title.trim(),
      assignees,
      watchers: normalize([
        ...(req.body.watchers || []),
        req.user._id   // creator auto watches
      ]),
      createdBy: req.user._id
    });

    // 🔔 notify assignees (except actor)
    if (assignees.length) {
      await notifyUsers(assignees, {
        type: "card_assigned",
        actor: req.user._id,
        refModel: "Card",
        refId: card._id,
        meta: { title: card.title }
      });
    }

    // eventService.cardUpdated(card, req.user._id);
   

    await emitActivity({
      type: "card_created",
      actor: req.user._id,
      refModel: "Card",
      refId: card._id,
      users: assignees,
      meta: { title: card.title }
    });

    // const { logActivity } = require("../services/activityService");
    /*
    await logActivity({
      project: card.project,
      actor: req.user._id,
      type: "card_created",
      refModel: "Card",
      refId: card._id,
      meta: { title: card.title }
    });
    */


    res.json(card);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Create failed" });
  }
};


/* =====================================================
   GET CARD ACTIVITY
===================================================== */
exports.getActivity = async (req, res) => {
  try {
    const activity = await Activity.find({ entityId: req.params.id })
      .sort("-createdAt")
      .populate("actor", "name avatar");
      
    res.json(activity);
  } catch (err) {
    console.error("Get activity error:", err);
    res.status(500).json({ message: "Failed to fetch activity" });
  }
};



/* =====================================================
   CARDS BY LIST
===================================================== */
exports.byList = async (req, res) => {
  const cards = await Card.find({ list: req.params.listId })
    .sort("order")
    .populate("assignees", "name avatar");

  res.json(cards);
};

/* =====================================================
   CARDS BY PROJECT
===================================================== */
exports.byProject = async (req, res) => {
  try {
    const cards = await Card.find({ project: req.params.projectId })
      .sort("order")
      .populate("assignees", "name avatar")
      .populate("list", "name")
      .populate("board", "name"); // ⬅️ THIS IS THE FIX

    res.json(cards);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Fetch failed" });
  }
};



/* =====================================================
   GET FULL CARD (MODAL)
===================================================== */
exports.getOne = async (req, res) => {
  const card = await Card.findById(req.params.id)
    .populate("assignees", "name avatar")
    .populate("watchers", "name avatar");

  if (!card) return res.status(404).json({ message: "Not found" });

  const attachments = await Attachment.find({ linkedCard: card._id });
  const Subtask = require("../models/Subtask");
  const subtasks = await Subtask.find({ card: card._id }).sort("order");

  res.json({ card, attachments, subtasks });
};



/* =====================================================
   UPDATE CARD
===================================================== */
exports.update = async (req, res) => {
  try {
    const old = await Card.findById(req.params.id);
    if (!old) return res.status(404).json({ message: "Not found" });

    let nextAssignees = old.assignees.map(u => u.toString());

    if (req.body.assignees) {
      nextAssignees = normalize(req.body.assignees);
      req.body.assignees = nextAssignees;
    }

    const card = await Card.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    // ===============================
    // detect new assignees
    // ===============================
    if (req.body.assignees) {
      const before = old.assignees.map(u => u.toString());
      const after = nextAssignees;

      const added = after.filter(id => !before.includes(id));

      if (added.length) {
        await notifyUsers(added, {
          type: "card_assigned",
          actor: req.user._id,
          refModel: "Card",
          refId: card._id,
          meta: { title: card.title }
        });
      }
    }

    await logActivity({
      project: card.project,
      actor: req.user._id,
      type: "card_updated",
      refModel: "Card",
      refId: card._id,
      meta: { changes: req.body }
    });

    const diff = computeDiff(old, card, [
      "title",
      "priority",
      "dueDate",
      "list"
    ]);

    if (diff) {
      await activity.log({
        project: card.project,
        actor: req.user._id,
        entityType: "card",
        entityId: card._id,
        action: "updated",
        diff,
        meta: { title: card.title }
      });
    }

    res.json(card);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
};

/*
exports.update = async (req, res) => {
  try {
    const old = await Card.findById(req.params.id);
    if (!old) return res.status(404).json({ message: "Not found" });

    const card = await Card.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    const recipients = new Set();

    card.assignees?.forEach(u => recipients.add(u.toString()));
    card.watchers?.forEach(u => recipients.add(u.toString()));

    if (recipients.size) {
      await notifyUsers([...recipients], {
        type: "card_updated",
        actor: req.user._id,
        refModel: "Card",
        refId: card._id,
        meta: { title: card.title }
      });
    }

    res.json(card);

  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};

*/



/* =====================================================
   TOGGLE TIMER
===================================================== */
exports.toggleTimer = async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) return res.status(404).json({ message: "Not found" });

    if (card.isTimerRunning) {
      // STOP TIMER
      const now = new Date();
      const diff = Math.floor((now - new Date(card.timerStartedAt)) / 1000);
      
      card.timeTracked = (card.timeTracked || 0) + diff;
      card.isTimerRunning = false;
      card.timerStartedAt = null;

      await logActivity({
        project: card.project,
        actor: req.user._id,
        type: "timer_stopped",
        refModel: "Card",
        refId: card._id,
        meta: { duration: diff, total: card.timeTracked }
      });
    } else {
      // START TIMER
      // First, stop any other timers for this user in this project? (Optional but good)
      await Card.updateMany(
        { project: card.project, isTimerRunning: true }, 
        { isTimerRunning: false, timerStartedAt: null } // This is a simplified logic
      );

      card.isTimerRunning = true;
      card.timerStartedAt = new Date();

      await logActivity({
        project: card.project,
        actor: req.user._id,
        type: "timer_started",
        refModel: "Card",
        refId: card._id
      });
    }

    await card.save();
    res.json(card);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Timer toggle failed" });
  }
};


/* =====================================================
   DELETE
===================================================== */
exports.remove = async (req, res) => {
  await Card.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};

exports.createCardNote = async (req, res) => {
  try {
    const { content, sharedWith = [] } = req.body;

    const mentions = await extractMentions(content);

    const note = await CardNote.create({
      card: req.params.id,
      author: req.user._id,
      content,
      sharedWith,
      mentions
    });

    const recipients = new Set();

    sharedWith.forEach(u =>
      recipients.add(u.toString())
    );

    mentions.forEach(u =>
      recipients.add(u.toString())
    );

    if (recipients.size) {
      await notifyUsers([...recipients], {
        type: "card_note_created",
        actor: req.user._id,
        refModel: "CardNote",
        refId: note._id
      });
    }

    res.json(note);

  } catch (err) {
    res.status(500).json({ message: "Create failed" });
  }
};


