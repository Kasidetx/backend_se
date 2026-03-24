// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticateToken } = require("../middleware/authMiddleware"); // Middleware ที่คุณมีแล้ว

// Public Routes
router.post("/register", authController.register);
router.post("/login", authController.login);

// Protected Route (ต้องแนบ Token)
router.get("/me", authenticateToken, authController.getMe);

module.exports = router;
