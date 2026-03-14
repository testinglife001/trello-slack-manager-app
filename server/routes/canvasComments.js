// 📁 routes/canvasComments.js
const router = require("express").Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/canvasCommentController");

router.get("/:channelId", auth, ctrl.list);
router.post("/", auth, ctrl.create);
router.get("/channel/:channelId", auth, ctrl.byChannel);
router.get("/:channelId/:nodeId",auth,ctrl.byNode);
router.put("/:id/resolve",auth,ctrl.resolve);
router.put("/:id/pin",auth,ctrl.pin);

module.exports = router;
