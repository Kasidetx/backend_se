// app/register/page.tsx
"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        firstName: "",
        lastName: "",
        studentId: "",
        role: "STUDENT",
    });
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/auth/register", formData);
            alert("สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ");
            router.push("/login");
        } catch (err: any) {
            setError(err.response?.data?.message || "การสมัครสมาชิกผิดพลาด");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#FDFCF0] relative overflow-hidden p-6 font-sans">
            {/* Decorative Blobs */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-yellow-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>

            <div className="w-full max-w-lg bg-white/90 backdrop-blur-lg p-10 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] relative z-10 border border-white">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black text-slate-800">สร้างบัญชีใหม่</h2>
                    <p className="text-slate-400 mt-2 font-medium">เข้าร่วมเป็นส่วนหนึ่งกับ RSU Volunteer</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-500 text-sm rounded-2xl">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5 text-slate-700">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-bold ml-2">ชื่อจริง</label>
                            <input name="firstName" onChange={handleChange} className="w-full px-5 py-3 bg-slate-50 border-2 border-transparent focus:border-yellow-400 focus:bg-white rounded-2xl outline-none transition-all" required />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-bold ml-2">นามสกุล</label>
                            <input name="lastName" onChange={handleChange} className="w-full px-5 py-3 bg-slate-50 border-2 border-transparent focus:border-yellow-400 focus:bg-white rounded-2xl outline-none transition-all" required />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-bold ml-2">รหัสนักศึกษา (ถ้ามี)</label>
                        <input name="studentId" onChange={handleChange} className="w-full px-5 py-3 bg-slate-50 border-2 border-transparent focus:border-yellow-400 focus:bg-white rounded-2xl outline-none transition-all" />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-bold ml-2">บทบาทผู้ใช้งาน</label>
                        <select name="role" onChange={handleChange} className="w-full px-5 py-3 bg-slate-50 border-2 border-transparent focus:border-yellow-400 focus:bg-white rounded-2xl outline-none transition-all appearance-none cursor-pointer">
                            <option value="STUDENT">นักศึกษา (Student)</option>
                            <option value="CLUB_ADMIN">ผู้จัดกิจกรรม (Club Admin)</option>
                            <option value="DEAN">คณบดี (Dean)</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-bold ml-2">Username</label>
                        <input name="username" onChange={handleChange} className="w-full px-5 py-3 bg-slate-50 border-2 border-transparent focus:border-yellow-400 focus:bg-white rounded-2xl outline-none transition-all" required />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-bold ml-2">Password</label>
                        <input type="password" name="password" onChange={handleChange} className="w-full px-5 py-3 bg-slate-50 border-2 border-transparent focus:border-yellow-400 focus:bg-white rounded-2xl outline-none transition-all" required />
                    </div>

                    <button type="submit" className="w-full bg-slate-800 text-white py-4 rounded-2xl font-bold text-lg hover:bg-black transition-all shadow-lg mt-4">
                        สมัครสมาชิก
                    </button>
                </form>

                <p className="mt-6 text-center text-slate-500 font-medium">
                    มีบัญชีอยู่แล้ว? <Link href="/login" className="text-yellow-600 font-bold underline">เข้าสู่ระบบ</Link>
                </p>
            </div>
        </div>
    );
}