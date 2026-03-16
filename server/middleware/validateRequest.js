const { validationResult } = require("express-validator");

module.exports = function validateRequest(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  return res.status(400).json({
    message: "Validation failed",
    errors: result.array().map((e) => ({
      field: e.path,
      message: e.msg,
    })),
  });
};
