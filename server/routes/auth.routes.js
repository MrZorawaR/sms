const express = require("express");
const rateLimit = require("express-rate-limit");

const { auth } = require("../middleware/auth.middleware");
const { validateRequest } = require("../middleware/validate.middleware");
const { loginSchema } = require("../validations/auth.validation");
const { login, refresh, logout, getCurrentUser } = require("../controllers/auth.controller");

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per `window`
  message: { message: "Too many login attempts, please try again after 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Login route
router.post("/login", loginLimiter, validateRequest(loginSchema), login);

// Refresh route
router.post("/refresh", refresh);

// Logout route
router.post("/logout", logout);

// Get current user
router.get("/me", auth, getCurrentUser);

module.exports = router;
