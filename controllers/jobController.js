// controllers/jobController.js
const db = require("../config/db");
const { logAction } = require("../utils/auditLogger");

// 1. สร้างกิจกรรม (เฉพาะ ClubAdmin)
exports.createJob = async (req, res) => {
  console.log("📦 ข้อมูลที่ส่งมาถึง Backend:", req.body);

  const {
    title,
    description,
    location,
    startTime,
    endTime,
    registrationDeadline,
    maxCapacity,
    hoursCredit,
    semesterId,
  } = req.body;

    // 🌟 เพิ่มเงื่อนไขดักจับ (Validation) ตรงนี้
  if (!title || !description || !maxCapacity) {
    return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
  }

  const createdBy = req.user.id; // ได้มาจาก Token

  try {
    const [result] = await db.query(
      `INSERT INTO jobs 
       (title, description, location, start_time, end_time, registration_deadline, max_capacity, hours_credit, semester_id, created_by, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'OPEN')`,
      [
        title,
        description,
        location,
        startTime,
        endTime,
        registrationDeadline,
        maxCapacity,
        hoursCredit,
        semesterId,
        createdBy,
      ],
    );

    await logAction(
      "CREATE_JOB", 
      req.user.id, 
      "jobs", 
      result.insertId, 
      { 
        title: title, 
        max_capacity: maxCapacity,
        hours_credit: hoursCredit
      }
    );

    res.status(201).json({
      message: "สร้างกิจกรรมสำเร็จ",
      jobId: result.insertId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการสร้างกิจกรรม" });
  }
};

// 2. ดูรายการกิจกรรมทั้งหมด (Filter ได้)
exports.getAllJobs = async (req, res) => {
  try {
    // ดึงเฉพาะงานที่ยังไม่ถูกยกเลิก เรียงตามวันที่ล่าสุด
    // (ในอนาคตเพิ่ม WHERE เพื่อ Filter ตาม Term ได้)
    const [jobs] = await db.query(`
      SELECT id, title, start_time, end_time, location, status, current_attendees, max_capacity 
      FROM jobs 
      WHERE status != 'CANCELLED' 
      ORDER BY created_at DESC
    `);

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching jobs" });
  }
};

// 3. ดูรายละเอียดกิจกรรมรายตัว (Job Detail)
exports.getJobDetail = async (req, res) => {
  const { id } = req.params;

  try {
    const [jobs] = await db.query("SELECT * FROM jobs WHERE id = ?", [id]);

    if (jobs.length === 0) {
      return res.status(404).json({ message: "ไม่พบกิจกรรมนี้" });
    }

    res.json(jobs[0]);
  } catch (error) {
    res.status(500).json({ message: "Error fetching job detail" });
  }
};

// ดึงข้อมูลสำหรับทำ PDF Report (เฉพาะงานที่คณบดีอนุมัติแล้ว)
exports.getMyReport = async (req, res) => {
  const userId = req.user.id;

  try {
    // 1. ดึงข้อมูลส่วนตัวนักศึกษา
    const [users] = await db.query(
      `SELECT student_id, first_name, last_name FROM users WHERE id = ?`,
      [userId]
    );

    // 2. ดึงประวัติกิจกรรมที่ผ่านการอนุมัติแล้ว
    const [activities] = await db.query(
      `SELECT 
         j.title, 
         jr.check_in_time, 
         jr.check_out_time, 
         jr.earned_hours 
       FROM job_registrations jr
       JOIN jobs j ON jr.job_id = j.id
       WHERE jr.user_id = ? AND jr.status = 'DEAN_APPROVED'
       ORDER BY jr.check_in_time ASC`,
      [userId]
    );

    // 3. คำนวณชั่วโมงรวมทั้งหมด
    const totalHours = activities.reduce((sum, act) => sum + Number(act.earned_hours || 0), 0);

    res.json({
      student: users[0],
      activities: activities,
      totalHours: totalHours.toFixed(2)
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching report data" });
  }
};

// ดึงรายชื่อผู้เข้าร่วมกิจกรรมทั้งหมดสำหรับสโมสร
exports.getJobAttendees = async (req, res) => {
  const { id } = req.params; // ID ของงาน (jobId)
  
  try {
    const [attendees] = await db.query(
      `SELECT 
         jr.id AS registration_id, 
         jr.status, 
         jr.check_in_time, 
         jr.check_out_time, 
         jr.earned_hours,
         u.student_id, 
         u.first_name, 
         u.last_name
       FROM job_registrations jr
       JOIN users u ON jr.user_id = u.id
       WHERE jr.job_id = ?
       ORDER BY jr.check_in_time ASC`,
      [id]
    );
    res.json(attendees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching attendees" });
  }
};

// สโมสรกดยืนยันชั่วโมงให้ผู้เข้าร่วม (CLUB_VERIFIED)
exports.verifyAttendee = async (req, res) => {
  const { registrationId } = req.params;
  
  try {
    // เช็คว่าสถานะปัจจุบันเป็น CHECKED_OUT (สแกนออกแล้ว) ถึงจะกดยืนยันได้
    const [rows] = await db.query(`SELECT status FROM job_registrations WHERE id = ?`, [registrationId]);
    
    if (rows.length === 0) return res.status(404).json({ message: "ไม่พบข้อมูลการลงทะเบียน" });
    if (rows[0].status !== 'CHECKED_OUT') {
        return res.status(400).json({ message: "นักศึกษายังไม่ได้ Check-out หรือรายการนี้ถูกยืนยันไปแล้ว" });
    }

    await db.query(
      `UPDATE job_registrations SET status = 'CLUB_VERIFIED', verified_at = NOW() WHERE id = ?`,
      [registrationId]
    );

    res.json({ message: "ยืนยันชั่วโมงกิจกรรมสำเร็จ ส่งให้คณบดีพิจารณาต่อแล้ว" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error verifying attendee" });
  }
};