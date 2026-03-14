//  7️⃣ ROUTES
// routes/canvasactivity.js
// 📁 routes/canvasactivity.js
const express = require("express");
const {
  createActivity,
  getCanvasActivity
} = require("../controllers/canvasActivitiesController");

const router = express.Router();

router.post("/", createActivity);
router.get("/:canvasId", getCanvasActivity);

module.exports = router;

