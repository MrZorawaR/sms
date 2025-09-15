const express = require("express");

const { auth } = require("../middleware/auth.middleware");
const { login, getCurrentUser } = require("../controllers/auth.controller");

const router = express.Router();

// Login route
router.post("/login", login);

// Get current user
router.get("/me", auth, getCurrentUser);

module.exports = router;
