// routes/canvas.js
const router = require("express").Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/canvasController");
// const { saveCanvasWithActivity, get as getCanvas } = require("../controllers/canvasController");

// import { loadCanvas, saveCanvas } from "../controllers/canvasController.js";


// load / auto create
//router.get("/:id", auth, ctrl.get);
// snapshot save
// router.put("/:id", auth, ctrl.save);
// GET canvas content + load Yjs doc
// router.get("/:id", ctrl.loadCanvas);
// PUT autosave content
// router.put("/:id", ctrl.saveCanvas);
// Load canvas
// router.get("/:id", auth, getCanvas);
// Save canvas with activity
//router.put("/:id", auth, ctrl.saveCanvasWithActivity);

// Get canvas document
router.get("/:id", auth, ctrl.get);

// Save simple snapshot
router.put("/:id/snapshot", auth, ctrl.save);

// Save with activity tracking
router.put("/:id/activity", auth, ctrl.saveCanvasWithActivity);

module.exports = router;
// routes/canvas.js
