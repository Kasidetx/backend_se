// routes/jobRoutes.js
const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobController");
const registrationController = require("../controllers/registrationController"); // (ไฟล์ที่เราทำ transaction ไว้ตอนแรก)
const {
  authenticateToken,
  checkRole,
} = require("../middleware/authMiddleware");

// Public หรือ Student ดูได้
router.get("/", authenticateToken, jobController.getAllJobs);
router.get("/:id", authenticateToken, jobController.getJobDetail);

router.get("/my-report/export", authenticateToken, checkRole(["STUDENT"]), jobController.getMyReport);
router.get("/:id", authenticateToken, jobController.getJobDetail);

// ดึงรายชื่อคนเข้าร่วมงาน
router.get("/:id/attendees", authenticateToken, checkRole(["CLUB_ADMIN"]), jobController.getJobAttendees);
// ยืนยันชั่วโมงให้คนเข้าร่วม
router.put("/:id/attendees/:registrationId/verify", authenticateToken, checkRole(["CLUB_ADMIN"]), jobController.verifyAttendee);

// ClubAdmin เท่านั้นที่สร้างได้
router.post(
  "/",
  authenticateToken,
  checkRole(["CLUB_ADMIN"]),
  jobController.createJob,
);

// Student ลงทะเบียน (เอา Logic Transaction มาผูกตรงนี้)
// หมายเหตุ: คุณต้องสร้าง registrationController.js ตามตัวอย่างที่ผมให้ไปใน Reply แรกๆ
router.post(
  "/:id/register",
  authenticateToken,
  checkRole(["STUDENT"]),
  registrationController.registerJob, // <-- ฟังก์ชันที่มี Transaction
);

module.exports = router;
