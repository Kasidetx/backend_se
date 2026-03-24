const jwt = require("jsonwebtoken");

// Middleware เช็คว่า Login หรือยัง
exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Format: "Bearer TOKEN"

  if (!token) return res.status(401).json({ message: "Access Denied" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid Token" });

    req.user = user; // เก็บข้อมูล user (id, role) ไว้ใช้ต่อใน Controller
    next();
  });
};

// Middleware เช็ค Role (เช่น checkRole(['DEAN']))
exports.checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "สิทธิ์การใช้งานไม่เพียงพอ" });
    }
    next();
  };
};
