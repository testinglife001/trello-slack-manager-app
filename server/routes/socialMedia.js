const router = require("express").Router();
const { body, query } = require("express-validator");
const auth = require("../middleware/auth");
const isMember = require("../middleware/projectMember");
const validateRequest = require("../middleware/validateRequest");
const socialEntityAccess = require("../middleware/socialEntityAccess");
const ctrl = require("../controllers/socialMediaController");

const postCreateValidators = [
  body("title").trim().notEmpty().withMessage("title is required"),
  body("caption").optional().isString(),
  body("contentHtml").optional().isString(),
  body("contentType").optional().isIn(["image", "video", "text", "carousel", "blog"]),
  body("platforms").optional().isArray(),
  body("media").optional().isArray(),
  body("status").optional().isIn(["draft", "review", "planned", "scheduled", "published", "cancelled"]),
  body("assignedTo").optional().isArray(),
  body("tags").optional().isArray(),
  body("scheduledAt").optional({ nullable: true }).isISO8601().withMessage("scheduledAt must be ISO date"),
];

const postUpdateValidators = [
  body("title").optional().trim().notEmpty(),
  body("caption").optional().isString(),
  body("contentHtml").optional().isString(),
  body("contentType").optional().isIn(["image", "video", "text", "carousel", "blog"]),
  body("platforms").optional().isArray(),
  body("status").optional().isIn(["draft", "review", "planned", "scheduled", "published", "cancelled"]),
  body("scheduledAt").optional({ nullable: true }).isISO8601(),
];

const taskCreateValidators = [
  body("title").trim().notEmpty().withMessage("title is required"),
  body("description").optional().isString(),
  body("status").optional().isIn(["todo", "in_progress", "review", "done"]),
  body("priority").optional().isIn(["low", "normal", "high", "urgent"]),
  body("assignees").optional().isArray(),
  body("dueDate").optional({ nullable: true }).isISO8601(),
];

const taskUpdateValidators = [
  body("title").optional().trim().notEmpty(),
  body("description").optional().isString(),
  body("status").optional().isIn(["todo", "in_progress", "review", "done"]),
  body("priority").optional().isIn(["low", "normal", "high", "urgent"]),
  body("assignees").optional().isArray(),
  body("dueDate").optional({ nullable: true }).isISO8601(),
];

const discussionCreateValidators = [
  body("message").trim().notEmpty().withMessage("message is required"),
  body("kind").optional().isIn(["discussion", "context", "note"]),
  body("important").optional().isBoolean(),
];

router.get(
  "/project/:projectId",
  auth,
  isMember(),
  query("channelId").optional().isMongoId().withMessage("channelId must be a valid id"),
  validateRequest,
  ctrl.overview
);

router.post("/project/:projectId/posts", auth, isMember(), postCreateValidators, validateRequest, ctrl.createPost);
router.put("/posts/:postId", auth, socialEntityAccess("postId"), postUpdateValidators, validateRequest, ctrl.updatePost);
router.delete("/posts/:postId", auth, socialEntityAccess("postId"), ctrl.removePost);
router.put(
  "/posts/:postId/schedule",
  auth,
  socialEntityAccess("postId"),
  body("scheduledAt").optional({ nullable: true }).isISO8601().withMessage("scheduledAt must be ISO date"),
  validateRequest,
  ctrl.schedulePost
);
router.put("/posts/:postId/publish", auth, socialEntityAccess("postId"), ctrl.publishPost);
router.post(
  "/posts/:postId/notes",
  auth,
  socialEntityAccess("postId"),
  body("text").trim().notEmpty().withMessage("text is required"),
  body("important").optional().isBoolean(),
  validateRequest,
  ctrl.addPostNote
);

router.post("/project/:projectId/tasks", auth, isMember(), taskCreateValidators, validateRequest, ctrl.createTask);
router.put("/tasks/:taskId", auth, socialEntityAccess("taskId"), taskUpdateValidators, validateRequest, ctrl.updateTask);
router.delete("/tasks/:taskId", auth, socialEntityAccess("taskId"), ctrl.removeTask);

router.post(
  "/project/:projectId/discussions",
  auth,
  isMember(),
  discussionCreateValidators,
  validateRequest,
  ctrl.createDiscussion
);
router.delete("/discussions/:discussionId", auth, socialEntityAccess("discussionId"), ctrl.removeDiscussion);

module.exports = router;
