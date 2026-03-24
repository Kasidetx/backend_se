// routes/deanRoutes.js
const express = require("express");
const router = express.Router();
const deanController = require("../controllers/deanController");
const { authenticateToken, checkRole } = require("../middleware/authMiddleware");

// ทุก Route ในนี้ต้องเป็นคณบดีเท่านั้น
router.use(authenticateToken, checkRole(["DEAN"]));

// GET /api/dean/approvals - ดูรายการที่รออนุมัติ
router.get("/approvals", deanController.getPendingApprovals);

// PUT /api/dean/approvals/:id - ส่งคำสั่งอนุมัติหรือปฏิเสธ
router.put("/approvals/:id", deanController.reviewRegistration);

module.exports = router;