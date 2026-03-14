// server/middleware/roleGuard.js
module.exports = (...allowed) => {
  return (req, res, next) => {
    if (!allowed.includes(req.projectRole)) {
      return res.status(403).json({ message: "Role not allowed" });
    }
    next();
  };
};
