import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000",
  headers: {
    "X-Requested-With": "XMLHttpRequest", // Wajib untuk Sanctum
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // INI PALING KRUSIAL! Harus true agar Cookie terkirim.
  withXSRFToken: true, // Tambahkan ini untuk Axios versi baru (v1.6+)
});

// Interceptor untuk menangani error global (misal: token expired / belum login)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Kita biarkan Axios me-reject promise secara natural tanpa melakukan console.warn/error
    // agar Next.js Dev Overlay tidak terpancing untuk muncul.
    return Promise.reject(error);
  },
);

export default axiosInstance;
