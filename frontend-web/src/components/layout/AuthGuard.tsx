"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2 } from "lucide-react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // Ambil state dan fungsi dari Zustand
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);

  // Jalankan pengecekan sesi ke backend setiap kali AuthGuard di-mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Pantau perubahan status loading dan autentikasi
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Jika loading selesai tapi tidak terautentikasi, tendang ke /login
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Tampilkan layar loading layar penuh selama proses pengecekan API berlangsung
  // (Mencegah tampilan Dasbor 'bocor' atau berkedip sebelum ditendang)
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-[#0b1120]">
        <Loader2 className="w-10 h-10 animate-spin text-primary dark:text-blue-400 mb-4" />
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium tracking-wide">
          Memverifikasi akses...
        </p>
      </div>
    );
  }

  // Jika sudah lolos loading dan terautentikasi, tampilkan halaman Dasbor/Tujuan
  return isAuthenticated ? <>{children}</> : null;
}
