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
    // 1. Ambil CSRF token untuk proteksi Sanctum
    await axios.get("/sanctum/csrf-cookie");

    // 2. Hit endpoint login (sesuaikan dengan route Laravel Anda, misal /api/login atau /login)
    await axios.post("/api/login", credentials);

    // 3. Jika berhasil, ambil data user saat ini
    const { data } = await axios.get("/api/user");
    set({ user: data, isAuthenticated: true });
  },

  register: async (userData) => {
    await axios.get("/sanctum/csrf-cookie");
    // Hit endpoint register
    await axios.post("/api/register", userData);

    // Otomatis login setelah register berhasil
    const { data } = await axios.get("/api/user");
    set({ user: data, isAuthenticated: true });
  },

  logout: async () => {
    try {
      await axios.post("/api/logout");
    } catch (error) {
      console.error("Gagal logout di server:", error);
    } finally {
      // Bersihkan state di sisi client terlepas dari response server
      set({ user: null, isAuthenticated: false });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      // Cek apakah user memiliki sesi valid saat me-refresh browser
      const { data } = await axios.get("/api/user");
      set({ user: data, isAuthenticated: true, isLoading: false });
    } catch (error) {
      console.error("Gagal cek auth:", error);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
