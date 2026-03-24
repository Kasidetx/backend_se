// components/dashboard/ClubAdminView.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function ClubAdminView() {
    const [myJobs, setMyJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // ดึงข้อมูลกิจกรรม (ในอนาคตควรมี API ดึงเฉพาะงานที่ตัวเองสร้าง)
        api.get("/jobs").then((res) => {
            setMyJobs(res.data);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    // คำนวณข้อมูลสรุป (Summary Stats)
    const totalJobs = myJobs.length;
    const totalAttendees = myJobs.reduce((sum, job) => sum + (job.current_attendees || 0), 0);

    if (loading) return <div className="text-center p-10 text-gray-500 animate-pulse">กำลังโหลดข้อมูลกิจกรรม...</div>;

    return (
        <div className="space-y-6">
            
            {/* Header & Stats Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">ระบบจัดการกิจกรรม (Club Admin)</h2>
                    
                    <div className="flex gap-4">
                        <div className="bg-white px-6 py-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl">📅</div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">กิจกรรมทั้งหมด</p>
                                <p className="text-2xl font-bold text-gray-800">{totalJobs} <span className="text-sm font-normal">งาน</span></p>
                            </div>
                        </div>
                        <div className="bg-white px-6 py-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xl">👥</div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">ผู้เข้าร่วมรวม</p>
                                <p className="text-2xl font-bold text-gray-800">{totalAttendees} <span className="text-sm font-normal">คน</span></p>
                            </div>
                        </div>
                    </div>
                </div>

                <Link
                    href="/jobs/create"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
                >
                    <span className="text-xl">+</span> สร้างกิจกรรมใหม่
                </Link>
            </div>

            {/* Modern Table Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left border-collapse">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="p-5 text-sm font-semibold text-gray-500 w-1/3">ชื่องานกิจกรรม</th>
                                <th className="p-5 text-sm font-semibold text-gray-500">สถานะ</th>
                                <th className="p-5 text-sm font-semibold text-gray-500">วันเวลาที่จัด</th>
                                <th className="p-5 text-sm font-semibold text-gray-500">ผู้เข้าร่วม</th>
                                <th className="p-5 text-sm font-semibold text-gray-500 text-center">การจัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-gray-600">
                            {myJobs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-10 text-center text-gray-400">ยังไม่มีกิจกรรมที่คุณสร้าง</td>
                                </tr>
                            ) : myJobs.map((job) => (
                                <tr key={job.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="p-5">
                                        <p className="font-bold text-gray-800 mb-1">{job.title}</p>
                                        <p className="text-xs text-gray-400 flex items-center gap-1">
                                            📍 {job.location || "ไม่ระบุสถานที่"}
                                        </p>
                                    </td>
                                    
                                    <td className="p-5">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                            job.status === 'OPEN' ? 'bg-green-100 text-green-700' : 
                                            job.status === 'CLOSED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                            {job.status === 'OPEN' ? '🟢 เปิดรับสมัคร' : 
                                             job.status === 'CLOSED' ? '🔴 ปิดรับสมัคร' : job.status}
                                        </span>
                                    </td>
                                    
                                    <td className="p-5">
                                        <p className="text-sm font-medium">{new Date(job.start_time).toLocaleDateString("th-TH")}</p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(job.start_time).toLocaleTimeString("th-TH", {hour: '2-digit', minute:'2-digit'})} น.
                                        </p>
                                    </td>
                                    
                                    <td className="p-5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-blue-600">{job.current_attendees}</span>
                                            <span className="text-xs text-gray-400">/ {job.max_capacity}</span>
                                        </div>
                                        {/* Mini Progress Bar */}
                                        <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full ${job.current_attendees >= job.max_capacity ? 'bg-red-400' : 'bg-blue-500'}`}
                                                style={{ width: `${Math.min((job.current_attendees / job.max_capacity) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                    </td>
                                    
                                    <td className="p-5 text-center">
                                        <div className="flex justify-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                            <Link
                                                href={`/jobs/${job.id}/manage`}
                                                className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1 border border-indigo-100"
                                            >
                                                📱 จัดการ/QR
                                            </Link>
                                            
                                            {/* ปุ่มยืนยันชั่วโมง (เดี๋ยวเราจะมาทำหน้านี้กันต่อ) */}
                                            <Link
                                                href={`/jobs/${job.id}/verify`}
                                                className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1 border border-green-100"
                                            >
                                                ✅ ตรวจสอบคนเข้างาน
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}