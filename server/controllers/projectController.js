// server/controllers/projectController.js

const mongoose = require("mongoose");
const Project = require("../models/Project");
const ProjectMember = require("../models/ProjectMember");
const Card = require("../models/Card");
const User = require("../models/User");
const Message = require("../models/Message");


// helper
const resolveProjectId = async (idOrSlug) => {
  if (mongoose.Types.ObjectId.isValid(idOrSlug)) return idOrSlug;
  const project = await Project.findOne({ slug: idOrSlug }).select("_id");
  return project ? project._id : null;
};


// CREATE PROJECT
exports.create = async (req, res) => {
  try {
    const { name, description, visibility } = req.body;

    const project = await Project.create({
      name,
      description,
      visibility,
      owner: req.user._id,
      slug: name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now()
    });

    // creator becomes admin
    await ProjectMember.create({
      project: project._id,
      user: req.user._id,
      role: "admin",
      permissions: []
    });

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: "Create project failed" });
  }
};


// MY PROJECTS
exports.myProjects = async (req, res) => {
  try {
    const memberships = await ProjectMember.find({
      user: req.user._id
    }).populate("project");

    const projects = memberships.map(m => m.project);

    res.json(projects);
  } catch {
    res.status(500).json({ message: "Failed" });
  }
};


// GET SINGLE
exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;
    let project;

    if (mongoose.Types.ObjectId.isValid(id)) {
      project = await Project.findById(id);
    } else {
      project = await Project.findOne({ slug: id });
    }

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (err) {
    console.error("Get project error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};


// UPDATE
exports.update = async (req, res) => {
  try {
    const projectId = await resolveProjectId(req.params.id);
    if (!projectId) return res.status(404).json({ message: "Project not found" });

    const project = await Project.findByIdAndUpdate(
      projectId,
      req.body,
      { new: true }
    );
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};


// DELETE
exports.remove = async (req, res) => {
  try {
    const projectId = await resolveProjectId(req.params.id);
    if (!projectId) return res.status(404).json({ message: "Project not found" });

    await Project.findByIdAndDelete(projectId);
    await ProjectMember.deleteMany({ project: projectId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};

// NEW: ANALYTICS
exports.getAnalytics = async (req, res) => {
  try {
    const projectId = await resolveProjectId(req.params.id);
    
    // In a real app, we'd aggregate data from Cards, Activities, etc.
    const activeTasks = await Card.countDocuments({ project: projectId, archived: false });
    const completedTasks = await Card.countDocuments({ project: projectId, listName: "Done" }); // adjust based on your logic
    const teamSize = await ProjectMember.countDocuments({ project: projectId });
    
    // Mock some contributors
    const topUsers = await User.find().limit(3).select("name avatar");
    const contributors = topUsers.map((u, i) => ({
      name: u.name,
      avatar: u.avatar,
      taskCount: 15 - (i * 3)
    }));

    res.json({
      activeTasks,
      completedTasks,
      teamSize,
      contributors
    });
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ message: "Failed to load analytics" });
  }
};

// NEW: INBOX (Mock data for now, but querying real messages)
exports.getInbox = async (req, res) => {
  try {
    const projectId = await resolveProjectId(req.params.id);

    // Get some recent messages from this project's channels
    const messages = await Message.find({ project: projectId })
      .sort("-createdAt")
      .limit(20)
      .populate("sender", "name avatar");

    // Map to inbox format
    const inboxItems = messages.map(m => ({
      _id: m._id,
      sender: m.sender,
      subject: `New message in channel`,
      content: m.content,
      read: true,
      createdAt: m.createdAt
    }));

    res.json(inboxItems);
  } catch (err) {
    console.error("Inbox error:", err);
    res.status(500).json({ message: "Failed to load inbox" });
  }
};


