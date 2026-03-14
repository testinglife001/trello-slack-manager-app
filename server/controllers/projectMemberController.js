// server/controllers/projectMemberController.js
const ProjectMember = require("../models/ProjectMember");
const User = require("../models/User");
const { emitActivity } = require("../services/activityService");
const { notifyUsers } = require("../services/notificationService");



// ADD MEMBER
exports.add = async (req, res) => {
  try {
    const { userId, role } = req.body;
    const projectId = req.projectId || req.params.projectId;

    const member = await ProjectMember.create({
      project: projectId,
      user: userId,
      role: role || "member"
    });

    await notifyUsers([userId], {
      type: "project_member_added",
      actor: req.user._id,
      refModel: "Project",
      refId: projectId
    });

    await emitActivity({
      type: "project_invited",
      actor: req.user._id,
      refModel: "Project",
      refId: projectId,
      users: [userId]
    });


    res.json(member);
  } catch (err) {
    console.error("Add member error:", err);
    res.status(500).json({ message: "Add failed" });
  }
};


// LIST MEMBERS
exports.list = async (req, res) => {
  try {
    const projectId = req.projectId || req.params.projectId;
    const members = await ProjectMember.find({
      project: projectId
    }).populate("user", "-passwordHash");

    res.json(members);
  } catch (err) {
    res.status(500).json({ message: "Failed to list members" });
  }
};


// GET ALL USERS (directory)
exports.listAll = async (req, res) => {
  try {
    const users = await User.find()
      .select("-passwordHash")
      .sort({ name: 1 });

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to load users" });
  }
};



// UPDATE ROLE
exports.updateRole = async (req, res) => {
  try {
    const member = await ProjectMember.findByIdAndUpdate(
      req.params.memberId,
      { role: req.body.role },
      { new: true }
    );

    res.json(member);
  } catch (err) {
    res.status(500).json({ message: "Update role failed" });
  }
};


// REMOVE MEMBER
exports.remove = async (req, res) => {
  try {
    await ProjectMember.findByIdAndDelete(req.params.memberId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Remove member failed" });
  }
};
