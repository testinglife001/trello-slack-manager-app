// 📁 routes/threads.js
const router = require("express").Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/threadController");

router.get("/:id", auth, ctrl.history);
router.post("/", auth, ctrl.create);

router.get("/", auth, ctrl.byMessage);
router.put("/:id/resolve",auth,ctrl.resolve);

module.exports = router;
