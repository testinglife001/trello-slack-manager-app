// routes/card.js
// Example → create board
// server/routes/board.js
const router = require("express").Router();

const auth = require("../middleware/auth");
const isMember = require("../middleware/projectMember");

const ctrl = require("../controllers/boardController");


router.post("/", auth, isMember("body"), ctrl.create);
router.get("/project/:projectId", auth, isMember(), ctrl.byProject);
router.put("/:id", auth, ctrl.update);
router.delete("/:id", auth, ctrl.remove);

// routes/boards.js
router.get("/:id/fullboard", auth, ctrl.fullBoard);
router.get("/:id/full", auth, ctrl.full);



module.exports = router;

/*
const router = require("express").Router();
const ctrl = require("../controllers/cardController");
const auth = require("../middleware/auth");
const isMember = require("../middleware/projectMember");
const roleGuard = require("../middleware/roleGuard");

router.post(
  "/",
  auth,
  isMember("body"),
  roleGuard("admin"),
  controller.create
);

module.exports = router;
*/
