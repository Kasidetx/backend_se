// controllers/registrationController.js
const db = require("../config/db");

exports.registerJob = async (req, res) => {
  const jobId = req.params.id;
  const userId = req.user.id; // สมมติว่าได้จาก Middleware Authen

  // เริ่ม Transaction
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. เช็คว่างานเต็มหรือยัง และ Lock row นี้ไว้ (FOR UPDATE)
    // เพื่อไม่ให้คนอื่นเข้ามาอ่านค่านี้จนกว่าเราจะทำเสร็จ
    const [jobs] = await connection.query(
      `SELECT max_capacity, current_attendees, status, registration_deadline 
       FROM jobs WHERE id = ? FOR UPDATE`,
      [jobId],
    );

    if (jobs.length === 0) {
      throw new Error("ไม่พบกิจกรรมนี้");
    }

    const job = jobs[0];

    // Validation Rules
    if (job.status !== "OPEN") throw new Error("กิจกรรมปิดรับสมัครแล้ว");
    if (new Date() > new Date(job.registration_deadline))
      throw new Error("หมดเขตรับสมัคร");
    if (job.current_attendees >= job.max_capacity)
      throw new Error("ที่นั่งเต็มแล้ว");

    // 2. ตรวจสอบว่าเคยลงทะเบียนไปหรือยัง
    const [existing] = await connection.query(
      `SELECT id FROM job_registrations WHERE user_id = ? AND job_id = ?`,
      [userId, jobId],
    );

    if (existing.length > 0) throw new Error("คุณลงทะเบียนกิจกรรมนี้ไปแล้ว");

    // 3. บันทึกการลงทะเบียน
    await connection.query(
      `INSERT INTO job_registrations (user_id, job_id, status) VALUES (?, ?, 'REGISTERED')`,
      [userId, jobId],
    );

    // 4. อัปเดตจำนวนคนสมัคร (+1)
    await connection.query(
      `UPDATE jobs SET current_attendees = current_attendees + 1 WHERE id = ?`,
      [jobId],
    );

    // Commit ทุกอย่างลง DB
    await connection.commit();

    res.status(201).json({ message: "ลงทะเบียนสำเร็จ" });
  } catch (error) {
    // ถ้ามี Error ให้ Rollback ทุกอย่างกลับไปเหมือนเดิม
    await connection.rollback();
    res.status(400).json({ error: error.message });
  } finally {
    // คืน Connection กลับเข้า Pool
    connection.release();
  }
};
