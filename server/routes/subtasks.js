// routes/subtasks.js
const router = require("express").Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/subtaskController");

router.post("/", auth, ctrl.create);
router.get("/card/:cardId", auth, ctrl.byCard);
router.put("/:id", auth, ctrl.update);
router.delete("/:id", auth, ctrl.remove);

module.exports = router;
