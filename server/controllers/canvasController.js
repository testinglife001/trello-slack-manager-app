// controllers/canvasController.js
const { v4: uuid } = require("uuid");
const Canvas = require("../models/CanvasDocument");
const CanvasOperation = require("../models/CanvasOperation");
const Activity = require("../models/Activity");
const { extractMentions } = require("../utils/mentionParser");
const { getYDoc }  = require("../services/crdtService.js");
const Y  = require("yjs");



// ======================================
// GET /canvas/:channelId
// ======================================
exports.get = async (req, res) => {
  try {
    const { id } = req.params;

    let doc = await Canvas.findOne({ channel: id });

    if (!doc) {
      const channel = await Channel.findById(id).select("project");

      if (!channel) {
        return res.status(404).json({ message: "Channel not found" });
      }

      doc = await Canvas.create({
        channel: id,
        project: channel.project,
        content: { nodes: [] },
        updatedBy: req.user._id
      });
    }

    res.json(doc);
  } catch (err) {
    console.error("Canvas get error", err);
    res.status(500).json({ message: "Load failed" });
  }
};



// ======================================
// PUT /canvas/:channelId
// snapshot save
// ======================================
exports.save = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await Canvas.findOneAndUpdate(
      { channel: id },
      {
        content: req.body.content,
        version: req.body.version,
        updatedBy: req.user._id
      },
      { new: true, upsert: true }
    );

    res.json(doc);
  } catch (err) {
    console.error("Canvas save error", err);
    res.status(500).json({ message: "Save failed" });
  }
};




// Load canvas + Yjs doc
exports.loadCanvas = async (req, res) => {
  const { id } = req.params;
  let doc = await Canvas.findOne({ channel: id });

  if (!doc) {
    doc = await Canvas.create({ channel: id, content: { nodes: [] } });
  }

  const ydoc = getYDoc(id);

  // Restore Fabric JSON from MongoDB if first time
  if (doc.content) {
    Y.applyUpdate(ydoc, Buffer.from(doc.content));
  }

  res.json({ doc });
};

// Save snapshot to MongoDB
exports.saveCanvas = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  await Canvas.findOneAndUpdate(
    { channel: id },
    { content, updatedAt: new Date() },
    { upsert: true }
  );

  // Update Yjs doc for all clients
  const ydoc = getYDoc(id);
  Y.applyUpdate(ydoc, Buffer.from(content));

  res.json({ ok: true });
};






// Save canvas + track changes
exports.saveCanvasWithActivity = async (req, res) => {
  try {
    const { id: channelId } = req.params;
    const { content, ops } = req.body;
    const actorId = req.user._id;

    const canvasDoc = await Canvas.findOneAndUpdate(
      { channel: channelId },
      {
        content,
        $inc: { version: 1 },
        updatedBy: actorId,
      },
      { new: true, upsert: true }
    );

    const newVersion = canvasDoc.version;

    for (const op of ops) {
      // Save operation
      const savedOp = await CanvasOperation.create({
        channel: channelId,
        project: canvasDoc.project,
        op,
        actor: actorId,
        version: newVersion,
      });

      // Extract mentions
      const mentions = await extractMentions(op?.text || "");

      // Save activity
      await Activity.create({
        project: canvasDoc.project,
        actor: actorId,
        entityType: "canvasNode",
        entityId: op.id,
        action: op.type,
        diff: op,
        mentions,
      });

      // ─────────────────────────────
      // REALTIME EMITS
      // ─────────────────────────────

      // 1️⃣ Canvas update to channel
      global.io
        .to(`channel:${channelId}`)
        .emit("canvas:update", {
          op: savedOp,
          actor: {
            _id: actorId,
            name: req.user.name,
          },
          version: newVersion,
        });

      // 2️⃣ Mention notifications
      mentions.forEach((uid) => {
        global.io
          .to(`user:${uid}`)
          .emit("mention", {
            channelId,
            actor: {
              _id: actorId,
              name: req.user.name,
            },
            op,
          });
      });

      // 3️⃣ Activity feed broadcast
      global.io
        .to(`project:${canvasDoc.project}`)
        .emit("activity:new", {
          _id: uuid(), // Temp ID for the realtime activity
          project: canvasDoc.project,
          actor: { _id: actorId, name: req.user.name },
          entityType: "canvasNode",
          entityId: op.id,
          action: op.type,
          type: "canvas:update",
          meta: op,
          createdAt: new Date().toISOString()
        });
    }

    res.json({ doc: canvasDoc });
  } catch (err) {
    console.error("Canvas save error:", err);
    res.status(500).json({ message: "Save failed" });
  }
};

