// app/jobs/create/page.tsx
"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function CreateJobPage() {
    const router = useRouter();
    const { user } = useAuth(); // เอาไว้เช็ค Role กันเหนียว (หรือให้ Middleware Backend จัดการ)

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        location: "",
        startTime: "",
        endTime: "",
        registrationDeadline: "",
        maxCapacity: 0,
        hoursCredit: 0,
        semesterId: 1, // Hardcode ไว้ก่อน หรือทำ Dropdown เลือกเทอม
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // แปลงวันที่ให้เป็น Format ที่ MySQL ชอบ (YYYY-MM-DD HH:mm:ss) 
        // หรือส่งไปแบบ ISO String แล้วให้ Backend จัดการ (ในเคสนี้ส่งแบบ input datetime-local ไปเลยก็ได้)

        try {
            await api.post("/jobs", formData);
            alert("สร้างกิจกรรมสำเร็จ!");
            router.push("/dashboard"); // กลับไปหน้าหลัก
        } catch (error: any) {
            alert(error.response?.data?.message || "เกิดข้อผิดพลาด");
        }
    };

    // กันคนที่ไม่ใช่ Admin เข้ามา (Optional: เพราะ Backend กันไว้อีกชั้นแล้ว)
    if (user && user.role !== 'CLUB_ADMIN') {
        return <div className="p-10 text-center text-red-500">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</div>
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 flex justify-center">
            <div className="w-full max-w-2xl bg-white rounded-lg shadow p-8">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">สร้างกิจกรรมจิตอาสาใหม่</h1>

                <form onSubmit={handleSubmit} className="space-y-4 text-gray-700">

                    {/* ชื่อกิจกรรม */}
                    <div>
                        <label className="block mb-1 font-medium">ชื่อกิจกรรม</label>
                        <input required name="title" onChange={handleChange} className="w-full border p-2 rounded" />
                    </div>

                    {/* รายละเอียด */}
                    <div>
                        <label className="block mb-1 font-medium">รายละเอียด</label>
                        <textarea required name="description" rows={3} onChange={handleChange} className="w-full border p-2 rounded" />
                    </div>

                    {/* สถานที่ */}
                    <div>
                        <label className="block mb-1 font-medium">สถานที่จัดงาน</label>
                        <input required name="location" onChange={handleChange} className="w-full border p-2 rounded" placeholder="เช่น หอประชุมใหญ่, ลานเกียร์" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1 font-medium">วัน-เวลา เริ่มงาน</label>
                            <input required type="datetime-local" name="startTime" onChange={handleChange} className="w-full border p-2 rounded" />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">วัน-เวลา จบงาน</label>
                            <input required type="datetime-local" name="endTime" onChange={handleChange} className="w-full border p-2 rounded" />
                        </div>
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">ปิดรับสมัครเมื่อ</label>
                        <input required type="datetime-local" name="registrationDeadline" onChange={handleChange} className="w-full border p-2 rounded" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1 font-medium">จำนวนรับ (คน)</label>
                            <input required type="number" name="maxCapacity" onChange={handleChange} className="w-full border p-2 rounded" />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">ชั่วโมงจิตอาสาที่ได้</label>
                            <input required type="number" name="hoursCredit" onChange={handleChange} className="w-full border p-2 rounded" />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                            บันทึกกิจกรรม
                        </button>
                        <button type="button" onClick={() => router.back()} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400">
                            ยกเลิก
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}