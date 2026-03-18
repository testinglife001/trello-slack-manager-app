const SocialPost = require("../models/SocialPost");
const SocialTask = require("../models/SocialTask");
const SocialDiscussion = require("../models/SocialDiscussion");

exports.overview = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { channelId } = req.query;

    const scope = { project: projectId };
    if (channelId) scope.channel = channelId;

    const [posts, tasks, discussions] = await Promise.all([
      SocialPost.find(scope)
        .sort("-createdAt")
        .limit(100)
        .populate("assignedTo", "name avatar username")
        .populate("createdBy", "name avatar username"),
      SocialTask.find(scope)
        .sort("status dueDate")
        .limit(200)
        .populate("assignees", "name avatar username")
        .populate("socialPost", "title status platforms"),
      SocialDiscussion.find(scope)
        .sort("-createdAt")
        .limit(200)
        .populate("author", "name avatar username")
        .populate("socialPost", "title"),
    ]);

    res.json({ posts, tasks, discussions });
  } catch (err) {
    console.error("Social overview error", err);
    res.status(500).json({ message: "Failed to load social media overview" });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { projectId } = req.params;
    const payload = req.body || {};

    const post = await SocialPost.create({
      project: projectId,
      channel: payload.channel || null,
      title: payload.title,
      caption: payload.caption || "",
      contentHtml: payload.contentHtml || "",
      contentType: payload.contentType || "text",
      imageUrl: payload.imageUrl || "",
      videoUrl: payload.videoUrl || "",
      platforms: Array.isArray(payload.platforms) ? payload.platforms : [],
      media: Array.isArray(payload.media) ? payload.media : [],
      status: payload.status || "draft",
      assignedTo: Array.isArray(payload.assignedTo) ? payload.assignedTo : [],
      scheduledAt: payload.scheduledAt || null,
      tags: Array.isArray(payload.tags) ? payload.tags : [],
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    res.status(201).json(post);
  } catch (err) {
    console.error("Create social post error", err);
    res.status(500).json({ message: "Failed to create social post" });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const updates = { ...req.body, updatedBy: req.user._id };
    const post = await SocialPost.findByIdAndUpdate(req.params.postId, updates, { new: true });
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    console.error("Update social post error", err);
    res.status(500).json({ message: "Failed to update social post" });
  }
};

exports.removePost = async (req, res) => {
  try {
    await SocialPost.findByIdAndDelete(req.params.postId);
    await SocialTask.deleteMany({ socialPost: req.params.postId });
    await SocialDiscussion.deleteMany({ socialPost: req.params.postId });
    res.json({ success: true });
  } catch (err) {
    console.error("Remove social post error", err);
    res.status(500).json({ message: "Failed to delete social post" });
  }
};

exports.schedulePost = async (req, res) => {
  try {
    const { scheduledAt } = req.body;
    const post = await SocialPost.findByIdAndUpdate(
      req.params.postId,
      {
        status: "scheduled",
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        updatedBy: req.user._id,
      },
      { new: true }
    );

    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    console.error("Schedule social post error", err);
    res.status(500).json({ message: "Failed to schedule post" });
  }
};

exports.publishPost = async (req, res) => {
  try {
    const post = await SocialPost.findByIdAndUpdate(
      req.params.postId,
      {
        status: "published",
        publishedAt: new Date(),
        updatedBy: req.user._id,
      },
      { new: true }
    );
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    console.error("Publish social post error", err);
    res.status(500).json({ message: "Failed to publish post" });
  }
};

exports.addPostNote = async (req, res) => {
  try {
    const { text, nodeId, important } = req.body;
    const post = await SocialPost.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.notes.unshift({
      text,
      nodeId: nodeId || null,
      important: !!important,
      author: req.user._id,
    });
    post.updatedBy = req.user._id;

    await post.save();
    const saved = await SocialPost.findById(post._id)
      .populate("notes.author", "name avatar username")
      .populate("assignedTo", "name avatar username");

    res.status(201).json(saved);
  } catch (err) {
    console.error("Add post note error", err);
    res.status(500).json({ message: "Failed to add post note" });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const payload = req.body || {};

    const task = await SocialTask.create({
      project: projectId,
      channel: payload.channel || null,
      title: payload.title,
      description: payload.description || "",
      status: payload.status || "todo",
      priority: payload.priority || "normal",
      dueDate: payload.dueDate || null,
      assignees: Array.isArray(payload.assignees) ? payload.assignees : [],
      socialPost: payload.socialPost || null,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    res.status(201).json(task);
  } catch (err) {
    console.error("Create social task error", err);
    res.status(500).json({ message: "Failed to create social task" });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const updates = { ...req.body, updatedBy: req.user._id };
    const task = await SocialTask.findByIdAndUpdate(req.params.taskId, updates, { new: true })
      .populate("assignees", "name avatar username")
      .populate("socialPost", "title status");

    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (err) {
    console.error("Update social task error", err);
    res.status(500).json({ message: "Failed to update social task" });
  }
};

exports.removeTask = async (req, res) => {
  try {
    await SocialTask.findByIdAndDelete(req.params.taskId);
    res.json({ success: true });
  } catch (err) {
    console.error("Remove social task error", err);
    res.status(500).json({ message: "Failed to delete social task" });
  }
};

exports.createDiscussion = async (req, res) => {
  try {
    const { projectId } = req.params;
    const payload = req.body || {};

    const discussion = await SocialDiscussion.create({
      project: projectId,
      channel: payload.channel || null,
      socialPost: payload.socialPost || null,
      message: payload.message,
      kind: payload.kind || "discussion",
      important: !!payload.important,
      author: req.user._id,
    });

    const populated = await SocialDiscussion.findById(discussion._id)
      .populate("author", "name avatar username")
      .populate("socialPost", "title");

    res.status(201).json(populated);
  } catch (err) {
    console.error("Create social discussion error", err);
    res.status(500).json({ message: "Failed to create discussion message" });
  }
};

exports.removeDiscussion = async (req, res) => {
  try {
    await SocialDiscussion.findByIdAndDelete(req.params.discussionId);
    res.json({ success: true });
  } catch (err) {
    console.error("Remove discussion error", err);
    res.status(500).json({ message: "Failed to delete discussion" });
  }
};
