// server/controllers/authController.js

const User = require("../models/User");

const { hashPassword, comparePassword } = require("../utils/password");
const {
  generateAccessToken,
  generateRefreshToken
} = require("../utils/tokens");


// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password, username } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already used" });

    const passwordHash = await hashPassword(password);

    const user = await User.create({
      name,
      email,
      username,
      passwordHash
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      user,
      accessToken,
      refreshToken
    });
  } catch (err) {
    res.status(500).json({ message: "Register failed" });
  }
};


// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await comparePassword(password, user.passwordHash);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      user,
      accessToken,
      refreshToken
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
};


// GET ME
exports.me = async (req, res) => {
  res.json(req.user);
};

// GET FULL PROFILE
exports.getFullProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};


// REFRESH TOKEN
exports.refresh = async (req, res) => {
  try {
    const jwt = require("jsonwebtoken");

    const { token } = req.body;
    if (!token) return res.status(401).json({ message: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "Invalid" });

    const accessToken = generateAccessToken(user);

    res.json({ accessToken });
  } catch {
    res.status(401).json({ message: "Invalid refresh" });
  }
};


// UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;

    delete updates.passwordHash;
    delete updates.roleGlobal;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true }
    );

    res.json(user);
  } catch {
    res.status(500).json({ message: "Update failed" });
  }
};

exports.getUsersByIds = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids)) {
      return res.status(400).json({ message: "Invalid ids" });
    }

    const users = await User.find(
      { _id: { $in: ids } },
      "name username avatar isOnline"
    );

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};
