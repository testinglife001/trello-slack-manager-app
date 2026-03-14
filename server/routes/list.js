// server/routes/list.js
const router = require("express").Router();

const auth = require("../middleware/auth");
const ctrl = require("../controllers/listController");
const List = require("../models/List");

router.post("/", auth, ctrl.create);

router.put("/reorder", auth, async (req, res) => {
  const { lists } = req.body; // [{_id, order}]

  for (const l of lists) {
    await List.findByIdAndUpdate(l._id, { order: l.order });
  }

  res.json({ success: true });
});




router.get("/board/:boardId", auth, ctrl.byBoard);
router.put("/:id", auth, ctrl.update);
router.delete("/:id", auth, ctrl.remove);


module.exports = router;
