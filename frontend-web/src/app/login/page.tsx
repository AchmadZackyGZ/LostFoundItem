"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, EyeOff, Eye, LogIn } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4">
      {/* Teks Header di Luar Card */}
      <h1 className="text-3xl font-bold text-primary dark:text-blue-200 mb-8 tracking-tight">
        UISI Lost & Found
      </h1>

      {/* Card Login */}
      <div className="w-full max-w-md bg-surface dark:bg-[#0f1523] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Selamat Datang Kembali
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Masuk ke akun Anda untuk mulai melapor atau mencari barang
          </p>
        </div>

        <form className="space-y-5">
          {/* Input Email */}
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
                className="w-full bg-white dark:bg-[#0b1120] border border-gray-300 dark:border-gray-700 rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="email@student.uisi.ac.id"
              />
            </div>
          </div>

          {/* Input Password */}
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
                className="w-full bg-white dark:bg-[#0b1120] border border-gray-300 dark:border-gray-700 rounded-lg pl-10 pr-10 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="********"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>

          {/* Tombol Masuk */}
          <div className="pt-2">
            <button
              type="button"
              className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2 transition-colors shadow-lg shadow-primary/20"
            >
              Masuk <LogIn size={18} />
            </button>
          </div>
        </form>

        {/* Footer Link */}
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
