// server/server.js
require("dotenv").config();

const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const initSocket = require("./sockets");

const { Server } = require("socket.io");

const Y = require("yjs");
const { getYDoc, getAllDocs, saveYDocToDB } = require("./services/crdtService");

connectDB();

const server = http.createServer(app);

// ── Single Socket.IO instance, created here and passed everywhere ────────────
// initSocket returns the io instance so other modules can share it
const io = initSocket(server);


// ── Periodic Yjs auto-save ───────────────────────────────────────────────────
setInterval(async () => {
  try {
    const docs = getAllDocs();
    for (const [roomId] of docs.entries()) {
      await saveYDocToDB(roomId);
    }
  } catch (err) {
    console.error("Auto-save error:", err);
  }
}, 10_000);

// require("./sockets/canvas.socket")(io);

app.get("/", (req, res) => res.send("Server is running."));

server.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});







/*
// server/server.js
require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const connectDB = require("./config/db");
const initSocket = require("./sockets");

const Y = require("yjs");
const { getYDoc, getAllDocs, saveYDocToDB } = require("./services/crdtService");

connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});


io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join-room", (roomId) => {
    if (!roomId) return;

    socket.join(roomId);

    const ydoc = getYDoc(roomId);

    const update = Y.encodeStateAsUpdate(ydoc);
    socket.emit("sync", update);

    socket.on("update", (updateBuf) => {
      Y.applyUpdate(ydoc, updateBuf);
      socket.to(roomId).emit("sync", updateBuf);
    });
  });
});


setInterval(async () => {
  try {
    const docs = getAllDocs();

    for (const [roomId] of docs.entries()) {
      await saveYDocToDB(roomId);
    }
  } catch (err) {
    console.error("Auto-save error:", err);
  }
}, 10000);

require("./sockets/canvasSocket")(io);
initSocket(server);

app.get("/", (req, res) => {
  res.send("server is running.");
});

server.listen(process.env.PORT || 5000, () => {
  console.log("Server running...");
});
*/

