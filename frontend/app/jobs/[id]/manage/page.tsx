// app/jobs/[id]/manage/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import api from "@/lib/api";

export default function ManageJobPage() {
    const params = useParams();
    const router = useRouter();
    const jobId = params.id; // ดึง ID ของงานจาก URL

    const [qrData, setQrData] = useState<string>("");
    const [qrType, setQrType] = useState<"CHECK_IN" | "CHECK_OUT" | null>(null);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [error, setError] = useState<string>("");

    // ฟังก์ชันยิง API ไปขอ QR Code ใหม่
    const generateQR = async (type: "CHECK_IN" | "CHECK_OUT") => {
        setError("");
        try {
            const res = await api.post("/qr/generate", {
                jobId: Number(jobId),
                type: type,
            });
            
            // Backend ส่งค่า qrData กลับมาเป็น JSON String
            setQrData(res.data.qrData);
            setQrType(type);
            setTimeLeft(60); // ตั้งเวลานับถอยหลัง 60 วินาที
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || "ไม่สามารถสร้าง QR Code ได้");
        }
    };

    // ระบบนับถอยหลัง (Countdown Timer)
    useEffect(() => {
        if (timeLeft > 0) {
            const timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
            return () => clearInterval(timerId); // Cleanup timer เมื่อ component ถูก unmount หรือเวลาเปลี่ยน
        } else if (timeLeft === 0 && qrData !== "") {
            // ถ้าเวลาหมด ให้ซ่อน QR Code ทันที
            setQrData("");
            setQrType(null);
        }
    }, [timeLeft, qrData]);

    return (
        <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
            <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-8 text-center text-gray-800">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">ระบบจัดการ QR Code</h1>
                    <button 
                        onClick={() => router.back()} 
                        className="text-gray-500 hover:text-gray-700 underline"
                    >
                        กลับไปหน้าหลัก
                    </button>
                </div>

                {error && <div className="mb-4 p-3 bg-red-100 text-red-600 rounded">{error}</div>}

                <div className="flex gap-4 justify-center mb-8">
                    <button
                        onClick={() => generateQR("CHECK_IN")}
                        className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition shadow"
                    >
                        สร้าง QR Code เข้างาน
                    </button>
                    <button
                        onClick={() => generateQR("CHECK_OUT")}
                        className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition shadow"
                    >
                        สร้าง QR Code ออกงาน
                    </button>
                </div>

                {/* ส่วนแสดงภาพ QR Code */}
                {qrData ? (
                    <div className="flex flex-col items-center border-2 border-dashed border-gray-300 p-8 rounded-lg bg-gray-50">
                        <h2 className={`text-xl font-bold mb-4 ${qrType === "CHECK_IN" ? "text-green-600" : "text-orange-600"}`}>
                            สแกนเพื่อ {qrType === "CHECK_IN" ? "เข้างาน (Check-in)" : "ออกงาน (Check-out)"}
                        </h2>
                        
                        <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
                            {/* ใช้ QRCodeSVG เพื่อให้ภาพคมชัดไม่แตก */}
                            <QRCodeSVG value={qrData} size={250} />
                        </div>

                        <p className="text-xl font-mono font-bold text-red-500">
                            หมดอายุใน: {timeLeft} วินาที
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            (หากหมดเวลา กรุณากดสร้าง QR Code ใหม่อีกครั้ง)
                        </p>
                    </div>
                ) : (
                    <div className="border-2 border-dashed border-gray-300 p-12 rounded-lg bg-gray-50 text-gray-400">
                        กรุณากดปุ่มด้านบนเพื่อสร้าง QR Code สำหรับให้นักศึกษาสแกน
                    </div>
                )}
            </div>
        </div>
    );
}