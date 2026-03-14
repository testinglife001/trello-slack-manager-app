// server/app.js
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/activity", require("./routes/activity"));
app.use("/api/projects", require("./routes/project"));
app.use("/api/boards", require("./routes/board"));   // ⭐ THIS
app.use("/api/lists", require("./routes/list"));
app.use("/api/cards", require("./routes/card"));
app.use("/api/subtasks", require("./routes/subtasks"));
app.use("/api/comments", require("./routes/comments"));
app.use("/api/notes", require("./routes/notes"));
app.use("/api/attachments", require("./routes/attachments"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/chat", require("./routes/chat"));
app.use("/api/channels", require("./routes/channels"));
app.use("/api/canvas", require("./routes/canvas"));
app.use("/api/canvas-comments", require("./routes/canvasComments"));
app.use("/api/canvas-history", require("./routes/canvasHistory"));
app.use("/api/canvas-playback", require("./routes/canvasPlayback"));
app.use("/api/threads", require("./routes/threads"));

// ✅ NEW FIXED ROUTES
app.use("/api/canvas-activity", require("./routes/canvasactivity"));
app.use("/api/canvas-notifications", require("./routes/canvasnotification"));

// app.use("/api/mycanvas", require("./routes/mycanvas.routes"));
app.use("/api/mycanvas", require("./routes/mycanvas"));



module.exports = app;
