import { create } from "zustand";
import axios from "@/lib/axios";

// Struktur data User
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Fungsi-fungsi aksi
  login: (userData: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>; // Untuk cek sesi saat web pertama kali dibuka
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  // Sementara kita buat versi "Dummy" yang siap diganti dengan call API Axios
  login: (userData) => {
    set({ user: userData, isAuthenticated: true });
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
    // Nanti ditambahkan: await axios.post('/logout');
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      // Nanti ditambahkan: const res = await axios.get('/api/user');
      // set({ user: res.data, isAuthenticated: true, isLoading: false });

      // Simulasi loading sementara
      setTimeout(() => {
        set({ isLoading: false });
      }, 500);
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
