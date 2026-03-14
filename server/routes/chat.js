// 📁 server/routes/chat.js
const router = require("express").Router();
const auth = require("../middleware/auth");
const Message = require("../models/Message");
const ctrl=require("../controllers/chatController");

/*
// GET history
router.get("/:channelId", auth, async (req, res) => {
  const list = await Message.find({ channel: req.params.channelId })
    .sort("-createdAt")
    .limit(50)
    .populate("sender", "name avatar");

  res.json(list.reverse());
});
*/


// CREATE message
router.post("/", auth, async (req, res) => {
  const msg = await Message.create({
    ...req.body,
    sender: req.user._id
  });

  const populated = await msg.populate("sender", "name avatar");

  res.json(populated);
});

router.get("/:id",auth,ctrl.history);
router.post("/read",auth,ctrl.markRead);

router.put("/:id",auth,ctrl.edit);
router.delete("/:id",auth,ctrl.delete);


module.exports = router;
