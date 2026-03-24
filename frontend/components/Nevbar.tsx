"use client";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        // เปลี่ยนเป็น Sticky Navbar พร้อมเอฟเฟกต์กระจกเบลอๆ
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                
                {/* โลโก้แบรนด์ */}
                <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                        V
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        RSU Volunteer
                    </span>
                </Link>

                <div className="flex items-center gap-4">
                    {user && (
                        <div className="flex items-center gap-4">
                            {/* ป้ายบอก Role */}
                            <span className="hidden sm:flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-700">{user.firstName}</span>
                                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                                    {user.role}
                                </span>
                            </span>
                            
                            {/* ปุ่ม Logout แบบมินิมอล */}
                            <button
                                onClick={logout}
                                className="text-gray-500 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                ออกจากระบบ
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}