// 📁 routes/canvasHistory.js
const router = require("express").Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/canvasHistoryController");

router.get("/:channelId", auth, ctrl.list);
router.get("/:channelId/:version", auth, ctrl.getVersion);
router.post("/:channelId/restore/:version", auth, ctrl.restore);


module.exports = router;
