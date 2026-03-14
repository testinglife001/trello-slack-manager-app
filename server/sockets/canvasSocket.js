// /server/socket/canvasSocket.js
const { v4: uuid } = require("uuid");

const rooms = {};

module.exports = (io) => {

  io.on("connection", (socket) => {

    socket.on("join-canvas", ({ canvasId, user }) => {
      socket.join(canvasId);

      if (!rooms[canvasId]) rooms[canvasId] = {};
      rooms[canvasId][socket.id] = {
        id: socket.id,
        name: user.name,
        cursor: { x: 0, y: 0 }
      };

      io.to(canvasId).emit("presence-update",
        Object.values(rooms[canvasId])
      );
    });

    // 🔥 Canvas object update
    socket.on("canvas-update", ({ canvasId, payload }) => {
      socket.to(canvasId).emit("remote-update", payload);
    });

    // 🔥 Cursor movement
    socket.on("cursor-move", ({ canvasId, cursor }) => {
      if (!rooms[canvasId]) return;

      rooms[canvasId][socket.id].cursor = cursor;

      io.to(canvasId).emit(
        "cursor-update",
        Object.values(rooms[canvasId])
      );
    });

    socket.on("disconnect", () => {
      Object.keys(rooms).forEach(room => {
        delete rooms[room]?.[socket.id];
        io.to(room).emit(
          "presence-update",
          Object.values(rooms[room] || {})
        );
      });
    });

  });
};
