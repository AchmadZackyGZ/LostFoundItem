import { create } from "zustand";
import axios from "@/lib/axios";

// Sesuaikan struktur User dengan response database Laravel Anda
interface User {
  id: number;
  name: string;
  email: string;
  nim?: string;
  role?: string;
  department?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Fungsi-fungsi aksi yang sekarang berbasis Promise (async)
  login: (credentials: Record<string, string>) => Promise<void>;
  register: (userData: Record<string, string>) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (credentials) => {
    await axios.get("/sanctum/csrf-cookie");

    // Tembak API Login dan langsung tangkap data user dari response-nya
    const { data } = await axios.post("/api/auth/login", credentials);

    // Simpan data user ke state TANPA perlu menembak /me lagi
    // Asumsinya respon Laravel Anda: { message: "Login berhasil", user: { ... } }
    set({ user: data.user, isAuthenticated: true });
  },

  register: async (userData) => {
    await axios.get("/sanctum/csrf-cookie");

    // TEMBAKAN DIREVISI: /api/auth/register
    await axios.post("/api/auth/register", userData);

    // HAPUS pemanggilan /api/auth/me di sini!
    // Kita tidak bisa mengambil data user karena mereka belum memasukkan OTP.
    // Biarkan promise ini selesai dengan sukses agar router.push('/verify-otp') bisa tereksekusi.
    // set({ user: data, isAuthenticated: true });
  },

  logout: async () => {
    try {
      // TEMBAKAN DIREVISI: /api/auth/logout
      await axios.post("/api/auth/logout");
    } catch (error) {
      console.error("Gagal logout di server:", error);
    } finally {
      set({ user: null, isAuthenticated: false });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      // TEMBAKAN DIREVISI: /api/auth/me
      const { data } = await axios.get("/api/auth/me");
      set({ user: data, isAuthenticated: true, isLoading: false });
    } catch (error) {
      // 🔥 HAPUS console.error DI SINI AGAR TIDAK MUNCUL LAYAR MERAH
      // Biarkan state menjadi false secara diam-diam saat user belum login
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
