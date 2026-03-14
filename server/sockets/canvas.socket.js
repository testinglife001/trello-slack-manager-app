// 📌 sockets/canvas.socket.js
module.exports = (io) => {
  io.on("connection", (socket) => {

    socket.on("join-myroom", (roomId) => {
      socket.join(roomId);
    });

    socket.on("mycanvas-update", ({ roomId, data }) => {
      socket.to(roomId).emit("canvas-update", data);
    });

    socket.on("mycursor-move", ({ roomId, cursor }) => {
      socket.to(roomId).emit("cursor-move", cursor);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });

  });
};
