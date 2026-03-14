// server/controllers/noteController.js
const mongoose = require("mongoose");
const Note = require("../models/Note");
const CardNote = require("../models/CardNote");
const SubtaskNote = require("../models/SubtaskNote");
const { notifyUsers } = require("../services/notificationService");
const { extractMentions } = require("../utils/mentionParser");
const { getIO } = require("../sockets/io");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { emitActivity, logActivity } = require("../services/activityService");

const toObjectId = (value) => {
  if (!value) return null;
  return mongoose.Types.ObjectId.isValid(value)
    ? new mongoose.Types.ObjectId(value)
    : null;
};

const buildRecipients = ({
  mentions = [],
  sharedWith = [],
  actor
}) => {
  const set = new Set();

  mentions.forEach(u => set.add(u.toString()));
  sharedWith.forEach(u => set.add(u.toString()));

  // remove actor
  set.delete(actor.toString());

  return [...set];
};



// CREATE
exports.create = async (req, res) => {
  try {
    const {
      title,
      content,
      visibility,
      sharedWith = [],
      project,
      parentNote,
      linkedCard,
      linkedSubtask,
      pinned,
      archived
    } = req.body;

    const mentions = await extractMentions(
      (title || "") + " " + JSON.stringify(content || {})
    );
    
    

    const note = await Note.create({
      title,
      content,
      visibility,
      sharedWith:
        visibility === "shared"
          ? sharedWith.map(toObjectId)
          : [],
      project: toObjectId(project),
      parentNote: toObjectId(parentNote),
      linkedCard: toObjectId(linkedCard),
      linkedSubtask: toObjectId(linkedSubtask),
      pinned: !!pinned,
      archived: !!archived,
      author: req.user._id,
      mentions,
      version: 1
    });

    // const mentions = await extractMentions(content);

    if (mentions.length) {
      await emitActivity({
        type: "mention",
        actor: req.user._id,
        refModel: "Message",
        refId: message._id,
        users: mentions
      });
    }

    const recipients = buildRecipients({
      mentions,
      sharedWith:
        visibility === "shared" ? sharedWith : [],
      actor: req.user._id
    });

    if (recipients.length) {
      await notifyUsers(recipients, {
        type: "note_created",
        actor: req.user._id,
        refModel: "Note",
        refId: note._id,
        meta: { title: note.title }
      });
    }

    if (visibility === "shared" && sharedWith?.length) {
      await emitActivity({
        type: "note_shared",
        actor: req.user._id,
        refModel: "Note",
        refId: note._id,
        users: sharedWith,
        meta: { title: note.title }
      });
    }

    /*
    await logActivity({
      project: note.project,
      actor: req.user._id,
      type: "note_created",
      refModel: "Note",
      refId: note._id,
      meta: { title: note.title }
    });
    */
   

    res.json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Create failed" });
  }
};




// GET ALL USERS (directory)
exports.allUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-passwordHash")
      .sort({ name: 1 });

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to load users" });
  }
};




// UPDATE
exports.update = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Not found" });

    if (!note.author.equals(req.user._id))
      return res.status(403).json({ message: "Not allowed" });

    const {
      title,
      content,
      visibility,
      sharedWith = [],
      pinned,
      archived,
      project,
      parentNote,
      linkedCard,
      linkedSubtask,
      path
    } = req.body;

    // ===== Save history
    note.history.push({
      content: note.content,
      editedAt: new Date(),
      editedBy: req.user._id
    });

    const oldShared = note.sharedWith.map(u => u.toString());
    const oldMentions = note.mentions?.map(u => u.toString()) || [];

    // ===== Update fields
    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (visibility !== undefined) note.visibility = visibility;
    if (pinned !== undefined) note.pinned = pinned;
    if (archived !== undefined) note.archived = archived;
    if (project !== undefined) note.project = toObjectId(project);
    if (parentNote !== undefined) note.parentNote = toObjectId(parentNote);
    if (linkedCard !== undefined) note.linkedCard = toObjectId(linkedCard);
    if (linkedSubtask !== undefined) note.linkedSubtask = toObjectId(linkedSubtask);
    if (path !== undefined) note.path = path;

    if (visibility === "shared") {
      note.sharedWith = sharedWith.map(toObjectId);
    } else {
      note.sharedWith = [];
    }

    if (visibility === "shared" && sharedWith?.length) {
      await emitActivity({
        type: "note_shared",
        actor: req.user._id,
        refModel: "Note",
        refId: note._id,
        users: sharedWith,
        meta: { title: note.title }
      });
    }


    // ===== Re-extract mentions
    const mentions = await extractMentions(
      (note.title || "") + " " + JSON.stringify(note.content || {})
    );

    note.mentions = mentions;
    note.version += 1;

    await note.save();

    // const mentions = await extractMentions(content);

    if (mentions.length) {
      await emitActivity({
        type: "mention",
        actor: req.user._id,
        refModel: "Message",
        refId: message._id,
        users: mentions
      });
    }


    // 🔥 BROADCAST LIVE UPDATE
    const { getIO } = require("../sockets/io");
    const io = getIO();

    if (io) {
      io.to(`note:${note._id}`).emit("note:remote-update", {
        content: note.content,
        version: note.version,
        editor: req.user._id
      });
    }

    // ===== Detect new shares
    const newShared = note.sharedWith.map(u => u.toString());
    const addedShared = newShared.filter(u => !oldShared.includes(u));

    // ===== Detect new mentions
    const newMentions = mentions.map(u => u.toString());
    const addedMentions = newMentions.filter(
      u => !oldMentions.includes(u)
    );

    const recipients = buildRecipients({
      mentions: addedMentions,
      sharedWith: addedShared,
      actor: req.user._id
    });

    if (recipients.length) {
      await notifyUsers(recipients, {
        type: "note_updated",
        actor: req.user._id,
        refModel: "Note",
        refId: note._id,
        meta: { title: note.title }
      });
    }

    if (visibility === "shared" && sharedWith?.length) {
      await emitActivity({
        type: "note_shared",
        actor: req.user._id,
        refModel: "Note",
        refId: note._id,
        users: sharedWith,
        meta: { title: note.title }
      });
    }
    // realtime
    // const io = getIO();
    if (io) {
      io.to(note._id.toString()).emit("note:updated", note);
      io.to(note.linkedCard?.toString()).emit("note:updated", note);
    }


    // ===== Detect revoked shares
    const removedShared = oldShared.filter(
      u => !newShared.includes(u)
    );

    if (removedShared.length) {
      // Remove their old notifications related to this note
      await Notification.deleteMany({
        user: { $in: removedShared },
        refModel: "Note",
        refId: note._id
      });

      await notifyUsers(removedShared, {
        type: "note_share_revoked",
        actor: req.user._id,
        refModel: "Note",
        refId: note._id,
        meta: { title: note.title }
      });
    }

    // const io = getIO();

    removedShared.forEach(userId => {
      io.to(userId.toString()).emit("note:share_revoked", {
        noteId: note._id
      });
    });


    res.json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
};




// DELETE
exports.remove = async (req, res) => {
  const note = await Note.findById(req.params.id);

  if (!note) return res.status(404).json({ message: "Not found" });
  if (!note.author.equals(req.user._id))
    return res.status(403).json({ message: "Not allowed" });

  await note.deleteOne();
  res.json({ success: true });
};


exports.getNotes = async (req, res) => {
  try {
    const notes = await Note.find({
      $or: [
        { owner: req.user._id },
        { sharedWith: req.user._id }
      ]
    })
      .populate("sharedWith", "name username avatar isOnline")
      .populate("owner", "name username avatar");

    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch notes" });
  }
};


exports.myNotes = async (req, res) => {
  try {
    const userId = req.user._id;
    const { project } = req.query;

    const query = {
      archived: false,
      $or: [
        { author: userId },
        { visibility: "public" },
        { sharedWith: userId },
        { visibility: "project" }
      ]

    };

    if (project) {
      query.project = project;
    }

    const notes = await Note.find(query)
      .sort({ updatedAt: -1 })
      .populate("author", "name avatar")
      .populate("project", "name")
      .lean();

    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: "Failed to load notes" });
  }
};


// NOTES BY PROJECT (Strict project filter)
exports.notesByProject = async (req, res) => {
  try {
    const userId = req.user._id;
    const { projectId } = req.params;

    const notes = await Note.find({
      project: projectId,
      archived: false,
      $or: [
        { author: userId },
        { visibility: "public" },
        { sharedWith: userId }
      ]
    })
      .sort({ updatedAt: -1 })
      .populate("author", "name avatar")
      .lean();

    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: "Failed to load project notes" });
  }
};



// WIKI CHILDREN
exports.children = async (req, res) => {
  const notes = await Note.find({ parentNote: req.params.id });
  res.json(notes);
};


// FAVORITE
exports.toggleFavorite = async (req, res) => {
  const note = await Note.findById(req.params.id);

  const exists = note.favoritedBy.some(u => u.equals(req.user._id));

  if (exists)
    note.favoritedBy = note.favoritedBy.filter(u => !u.equals(req.user._id));
  else
    note.favoritedBy.push(req.user._id);

  await note.save();
  res.json(note);
};



exports.query = async (req, res) => {
  const { linkedCard, linkedSubtask } = req.query;

  const q = {};

  if (linkedCard) q.linkedCard = linkedCard;
  if (linkedSubtask) q.linkedSubtask = linkedSubtask;

  const notes = await Note.find(q).sort("-createdAt");
  res.json(notes);
};




// CARD

/* =====================================================
   CREATE NOTE FOR CARD
===================================================== */
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




/* =====================================================
   GET NOTES BY CARD
===================================================== */
exports.getCardNotes = async (req, res) => {
  try {
    const notes = await CardNote.find({
      card: req.params.id
    })
      .sort("-createdAt")
      .populate("author", "name avatar");

    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: "Failed to load card notes" });
  }
};


/* =====================================================
   CREATE NOTE FOR SUBTASK
===================================================== */
exports.createSubtaskNote = async (req, res) => {
  try {
    const { title, content } = req.body;

    const note = new Note({
      title,
      content,
      linkedSubtask: req.params.subtaskId,
      author: req.user._id,
      visibility: "project",
      version: 1
    });

    note.mentions = await extractMentions(
      JSON.stringify(content)
    );

    await note.save();

    if (note.mentions.length) {
      await notifyUsers(note.mentions, {
        type: "mention",
        actor: req.user._id,
        refModel: "Note",
        refId: note._id
      });
    }

    res.json(note);
  } catch (err) {
    res.status(500).json({ message: "Create failed" });
  }
};


/* =====================================================
   GET NOTES BY SUBTASK
===================================================== */
exports.getSubtaskNotes = async (req, res) => {
  try {
    const notes = await SubtaskNote.find({
      subtask: req.params.subtaskId
    })
      .sort("-createdAt")
      .populate("author", "name avatar");

    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: "Failed to load subtask notes" });
  }
};



// UPDATE
exports.updateNote = async (req, res) => {
  const model = req.body.type === "card" ? CardNote : SubtaskNote;

  const note = await model.findById(req.params.id);

  note.history.push({ content: note.content, editedAt: new Date() });
  note.content = req.body.content;

  await note.save();

  res.json(note);
};


