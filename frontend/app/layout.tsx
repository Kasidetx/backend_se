import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";
// 1. Import ฟอนต์จาก Google Fonts
import { Prompt } from "next/font/google";

// 2. ตั้งค่าฟอนต์
const prompt = Prompt({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin', 'thai'],
  variable: '--font-prompt', // สร้างตัวแปร CSS
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      {/* 3. นำตัวแปรฟอนต์ไปใส่ใน body */}
      <body className={`${prompt.variable} font-sans bg-slate-50 text-slate-800`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}