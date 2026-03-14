// 📌 controllers/mycanvas.controller.js
const CanvasRoom = require("../models/CanvasRoom");
const CanvasBoard = require("../models/CanvasBoard");
const CanvasSnapshot = require("../models/CanvasSnapshot");
const ActivityCanvas = require("../models/ActivityCanvas");
const CanvasFile = require("../models/CanvasFile");

/* =============================
   ROOM
============================= */

exports.createOrGetRoom = async (req, res) => {
  const { channelId } = req.params;

  let room = await CanvasRoom.findOne({ channelId });

  if (!room) {
    room = await CanvasRoom.create({
      channelId,
      name: "New Canvas Room",
      createdBy: req.user._id,
      members: [req.user._id],
    });

    await CanvasBoard.create({
      room: room._id,
      name: "Board 1",
    });
  }

  res.json(room);
};

/* =============================
   BOARD
============================= */

exports.getBoards = async (req, res) => {
  const { roomId } = req.params;

  const boards = await CanvasBoard.find({ room: roomId });
  res.json(boards);
};

exports.saveBoardState = async (req, res) => {
  const { boardId } = req.params;
  const { fabricJson } = req.body;

  const board = await CanvasBoard.findByIdAndUpdate(
    boardId,
    {
      fabricJson,
      lastEditedBy: req.user._id,
    },
    { new: true }
  );

  await CanvasSnapshot.create({
    board: boardId,
    fabricJson,
    createdBy: req.user._id,
  });

  res.json(board);
};

/* =============================
   SNAPSHOTS
============================= */

exports.getSnapshots = async (req, res) => {
  const { boardId } = req.params;
  const snapshots = await CanvasSnapshot.find({ board: boardId }).sort({ createdAt: -1 });
  res.json(snapshots);
};

/* =============================
   ACTIVITY
============================= */

exports.logActivity = async (req, res) => {
  const { roomId, boardId, action, metadata } = req.body;

  const activity = await ActivityCanvas.create({
    room: roomId,
    board: boardId,
    user: req.user._id,
    action,
    metadata,
  });

  res.json(activity);
};

exports.getActivity = async (req, res) => {
  const { roomId } = req.params;

  const logs = await ActivityCanvas.find({ room: roomId })
    .populate("user", "username")
    .sort({ createdAt: -1 })
    .limit(100);

  res.json(logs);
};

/* =============================
   FILE
============================= */

exports.saveFileMeta = async (req, res) => {
  const file = await CanvasFile.create({
    ...req.body,
    uploadedBy: req.user._id,
  });

  res.json(file);
};
