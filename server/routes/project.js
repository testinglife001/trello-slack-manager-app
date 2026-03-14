// server/routes/project.js

const router = require("express").Router();

const auth = require("../middleware/auth");
const isMember = require("../middleware/projectMember");
const roleGuard = require("../middleware/roleGuard");

const projectCtrl = require("../controllers/projectController");
const memberCtrl = require("../controllers/projectMemberController");


// PROJECT CRUD
router.post("/", auth, projectCtrl.create);
router.get("/", auth, projectCtrl.myProjects);

// directory
router.get("/users", auth, memberCtrl.listAll);


router.get("/:id", auth, projectCtrl.getOne);
router.put("/:id", auth, isMember(), roleGuard("admin"), projectCtrl.update);
router.delete("/:id", auth, isMember(), roleGuard("admin"), projectCtrl.remove);

// NEW: Analytics & Inbox
router.get("/:id/analytics", auth, isMember(), projectCtrl.getAnalytics);
router.get("/:id/inbox", auth, isMember(), projectCtrl.getInbox);



// MEMBERSHIP
router.post(
  "/:projectId/members",
  auth,
  isMember(),
  roleGuard("admin"),
  memberCtrl.add
);



router.get(
  "/:projectId/members",
  auth,
  isMember(),
  memberCtrl.list
);

router.put(
  "/members/:memberId",
  auth,
  memberCtrl.updateRole
);

router.delete(
  "/members/:memberId",
  auth,
  memberCtrl.remove
);

module.exports = router;
