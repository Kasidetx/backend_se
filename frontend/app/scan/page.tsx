// app/scan/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Scanner } from "@yudiel/react-qr-scanner";
import api from "@/lib/api";

export default function ScanQRPage() {
    const router = useRouter();
    const [message, setMessage] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [isProcessing, setIsProcessing] = useState<boolean>(false); // ป้องกันการยิง API ซ้ำรัวๆ

    // ฟังก์ชันนี้จะทำงานอัตโนมัติเมื่อกล้องจับ QR Code ได้
    const handleScan = async (text: string) => {
        if (isProcessing) return; // ถ้ากำลังโหลดอยู่ ให้ข้ามไปก่อน
        if (!text) return;

        setIsProcessing(true);
        setMessage("กำลังตรวจสอบข้อมูล...");
        setError("");

        try {
            // ส่ง Token ที่ได้จาก QR Code ไปให้ Backend
            const res = await api.post("/qr/scan", { token: text });
            
            setMessage(res.data.message || "บันทึกข้อมูลสำเร็จ!");
            
            // สแกนเสร็จ ให้รอกลับไปหน้า Dashboard อัตโนมัติ
            setTimeout(() => {
                router.push("/dashboard");
            }, 2500);

        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || "QR Code ไม่ถูกต้องหรือหมดอายุ");
            setIsProcessing(false); // ปลดล็อคให้สแกนใหม่ได้ถ้า Error
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden relative">
                
                {/* Header */}
                <div className="bg-blue-600 text-white text-center py-4 relative">
                    <button 
                        onClick={() => router.back()} 
                        className="absolute left-4 top-4 text-white hover:text-gray-200"
                    >
                        ◀ กลับ
                    </button>
                    <h1 className="text-xl font-bold">สแกน QR Code</h1>
                    <p className="text-sm opacity-80 mt-1">Check-in / Check-out กิจกรรม</p>
                </div>

                {/* ส่วนแสดงกล้อง (Camera View) */}
                <div className="aspect-square relative bg-gray-900">
                    {!isProcessing ? (
                        <Scanner
                            onResult={(text) => handleScan(text)}
                            onError={(error) => console.log(error?.message)}
                            options={{
                                delayBetweenScanAttempts: 1000, // หน่วงเวลาสแกนนิดนึง ไม่ให้กล้องทำงานหนักไป
                            }}
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    )}
                </div>

                {/* ส่วนแสดงข้อความแจ้งเตือน (Status Box) */}
                <div className="p-6 text-center min-h-[120px] flex flex-col justify-center">
                    {error ? (
                        <div className="text-red-600 font-medium">
                            <span className="text-2xl block mb-2">❌</span>
                            {error}
                            <button 
                                onClick={() => {
                                    setError("");
                                    setIsProcessing(false);
                                }} 
                                className="mt-4 block w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200"
                            >
                                ลองใหม่อีกครั้ง
                            </button>
                        </div>
                    ) : message ? (
                        <div className="text-green-600 font-medium animate-pulse">
                            <span className="text-2xl block mb-2">✅</span>
                            {message}
                        </div>
                    ) : (
                        <p className="text-gray-500">
                            หันกล้องไปที่ QR Code <br/>ที่สโมสรเตรียมไว้ให้
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}