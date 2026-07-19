import axios from "axios";

const axiosInstance = axios.create({
  // Nanti URL ini bisa diubah sesuai port backend Laravel Anda (biasanya 8000)
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000",
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  // withCredentials SANGAT PENTING untuk Laravel Sanctum agar cookie sesi tersimpan
  withCredentials: true,
});

// Interceptor untuk menangani error global (misal: token expired / belum login)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Logic jika user belum login/sesi habis (bisa redirect ke /login nanti)
      console.warn("Unauthorized! Harap login kembali.");
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
