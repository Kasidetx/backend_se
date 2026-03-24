const express = require("express");
const router = express.Router();
const qrController = require("../controllers/qrController");
const {
  authenticateToken,
  checkRole,
} = require("../middleware/authMiddleware");

// 1. Admin ขอ Token (เพื่อเอาไปแสดงบนจอ)
router.post(
  "/generate",
  authenticateToken,
  checkRole(["CLUB_ADMIN"]),
  qrController.generateQr,
);

// 2. Student สแกน (ส่ง Token มา)
router.post(
  "/scan",
  authenticateToken,
  checkRole(["STUDENT"]),
  qrController.checkIn,
);

module.exports = router;
