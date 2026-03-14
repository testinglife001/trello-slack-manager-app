// server/routes/notifications.js
const router = require("express").Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/notificationController");

router.get("/", auth, ctrl.mine);
router.put("/:id/read", auth, ctrl.read);
router.put("/read-all", auth, ctrl.readAll);

module.exports = router;
