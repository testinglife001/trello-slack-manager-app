const SocialPost = require("../models/SocialPost");
const SocialTask = require("../models/SocialTask");
const SocialDiscussion = require("../models/SocialDiscussion");
const ProjectMember = require("../models/ProjectMember");

const MODEL_BY_ENTITY = {
  postId: SocialPost,
  taskId: SocialTask,
  discussionId: SocialDiscussion,
};

module.exports = (paramName) => {
  return async (req, res, next) => {
    try {
      const id = req.params[paramName];
      if (!id) return res.status(400).json({ message: `${paramName} is required` });

      const Model = MODEL_BY_ENTITY[paramName];
      if (!Model) return res.status(500).json({ message: "Entity guard misconfigured" });

      const doc = await Model.findById(id).select("project");
      if (!doc) return res.status(404).json({ message: "Resource not found" });

      const member = await ProjectMember.findOne({
        project: doc.project,
        user: req.user._id,
      }).select("_id role permissions");

      if (!member) return res.status(403).json({ message: "Not a project member" });

      req.projectId = doc.project;
      req.projectRole = member.role;
      req.projectPermissions = member.permissions || [];
      next();
    } catch (err) {
      console.error("Social entity access check failed", err);
      res.status(500).json({ message: "Permission check failed" });
    }
  };
};
