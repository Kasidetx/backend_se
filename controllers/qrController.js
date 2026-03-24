// controllers/qrController.js
const db = require("../config/db");
const crypto = require("crypto"); // ใช้สร้าง Random String
const { logAction } = require("../utils/auditLogger");

// 1. [ClubAdmin] สร้าง QR Token ใหม่ (ยิง API นี้ทุกๆ 30 วินาที)
exports.generateQr = async (req, res) => {
  const { jobId, type } = req.body; // type = 'CHECK_IN' หรือ 'CHECK_OUT'

  try {
    // สร้าง Random Token ยาว 32 ตัวอักษร
    const token = crypto.randomBytes(16).toString("hex");

    // กำหนดเวลาหมดอายุ (สมมติ 1 นาที)
    const expiresAt = new Date(Date.now() + 60 * 1000); // +60 วินาที

    // ลบ Token เก่าที่หมดอายุแล้วของ Job นี้ทิ้ง (เพื่อไม่ให้ตารางบวม)
    await db.query(
      `DELETE FROM qr_tokens WHERE job_id = ? AND expires_at < NOW()`,
      [jobId],
    );

    // บันทึก Token ใหม่
    await db.query(
      `INSERT INTO qr_tokens (token, job_id, type, expires_at) VALUES (?, ?, ?, ?)`,
      [token, jobId, type, expiresAt],
    );

    // ส่ง Token กลับไปให้ Frontend เอาไป Gen เป็นภาพ QR Code
    res.json({
      token,
      expiresAt,
      qrData: JSON.stringify({ token, type, jobId }), // ข้อมูลดิบสำหรับใส่ใน QR
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error generating QR" });
  }
};

// 2. [Student] สแกน QR แล้วส่ง Token มาเช็คชื่อ
exports.checkIn = async (req, res) => {
  const { token } = req.body;
  const userId = req.user.id;

  const connection = await db.getConnection(); // ใช้ Transaction เพื่อความชัวร์

  try {
    await connection.beginTransaction();

    // A. ตรวจสอบว่า Token นี้มีจริงและยังไม่หมดอายุ
    const [tokens] = await connection.query(
      `SELECT * FROM qr_tokens WHERE token = ? AND expires_at > NOW()`,
      [token],
    );

    if (tokens.length === 0) {
      throw new Error("QR Code หมดอายุหรือไม่ถูกต้อง กรุณาสแกนใหม่อีกครั้ง");
    }

    const qrInfo = tokens[0]; // ข้อมูล Job ID และ Type

    // B. ตรวจสอบว่านักศึกษาคนนี้ "ลงทะเบียน" มาก่อนไหม?
    const [registrations] = await connection.query(
      `SELECT id, status FROM job_registrations WHERE user_id = ? AND job_id = ?`,
      [userId, qrInfo.job_id],
    );

    if (registrations.length === 0) {
      throw new Error("คุณยังไม่ได้ลงทะเบียนกิจกรรมนี้");
    }

    const registration = registrations[0];

    // C. อัปเดตสถานะ (แยกเคส เข้างาน / ออกงาน)
    if (qrInfo.type === "CHECK_IN") {
      if (registration.status !== "REGISTERED") {
        // อนุญาตให้เช็คซ้ำได้ แต่ต้องแจ้งเตือนไหม? หรือปล่อยผ่าน
        // ในที่นี้สมมติว่าถ้าเคยเช็คแล้ว ก็ถือว่าสำเร็จ
      }

      await connection.query(
        `UPDATE job_registrations 
                 SET status = 'CHECKED_IN', check_in_time = NOW() 
                 WHERE id = ?`,
        [registration.id],
      );

      await logAction(
        "CHECK_IN", 
        userId, 
        "job_registrations", 
        registration.id, 
        { 
          job_id: qrInfo.job_id,
          action_type: "QR_SCAN"
        }
      );

    } else if (qrInfo.type === "CHECK_OUT") {
      // ต้องเช็คอินมาก่อนถึงจะเช็คเอาท์ได้
      if (registration.status !== "CHECKED_IN") {
        throw new Error("คุณต้องเช็คอิน (Check-in) ก่อน จึงจะเช็คเอาท์ได้");
      }

      // --- [NEW LOGIC START] คำนวณชั่วโมงตามจริง ---
      const checkInTime = new Date(registration.check_in_time);
      const checkOutTime = new Date(); // เวลาปัจจุบัน

      // คำนวณผลต่างเวลา (หน่วยเป็นมิลลิวินาที)
      const diffMs = checkOutTime - checkInTime;

      // แปลงเป็นชั่วโมง (มิลลิวินาที / 1000 / 60 / 60)
      // .toFixed(2) คือทศนิยม 2 ตำแหน่ง
      let hoursEarned = diffMs / (1000 * 60 * 60);

      // Optional: ปัดเศษ? (เช่น ทำไม่ถึง 15 นาทีไม่ได้, หรือปัดขึ้น)
      // ตัวอย่าง: ถ้าทำน้อยกว่า 10 นาที (0.16 ชม.) ให้เป็น 0 หรือไม่?
      // if (hoursEarned < 0.1) hoursEarned = 0;

      // Update ลง DB
      await connection.query(
        `UPDATE job_registrations 
                 SET status = 'CHECKED_OUT', 
                     check_out_time = NOW(), 
                     earned_hours = ? 
                 WHERE id = ?`,
        [hoursEarned, registration.id],
      );

      await logAction(
        "CHECK_OUT", 
        userId, 
        "job_registrations", 
        registration.id, 
        { 
          job_id: qrInfo.job_id,
          earned_hours: parseFloat(hoursEarned.toFixed(2)) 
        }
      );

      // --- [NEW LOGIC END] ---

      await connection.commit();
      res.json({
        message: `Check-out สำเร็จ! คุณสะสมเวลาได้ ${hoursEarned.toFixed(2)} ชั่วโมง`,
      });
      return; // จบการทำงานตรงนี้
    }

    // Commit Transaction
    await connection.commit();
    res.json({ message: `${qrInfo.type} สำเร็จ!` });
  } catch (error) {
    await connection.rollback();
    res.status(400).json({ message: error.message });
  } finally {
    connection.release();
  }
};
