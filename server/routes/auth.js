// server/routes/auth.js

const router = require("express").Router();
const { body } = require("express-validator");

const controller = require("../controllers/authController");
const auth = require("../middleware/auth");


// register
router.post(
  "/register",
  [
    body("name").notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 6 })
  ],
  controller.register
);


// login
router.post("/login", controller.login);


// current user
router.get("/me", auth, controller.me);
router.get("/profile", auth, controller.getFullProfile);


// refresh
router.post("/refresh", controller.refresh);


// update profile
router.put("/profile", auth, controller.updateProfile);

router.post("/by-ids", auth, controller.getUsersByIds);


module.exports = router;
