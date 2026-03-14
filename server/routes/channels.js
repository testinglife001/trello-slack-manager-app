// routes/channels.js
const router = require("express").Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/channelController");

// router.post("/", auth, ctrl.create);
router.get("/project/:id", auth, ctrl.byProject);
router.get("/:id", auth, ctrl.getOne);  // ⭐ THIS IS REQUIRED

module.exports = router;
