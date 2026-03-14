// server/controllers/boardController.js
const Board = require("../models/Board");
const List = require("../models/List");
const Card = require("../models/Card");
const ProjectMember = require("../models/ProjectMember");
const { notifyUsers } = require("../services/notificationService");




// CREATE
exports.create = async (req, res) => {
  try {
    const board = await Board.create({
      project: req.body.project,
      name: req.body.name,
      order: req.body.order || 0,
      createdBy: req.user._id
    });

    res.json(board);
  } catch {
    res.status(500).json({ message: "Create board failed" });
  }
};


// GET BY PROJECT
exports.byProject = async (req, res) => {
  const boards = await Board.find({ project: req.params.projectId })
    .sort("order");

  res.json(boards);
};


// UPDATE
exports.update = async (req, res) => {
  const old = await Board.findById(req.params.id);
  const board = await Board.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  if (!old) return res.status(404).json({ message: "Not found" });

  // Only notify if name changed
  if (req.body.name && old.name !== req.body.name) {
    const members = await ProjectMember.find({
      project: board.project
    }).select("user");

    const users = members.map(m => m.user.toString());

    await notifyUsers(users, {
      type: "board_renamed",
      actor: req.user._id,
      refModel: "Board",
      refId: board._id,
      meta: { name: board.name }
    });
  }

  res.json(board);
};



// DELETE
exports.remove = async (req, res) => {
  await Board.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};


// controller
exports.fullBoard = async (req, res) => {
  const lists = await List.find({ board: req.params.id })
    .sort("order")
    .lean();

  for (const l of lists) {
    l.cards = await Card.find({ list: l._id }).sort("order");
  }

  res.json(lists);
};


exports.full = async (req, res) => {
  try {
    const boardId = req.params.id;

    // find lists
    const lists = await List.find({ board: boardId }).lean();

    // attach cards
    for (const list of lists) {
      list.cards = await Card.find({ list: list._id })
        .sort("order")
        .lean();
    }

    res.json(lists);
  } catch (err) {
    console.error("Board full error:", err);
    res.status(500).json({ message: "Failed" });
  }
};



