// server/routes/notes.js
const mongoose = require("mongoose");
const router = require("express").Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/noteController");
const Note = require("../models/Note");
const User = require("../models/User");

// CREATE
router.post("/", auth, ctrl.create);

// SPECIFIC ROUTES FIRST
router.get("/", auth, ctrl.getNotes);
router.get("/me", auth, ctrl.myNotes);
router.get("/users", auth, ctrl.allUsers);
router.get("/project/:projectId", auth, ctrl.notesByProject);

// GENERIC QUERY AFTER
router.get("/", auth, ctrl.query);

// DYNAMIC ID LAST
router.get("/:id", auth, async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid id" });
  }

  const note = await Note.findById(req.params.id)
    .populate("author", "name avatar")
    .populate("project", "name")   // ✅ ADD THIS
    .populate("parentNote", "title"); // ✅ OPTIONAL


  if (!note) return res.status(404).json({ message: "Not found" });

  res.json(note);
});

// CHILDREN
router.get("/:id/children", auth, ctrl.children);

// UPDATE
router.put("/:id", auth, ctrl.update);

// DELETE
router.delete("/:id", auth, ctrl.remove);

// FAVORITE
router.put("/:id/favorite", auth, ctrl.toggleFavorite);

// CARD NOTES
// CARD NOTES
router.post("/:id/notes", auth, ctrl.createCardNote);
router.get("/:id/notes", auth, ctrl.getCardNotes);

// SUBTASK NOTES
router.post("/subtasks/:subtaskId/notes", auth, ctrl.createSubtaskNote);
router.get("/subtasks/:subtaskId/notes", auth, ctrl.getSubtaskNotes);


module.exports = router;









/*
const router = require("express").Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/noteController");
const Note = require("../models/Note");

router.post("/", auth, ctrl.create);

// by linked card
router.get("/", auth, async (req, res) => {
  const { linkedCard } = req.query;

  if (!linkedCard) return res.json([]);

  const notes = await Note.find({ linkedCard })
    .sort("-createdAt")
    .populate("author", "name avatar");

  res.json(notes);
});


router.get("/me", auth, ctrl.myNotes);

router.get("/", auth, ctrl.query);

router.get("/:id", auth, async (req, res) => {
  const note = await Note.findById(req.params.id);
  res.json(note);
});


// GET SINGLE NOTE
router.get("/:id", auth, async (req, res) => {
  const note = await Note.findById(req.params.id)
    .populate("author", "name avatar");

  if (!note) return res.status(404).json({ message: "Not found" });

  res.json(note);
});


router.get("/:id/children", auth, ctrl.children);

router.put("/:id", auth, ctrl.update);
router.delete("/:id", auth, ctrl.remove);

router.put("/:id/favorite", auth, ctrl.toggleFavorite);

router.post("/cards/:id", auth, ctrl.createCardNote);
router.post("/subtasks/:id", auth, ctrl.createSubtaskNote);
router.put("/:id", auth, ctrl.updateNote);


module.exports = router;
*/