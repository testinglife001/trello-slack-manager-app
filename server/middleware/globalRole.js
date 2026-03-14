/ server/middleware/globalRole.js
module.exports = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.roleGlobal)) {
      return res.status(403).json({ message: "Global role denied" });
    }
    next();
  };
};
