// app/login/page.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext"; //
import api from "@/lib/api"; //
import Link from "next/link";

export default function LoginPage() {
    const { login } = useAuth(); //
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        try {
            // เรียก API Login ตามที่กำหนดในระบบ
            const res = await api.post("/auth/login", { username, password });
            // ส่งข้อมูลเข้า AuthContext
            login(res.data.token, res.data.user);
        } catch (err: any) {
            setError(err.response?.data?.message || "เข้าสู่ระบบไม่สำเร็จ"); //
        }
    };

    return (
        // พื้นหลังใช้สีฟ้าอ่อนพาสเทล และเพิ่มลาย Blob ตกแต่ง
        <div className="flex min-h-screen items-center justify-center bg-[#F0F4FF] relative overflow-hidden font-sans">
            
            {/* Decorative Elements (Blobs) */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>

            <div className="w-full max-w-md bg-white/90 backdrop-blur-lg p-10 rounded-[3rem] shadow-[0_20px_50px_rgba(79,110,247,0.15)] relative z-10 border border-white">
                
                {/* Logo & Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-[2rem] shadow-lg shadow-blue-200 mb-6 rotate-3">
                        <span className="text-white text-4xl font-black">V</span>
                    </div>
                    <h2 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        ยินดีต้อนรับ
                    </h2>
                    <p className="text-slate-400 mt-2 font-medium">เข้าสู่ระบบ RSU Volunteer</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-500 text-sm rounded-2xl flex items-center gap-2">
                        <span className="text-lg">⚠️</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-slate-700 text-sm font-bold ml-2">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-400 focus:bg-white rounded-2xl outline-none transition-all text-slate-800 placeholder:text-slate-300 shadow-inner"
                            placeholder="รหัสนักศึกษา หรือชื่อผู้ใช้"
                            required
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="block text-slate-700 text-sm font-bold ml-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-400 focus:bg-white rounded-2xl outline-none transition-all text-slate-800 placeholder:text-slate-300 shadow-inner"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-200 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all mt-4"
                    >
                        เข้าสู่ระบบ
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-slate-500 font-medium">
                        ยังไม่มีบัญชี?{" "}
                        <Link href="/register" className="text-blue-600 hover:text-indigo-600 font-bold underline decoration-2 underline-offset-4 transition-colors">
                            สมัครสมาชิกใหม่
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}