// server/middleware/permissionGuard.js
module.exports = (permission) => {
  return (req, res, next) => {
    if (req.projectRole === "admin") return next();

    if (!req.projectPermissions.includes(permission)) {
      return res.status(403).json({ message: "Permission denied" });
    }

    next();
  };
};
