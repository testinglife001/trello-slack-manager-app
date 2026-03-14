// sockets/io.js (NEW)
let io = null;

exports.setIO = (instance) => {
  io = instance;
};

exports.getIO = () => io;

