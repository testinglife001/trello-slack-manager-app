// server/middleware/projectMember.js
const mongoose = require("mongoose");
const Project = require("../models/Project");
const ProjectMember = require("../models/ProjectMember");

module.exports = (projectIdSource = "params", paramName = "projectId") => {
  return async (req, res, next) => {
    try {
      let idOrSlug;

      if (projectIdSource === "params") idOrSlug = req.params[paramName] || req.params.id;
      if (projectIdSource === "body") idOrSlug = req.body.project || req.body.projectId;

      if (!idOrSlug) return res.status(400).json({ message: "Project missing" });

      let projectId = idOrSlug;

      // If it's a slug, we need to find the project ID first
      if (!mongoose.Types.ObjectId.isValid(idOrSlug)) {
        const project = await Project.findOne({ slug: idOrSlug }).select("_id");
        if (!project) return res.status(404).json({ message: "Project not found" });
        projectId = project._id;
      }

      const member = await ProjectMember.findOne({
        project: projectId,
        user: req.user._id
      });

      if (!member) {
        return res.status(403).json({ message: "Not a project member" });
      }

      req.projectRole = member.role;
      req.projectPermissions = member.permissions || [];
      req.projectId = projectId; // Store the actual ID for downstream use

      next();
    } catch (err) {
      console.error("Permission check error:", err);
      res.status(500).json({ message: "Permission check failed" });
    }
  };
};
