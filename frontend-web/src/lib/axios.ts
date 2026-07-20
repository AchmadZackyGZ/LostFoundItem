import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000",
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    Accept: "application/json",
    // HAPUS Content-Type dari sini!
  },
});

// Interceptor untuk menangani error global (misal: token expired / belum login)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Kita biarkan Axios me-reject promise secara natural tanpa melakukan console.warn/error
    // agar Next.js Dev Overlay tidak terpancing untuk muncul.
    return Promise.reject(error);
  },
);

export default api;
