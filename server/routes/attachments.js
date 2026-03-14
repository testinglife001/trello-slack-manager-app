// server/routes/attachments.js
const router = require("express").Router();
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

const ctrl = require("../controllers/attachmentController");

router.post("/", auth, upload.single("file"), ctrl.upload);
router.get("/card/:cardId", auth, ctrl.byCard);
router.delete("/:id", auth, ctrl.remove);

module.exports = router;

