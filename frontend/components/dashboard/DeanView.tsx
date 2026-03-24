// components/dashboard/DeanView.tsx
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function DeanView() {
    const [pendingList, setPendingList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // ฟังก์ชันดึงรายการที่รออนุมัติ
    const fetchApprovals = async () => {
        try {
            const res = await api.get("/dean/approvals");
            setPendingList(res.data);
        } catch (error) {
            console.error("Error fetching approvals:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApprovals();
    }, []);

    // ฟังก์ชันจัดการการกดปุ่ม อนุมัติ / ปฏิเสธ
    const handleAction = async (registrationId: number, action: "APPROVE" | "REJECT") => {
        let adminNote = "";

        if (action === "REJECT") {
            // ถ้ากดปฏิเสธ จะมีหน้าต่างเด้งขึ้นมาให้พิมพ์เหตุผล (ใช้ window.prompt ง่ายๆ)
            const reason = window.prompt("กรุณาระบุเหตุผลที่ไม่อนุมัติชั่วโมงกิจกรรมนี้:");
            if (reason === null) return; // กด Cancel ยกเลิกการทำรายการ
            if (reason.trim() === "") {
                alert("ต้องระบุเหตุผลเมื่อเลือกไม่อนุมัติครับ");
                return;
            }
            adminNote = reason;
        } else {
            // ถ้ากดอนุมัติ แค่ถามยืนยัน
            if (!window.confirm("ยืนยันการอนุมัติชั่วโมงกิจกรรมให้รหัสนักศึกษานี้?")) return;
        }

        try {
            await api.put(`/dean/approvals/${registrationId}`, {
                action,
                adminNote
            });
            alert(`ทำรายการ ${action === "APPROVE" ? "อนุมัติ" : "ไม่อนุมัติ"} สำเร็จ!`);
            fetchApprovals(); // โหลดข้อมูลใหม่เพื่อให้รายการที่ทำไปแล้วหายไปจากจอ
        } catch (err: any) {
            alert(err.response?.data?.message || "เกิดข้อผิดพลาดในการทำรายการ");
        }
    };

    if (loading) return <div className="text-center p-10">กำลังโหลดรายการรออนุมัติ...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">รายการรออนุมัติชั่วโมงกิจกรรม (Dean)</h2>
                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold">
                    รออนุมัติทั้งหมด {pendingList.length} รายการ
                </div>
            </div>

            {pendingList.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-10 text-center text-gray-500 border border-gray-200">
                    <span className="text-4xl block mb-3">🎉</span>
                    ไม่มีรายการรอดำเนินการ (อนุมัติครบหมดแล้ว)
                </div>
            ) : (
                <div className="bg-white rounded shadow overflow-x-auto">
                    <table className="min-w-full text-left whitespace-nowrap">
                        <thead className="bg-gray-100 text-gray-700">
                            <tr>
                                <th className="p-4">รหัสนักศึกษา</th>
                                <th className="p-4">ชื่อ - นามสกุล</th>
                                <th className="p-4">ชื่องานกิจกรรม</th>
                                <th className="p-4 text-center">ชั่วโมงที่ทำได้</th>
                                <th className="p-4 text-center">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 divide-y">
                            {pendingList.map((item) => (
                                <tr key={item.registration_id} className="hover:bg-gray-50">
                                    <td className="p-4 font-medium text-blue-600">{item.student_id}</td>
                                    <td className="p-4">{item.first_name} {item.last_name}</td>
                                    <td className="p-4">{item.job_title}</td>
                                    <td className="p-4 text-center font-bold text-green-600">
                                        {item.earned_hours ? Number(item.earned_hours).toFixed(2) : "0.00"} ชม.
                                    </td>
                                    <td className="p-4 text-center space-x-2">
                                        <button
                                            onClick={() => handleAction(item.registration_id, "APPROVE")}
                                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                                        >
                                            อนุมัติ
                                        </button>
                                        <button
                                            onClick={() => handleAction(item.registration_id, "REJECT")}
                                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                                        >
                                            ไม่อนุมัติ
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}