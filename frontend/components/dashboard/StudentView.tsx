// components/dashboard/StudentView.tsx
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import { PDFDownloadLink } from "@react-pdf/renderer";
import ReportPDF from "../ReportPDF";

export default function StudentView() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [reportData, setReportData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const resJobs = await api.get("/jobs");
                setJobs(resJobs.data);
                const resReport = await api.get("/jobs/my-report/export");
                setReportData(resReport.data);
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleRegister = async (jobId: number) => {
        if (!confirm("ยืนยันการลงทะเบียน?")) return;
        try {
            await api.post(`/jobs/${jobId}/register`);
            alert("ลงทะเบียนสำเร็จ!");
            window.location.reload();
        } catch (err: any) {
            alert(err.response?.data?.error || "ลงทะเบียนไม่สำเร็จ");
        }
    };

    if (loading) return <div className="text-center py-20 text-slate-400 animate-pulse">กำลังเตรียมกิจกรรมดีๆ ให้คุณ...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Hero Stats Card */}
            <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-10 rounded-[2.5rem] shadow-2xl shadow-purple-200 text-white relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h3 className="text-indigo-100 font-medium opacity-90">ชั่วโมงสะสมทั้งหมด</h3>
                        <p className="text-6xl font-black mt-2">
                            {reportData?.totalHours || "0.00"} <span className="text-2xl font-light opacity-80">ชม.</span>
                        </p>
                    </div>
                    {reportData?.activities?.length > 0 && (
                        <PDFDownloadLink
                            document={<ReportPDF data={reportData} />}
                            fileName={`Volunteer_Report.pdf`}
                            className="bg-white/20 backdrop-blur-md hover:bg-white/30 border border-white/40 px-8 py-4 rounded-3xl font-bold transition-all flex items-center gap-2 text-lg shadow-lg"
                        >
                            {({ loading }) => (loading ? "⏳ กำลังเตรียมไฟล์..." : "📥 โหลดรายงาน PDF")}
                        </PDFDownloadLink>
                    )}
                </div>
                {/* Decorative circle in card */}
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full"></div>
            </div>

            {/* Scan Shortcut */}
            <div className="bg-emerald-50 border-2 border-emerald-100 p-6 rounded-[2rem] flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4 text-center sm:text-left">
                    <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-emerald-200">📷</div>
                    <div>
                        <h3 className="text-lg font-black text-emerald-800">Check-in / Out ตอนนี้เลย!</h3>
                        <p className="text-emerald-600 text-sm">หันกล้องสแกน QR Code หน้างานได้ทันที</p>
                    </div>
                </div>
                <Link href="/scan" className="w-full sm:w-auto bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 text-center">
                    เปิดกล้องสแกน
                </Link>
            </div>

            <h2 className="text-3xl font-black text-slate-800 ml-2">กิจกรรมแนะนำ ✨</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {jobs.map((job) => (
                    <div key={job.id} className="group bg-white border-2 border-slate-50 p-7 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-500 flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 rounded-bl-[4rem] -z-0 transition-transform group-hover:scale-110"></div>
                        
                        <div className="relative z-10 flex-1">
                            <span className="bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-4 inline-block">
                                {job.hours_credit} ชั่วโมง
                            </span>
                            <h3 className="text-2xl font-black text-slate-800 mb-3 leading-tight group-hover:text-indigo-600 transition-colors">
                                {job.title}
                            </h3>
                            <p className="text-slate-400 text-sm mb-6 line-clamp-2 leading-relaxed">
                                {job.description}
                            </p>
                            
                            <div className="space-y-3 bg-slate-50 p-5 rounded-3xl text-sm font-medium text-slate-600 border border-slate-100">
                                <p className="flex items-center gap-3">📍 <span className="text-slate-800">{job.location}</span></p>
                                <p className="flex items-center gap-3">⏰ <span className="text-slate-800">{new Date(job.start_time).toLocaleDateString("th-TH")}</span></p>
                            </div>
                        </div>

                        <div className="relative z-10 mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">รับจำนวน</p>
                                <p className="text-xl font-black text-slate-800">
                                    {job.current_attendees} <span className="text-slate-300 font-normal">/ {job.max_capacity}</span>
                                </p>
                            </div>
                            
                            {job.status === 'OPEN' && job.current_attendees < job.max_capacity ? (
                                <button
                                    onClick={() => handleRegister(job.id)}
                                    className="bg-slate-800 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-lg hover:shadow-indigo-200"
                                >
                                    จองที่นั่ง
                                </button>
                            ) : (
                                <button disabled className="bg-slate-100 text-slate-400 px-6 py-3 rounded-2xl font-bold cursor-not-allowed">
                                    {job.status === 'OPEN' ? 'เต็มแล้ว' : 'ปิดรับ'}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}