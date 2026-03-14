// server/controllers/listController.js
const List = require("../models/List");
const ProjectMember = require("../models/ProjectMember");
const { notifyUsers } = require("../services/notificationService");


// CREATE
exports.create = async (req, res) => {
  const list = await List.create(req.body);

  const members = await ProjectMember.find({
    project: req.body.project
  }).select("user");

  const users = members.map(m => m.user.toString());

  if (users.length) {
    await notifyUsers(users, {
      type: "list_created",
      actor: req.user._id,
      refModel: "List",
      refId: list._id
    });
  }

  res.json(list);
};



// GET BY BOARD
exports.byBoard = async (req, res) => {
  const lists = await List.find({ board: req.params.boardId })
    .sort("order");

  res.json(lists);
};


// UPDATE
exports.update = async (req, res) => {
  const list = await List.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(list);
};


// DELETE
exports.remove = async (req, res) => {
  await List.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};
