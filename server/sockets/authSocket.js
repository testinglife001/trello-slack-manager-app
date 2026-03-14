// sockets/authSocket.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Unauthorized"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return next(new Error("Unauthorized"));

    socket.user = user;
    next();
  } catch {
    next(new Error("Unauthorized"));
  }
};
