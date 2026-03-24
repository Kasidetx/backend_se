// utils/auditLogger.js
const db = require("../config/db");

/**
 * ฟังก์ชันสำหรับบันทึก Audit Log
 * @param {string} action - ชื่อ Action เช่น 'CREATE_JOB', 'CHECK_IN', 'DEAN_APPROVED'
 * @param {number} performedBy - ID ของ User ที่เป็นคนทำรายการ (req.user.id)
 * @param {string} targetResource - ชื่อ Table หรือโมดูลที่ถูกกระทำ เช่น 'jobs', 'job_registrations'
 * @param {number} resourceId - ID ของแถวที่ถูกกระทำ
 * @param {object} details - ข้อมูลเพิ่มเติมที่อยากเก็บ (จะถูกแปลงเป็น JSON)
 */
const logAction = async (action, performedBy, targetResource, resourceId, details = {}) => {
  try {
    await db.query(
      `INSERT INTO audit_logs (action, performed_by, target_resource, resource_id, details) 
       VALUES (?, ?, ?, ?, ?)`,
      [action, performedBy, targetResource, resourceId, JSON.stringify(details)]
    );
  } catch (error) {
    // ใช้ console.error เพื่อไม่ให้ระบบหลักพังถ้าระบบ Log มีปัญหา
    console.error("❌ Failed to write audit log:", error);
  }
};

module.exports = { logAction };