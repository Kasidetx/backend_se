// app/jobs/[id]/verify/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import Link from "next/link";

export default function VerifyJobPage() {
    const params = useParams();
    const router = useRouter();
    const jobId = params.id;

    const [attendees, setAttendees] = useState<any[]>([]);
    const [jobName, setJobName] = useState<string>("");
    const [loading, setLoading] = useState(true);

    const fetchAttendees = async () => {
        try {
            // ดึงชื่องาน
            const jobRes = await api.get(`/jobs/${jobId}`);
            setJobName(jobRes.data.title);

            // ดึงรายชื่อนักศึกษา
            const res = await api.get(`/jobs/${jobId}/attendees`);
            setAttendees(res.data);
        } catch (err) {
            console.error("Error fetching attendees:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendees();
    }, [jobId]);

    const handleVerify = async (registrationId: number) => {
        if (!confirm("ยืนยันชั่วโมงจิตอาสาให้ผู้เข้าร่วมคนนี้ใช่หรือไม่?\n(ข้อมูลจะถูกส่งให้คณบดีอนุมัติในขั้นตอนถัดไป)")) return;
        
        try {
            await api.put(`/jobs/${jobId}/attendees/${registrationId}/verify`);
            alert("ยืนยันชั่วโมงสำเร็จ!");
            fetchAttendees(); // รีเฟรชตาราง
        } catch (err: any) {
            alert(err.response?.data?.message || "เกิดข้อผิดพลาดในการยืนยัน");
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500 animate-pulse text-lg">กำลังโหลดข้อมูลผู้เข้าร่วม...</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10">
            <div className="max-w-6xl mx-auto space-y-6">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div>
                        <Link href="/dashboard" className="text-sm text-blue-500 hover:underline mb-2 inline-block">
                            ◀ กลับไปหน้า Dashboard
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-800">ตรวจสอบผู้เข้าร่วมกิจกรรม</h1>
                        <p className="text-gray-500 mt-1">งาน: <span className="font-semibold text-blue-600">{jobName}</span></p>
                    </div>
                    <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold border border-blue-100">
                        ลงทะเบียนทั้งหมด: {attendees.length} คน
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="p-4 text-sm font-semibold text-slate-500">รหัสนักศึกษา / ชื่อ</th>
                                    <th className="p-4 text-sm font-semibold text-slate-500">เวลา Check-in</th>
                                    <th className="p-4 text-sm font-semibold text-slate-500">เวลา Check-out</th>
                                    <th className="p-4 text-sm font-semibold text-slate-500 text-center">ชั่วโมงที่ได้</th>
                                    <th className="p-4 text-sm font-semibold text-slate-500">สถานะ</th>
                                    <th className="p-4 text-sm font-semibold text-slate-500 text-center">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 text-slate-600">
                                {attendees.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-10 text-center text-slate-400">ยังไม่มีผู้ลงทะเบียนเข้าร่วมกิจกรรมนี้</td>
                                    </tr>
                                ) : attendees.map((user) => (
                                    <tr key={user.registration_id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4">
                                            <p className="font-bold text-slate-800">{user.student_id}</p>
                                            <p className="text-sm text-slate-500">{user.first_name} {user.last_name}</p>
                                        </td>
                                        
                                        <td className="p-4 text-sm">
                                            {user.check_in_time ? new Date(user.check_in_time).toLocaleString("th-TH") : <span className="text-slate-300">-</span>}
                                        </td>
                                        
                                        <td className="p-4 text-sm">
                                            {user.check_out_time ? new Date(user.check_out_time).toLocaleString("th-TH") : <span className="text-slate-300">-</span>}
                                        </td>
                                        
                                        <td className="p-4 text-center">
                                            {user.earned_hours ? (
                                                <span className="font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-sm border border-emerald-100">
                                                    {Number(user.earned_hours).toFixed(2)} ชม.
                                                </span>
                                            ) : (
                                                <span className="text-slate-300">-</span>
                                            )}
                                        </td>

                                        <td className="p-4">
                                            {/* Status Badge */}
                                            {user.status === 'REGISTERED' && <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">📝 ลงทะเบียนแล้ว</span>}
                                            {user.status === 'CHECKED_IN' && <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">⏳ กำลังทำกิจกรรม</span>}
                                            {user.status === 'CHECKED_OUT' && <span className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">⚠️ รอสโมสรยืนยัน</span>}
                                            {user.status === 'CLUB_VERIFIED' && <span className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">ส่งให้คณบดีแล้ว</span>}
                                            {user.status === 'DEAN_APPROVED' && <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">✅ อนุมัติแล้ว</span>}
                                            {user.status === 'DEAN_REJECTED' && <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">❌ ไม่อนุมัติ</span>}
                                        </td>

                                        <td className="p-4 text-center">
                                            {user.status === 'CHECKED_OUT' ? (
                                                <button
                                                    onClick={() => handleVerify(user.registration_id)}
                                                    className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-semibold shadow-md transition-all transform hover:-translate-y-0.5"
                                                >
                                                    ยืนยันชั่วโมง
                                                </button>
                                            ) : (
                                                <span className="text-xs text-slate-400">ไม่มี Action</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}