// lib/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // URL ของ Backend [cite: 11]
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor: แนบ Token ไปกับทุก Request ถ้ามีใน LocalStorage
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
