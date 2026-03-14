// 📌 routes/mycanvas.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/mycanvas.controller");
const auth = require("../middleware/auth");

/* ROOM */
router.get("/room/:channelId", auth, controller.createOrGetRoom);

/* BOARD */
router.get("/boards/:roomId", auth, controller.getBoards);
router.put("/board/:boardId", auth, controller.saveBoardState);

/* SNAPSHOT */
router.get("/snapshots/:boardId", auth, controller.getSnapshots);

/* ACTIVITY */
router.post("/activity", auth, controller.logActivity);
router.get("/activity/:roomId", auth, controller.getActivity);

/* FILE */
router.post("/file", auth, controller.saveFileMeta);

module.exports = router;
