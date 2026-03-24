// controllers/authController.js
const db = require("../config/db"); // เรียก Connection Pool ที่เราทำไว้ตอนแรก
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// 1. Register (สมัครสมาชิก)
exports.register = async (req, res) => {
  const { username, password, firstName, lastName, role, studentId } = req.body;

  try {
    // เช็คว่า Username ซ้ำไหม
    const [existingUser] = await db.query(
      "SELECT id FROM users WHERE username = ?",
      [username],
    );
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Username นี้ถูกใช้งานแล้ว" });
    }

    // Hash Password (สำคัญมาก! ห้ามเก็บรหัสจริง)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // บันทึกลงฐานข้อมูล
    // หมายเหตุ: role ควรมีการ Validate ว่าเป็นค่าที่ถูกต้อง (STUDENT, CLUB_ADMIN, DEAN)
    await db.query(
      `INSERT INTO users (username, password_hash, first_name, last_name, role, student_id) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        username,
        passwordHash,
        firstName,
        lastName,
        role || "STUDENT",
        studentId,
      ],
    );

    res.status(201).json({ message: "สมัครสมาชิกสำเร็จ" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการสมัครสมาชิก" });
  }
};

// 2. Login (เข้าสู่ระบบ)
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // ค้นหา User
    const [users] = await db.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);
    if (users.length === 0) {
      return res
        .status(401)
        .json({ message: "Username หรือ Password ไม่ถูกต้อง" });
    }

    const user = users[0];

    // ตรวจสอบ Password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Username หรือ Password ไม่ถูกต้อง" });
    }

    // สร้าง JWT Token
    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.first_name }, // Payload
      process.env.JWT_SECRET, // Secret Key (ต้องตั้งใน .env)
      { expiresIn: "1d" }, // อายุ Token 1 วัน
    );

    res.json({
      message: "เข้าสู่ระบบสำเร็จ",
      token,
      user: {
        id: user.id,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 3. Get Profile (ดึงข้อมูลตัวเอง - ใช้เทส Token)
exports.getMe = async (req, res) => {
  // req.user มาจาก Middleware ที่แกะ Token แล้ว
  res.json({ user: req.user });
};
