// context/AuthContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

interface User {
    id: number;
    username: string;
    role: "STUDENT" | "CLUB_ADMIN" | "DEAN";
    firstName: string;
    lastName: string;
}

interface AuthContextType {
    user: User | null;
    login: (token: string, userData: User) => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // เช็ค Token ตอนโหลดหน้าเว็บครั้งแรก
        const checkUser = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    // ยิงไปเช็คกับ Backend ว่า Token ยังดีอยู่ไหม [cite: 40]
                    const res = await api.get("/auth/me");
                    setUser(res.data.user);
                } catch (error) {
                    console.error("Token invalid:", error);
                    localStorage.removeItem("token");
                }
            }
            setLoading(false);
        };
        checkUser();
    }, []);

    const login = (token: string, userData: User) => {
        localStorage.setItem("token", token);
        setUser(userData);
        router.push("/dashboard"); // Login เสร็จเด้งไป Dashboard
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};