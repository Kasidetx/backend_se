// app/dashboard/page.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Nevbar";
import StudentView from "@/components/dashboard/StudentView";
import ClubAdminView from "@/components/dashboard/ClubAdminView";
import DeanView from "@/components/dashboard/DeanView";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return <div className="p-10 text-center">กำลังโหลด...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto p-6">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">
                    สวัสดี, {user.firstName} {user.lastName} 👋
                </h1>

                {/* เลือกแสดงผลตาม Role */}
                {user.role === "STUDENT" && <StudentView />}
                {user.role === "CLUB_ADMIN" && <ClubAdminView />}
                {user.role === "DEAN" && <DeanView />}
            </main>
        </div>
    );
}