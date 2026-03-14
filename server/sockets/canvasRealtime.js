// sockets/canvasRealtime.js
const CanvasOperation = require("../models/CanvasOperation");
const Canvas = require("../models/CanvasDocument");

module.exports = function registerCanvas(io, socket) {
  socket.on("canvas:op", async ({ channel, op }) => {
    if (!channel || !op) return;

    try {
      // authoritative version
      const doc = await Canvas.findOneAndUpdate(
        { channel },
        { $inc: { version: 1 }, updatedBy: socket.user._id },
        { new: true }
      );

      const stamped = {
        ...op,
        version: doc.version,
        actor: {
          id: socket.user._id,
          name: socket.user.name
        }
      };

      await CanvasOperation.create({
        project: doc.project,
        channel,
        op: stamped,
        version: stamped.version,
        actor: socket.user._id
      });

      io.to(channel).emit("canvas:op", stamped);
    } catch (e) {
      console.error("canvas op failed", e.message);
    }
  });
};
