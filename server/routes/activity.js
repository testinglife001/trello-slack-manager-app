// routes/activity.js
const router = require("express").Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/activityController");


// router.post("/", auth, ctrl.create);

router.get("/project/:projectId", auth, ctrl.byProject);
router.get("/user", auth, ctrl.byUser);



module.exports = router;
