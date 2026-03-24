// controllers/deanController.js
const db = require("../config/db");
const { logAction } = require("../utils/auditLogger");

// 1. ดึงรายการกิจกรรมที่รอคณบดีอนุมัติ
exports.getPendingApprovals = async (req, res) => {
  try {
    // JOIN ตาราง users และ jobs เพื่อให้หน้าบ้านแสดงชื่อนักศึกษาและชื่องานได้เลย
    const [pendingList] = await db.query(`
      SELECT 
        jr.id AS registration_id,
        jr.status,
        jr.earned_hours,
        u.first_name,
        u.last_name,
        u.student_id,
        j.title AS job_title,
        j.hours_credit AS max_hours
      FROM job_registrations jr
      JOIN users u ON jr.user_id = u.id
      JOIN jobs j ON jr.job_id = j.id
      WHERE jr.status = 'CLUB_VERIFIED'
      ORDER BY jr.verified_at ASC
    `);

    res.json(pendingList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
  }
};

// 2. อนุมัติหรือปฏิเสธกิจกรรม (Review)
exports.reviewRegistration = async (req, res) => {
  const { id } = req.params; // ID ของ job_registrations
  const { action, adminNote } = req.body; // action = 'APPROVE' หรือ 'REJECT'
  const deanId = req.user.id;

  try {
    // เช็คก่อนว่ารายการนี้มีอยู่จริงและรออนุมัติอยู่ไหม
    const [registrations] = await db.query(
      `SELECT * FROM job_registrations WHERE id = ? AND status = 'CLUB_VERIFIED'`,
      [id]
    );

    if (registrations.length === 0) {
      return res.status(404).json({ message: "ไม่พบรายการที่รออนุมัติ หรือรายการนี้ถูกจัดการไปแล้ว" });
    }

    const targetRegistration = registrations[0];
    let newStatus = "";

    if (action === "APPROVE") {
      newStatus = "DEAN_APPROVED";
    } else if (action === "REJECT") {
      if (!adminNote) {
        return res.status(400).json({ message: "กรุณาระบุเหตุผล (adminNote) เมื่อไม่อนุมัติ" });
      }
      newStatus = "DEAN_REJECTED";
    } else {
      return res.status(400).json({ message: "Action ไม่ถูกต้อง" });
    }

    // อัปเดตสถานะในตาราง
    await db.query(
      `UPDATE job_registrations 
       SET status = ?, approved_at = NOW(), admin_note = ? 
       WHERE id = ?`,
      [newStatus, adminNote || null, id]
    );

    // ✅ บันทึก Audit Log ว่าคณบดีทำการตัดสินใจอย่างไร
    await logAction(
      `DEAN_${action}`, 
      deanId, 
      "job_registrations", 
      id, 
      { 
        previous_status: targetRegistration.status,
        new_status: newStatus,
        job_id: targetRegistration.job_id,
        student_id: targetRegistration.user_id,
        note: adminNote || ""
      }
    );

    res.json({ message: `ทำรายการ ${newStatus} สำเร็จ` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการทำรายการ" });
  }
};