// 📁 routes/canvasPlayback.js
const router = require("express").Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/canvasPlaybackController");

router.get("/:channelId", auth, ctrl.playback);

module.exports = router;
