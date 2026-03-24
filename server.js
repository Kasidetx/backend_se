// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");

// Import Routes (ที่เราจะสร้างต่อไป)
const authRoutes = require("../backend/routes/authRoutes");
const jobRoutes = require("../backend/routes/jobRoutes");
const qrRoutes = require("./routes/qrRoutes");
const deanRoutes = require("./routes/deanRoutes");

const app = express();

// Middleware
app.use(cors()); // อนุญาตให้ Next.js (Frontend) ยิงเข้ามาได้
app.use(express.json()); // อ่าน JSON จาก Body request

// Routes
app.use("/api/auth", authRoutes); // เส้นทางสำหรับ Login/Register
app.use("/api/jobs", jobRoutes); // เส้นทางสำหรับจัดการงาน
app.use("/api/qr", qrRoutes);
app.use("/api/dean", deanRoutes);

// Root Route (ไว้เทสว่า Server ทำงานไหม)
app.get("/", (req, res) => {
  res.send("Volunteer System API is Running...", data = {timestamp: new Date()});
});

// Error Handling Middleware (ดัก Error ท้ายสุด)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
