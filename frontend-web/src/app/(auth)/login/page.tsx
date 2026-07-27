"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, EyeOff, Eye, LogIn, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import axios from "axios";

export default function LoginPage() {
  const router = useRouter();

  // Ambil fungsi login dari Zustand
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("Email dan password wajib diisi.");
      return;
    }

    setIsLoading(true);

    try {
      // Tembak API Backend
      const user = await login({ email, password });

      // Jika role === admin, arahkan ke Admin Command Center (/admin)
      if (user?.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (error: unknown) {
      // 👈 3. Gunakan axios.isAxiosError untuk memvalidasi tipe error
      if (axios.isAxiosError(error)) {
        if (error.response?.data?.message) {
          setErrorMsg(error.response.data.message);
        } else {
          setErrorMsg("Kredensial tidak valid atau server bermasalah.");
        }
      } else {
        // Tangkapan jika error bukan berasal dari API (misal: koneksi putus)
        setErrorMsg("Terjadi kesalahan yang tidak terduga.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold text-primary dark:text-blue-200 mb-8 tracking-tight">
        UISI Lost & Found
      </h1>

      <div className="w-full max-w-md bg-surface dark:bg-[#0f1523] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Selamat Datang Kembali
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Masuk ke akun Anda untuk mulai melapor atau mencari barang
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400 text-center font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white dark:bg-[#0b1120] border border-gray-300 dark:border-gray-700 rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all text-gray-900 dark:text-white"
                placeholder="email@student.uisi.ac.id"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                Password
              </label>
              <Link
                href="#"
                className="text-xs font-medium text-primary dark:text-blue-400 hover:underline"
              >
                Lupa Password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white dark:bg-[#0b1120] border border-gray-300 dark:border-gray-700 rounded-lg pl-10 pr-10 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all text-gray-900 dark:text-white"
                placeholder="********"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2 transition-colors shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Memproses...
                </>
              ) : (
                <>
                  Masuk <LogIn size={18} />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="font-bold text-gray-900 dark:text-white hover:underline"
          >
            Daftar sekarang
          </Link>
        </div>
      </div>
    </div>
  );
}
