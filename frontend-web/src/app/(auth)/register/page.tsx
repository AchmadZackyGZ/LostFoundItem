"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2 } from "lucide-react";
import axios from "axios";

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);

  const [formData, setFormData] = useState({
    name: "",
    nim: "",
    department: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Perbaikan tipe: Menggunakan Union Type (HTMLInputElement | HTMLSelectElement)
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (formData.password !== formData.password_confirmation) {
      setErrorMsg("Password dan Konfirmasi Password tidak cocok.");
      return;
    }

    setIsLoading(true);

    try {
      // Tembak API Backend
      await register(formData);
      router.push(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data;
        if (responseData?.message) {
          setErrorMsg(responseData.message);
        } else if (responseData?.error) {
          setErrorMsg(responseData.error);
        } else if (responseData?.errors && typeof responseData.errors === "object") {
          const firstErrKey = Object.keys(responseData.errors)[0];
          const firstErrVal = responseData.errors[firstErrKey];
          if (Array.isArray(firstErrVal) && firstErrVal.length > 0) {
            setErrorMsg(firstErrVal[0]);
          } else if (typeof firstErrVal === "string") {
            setErrorMsg(firstErrVal);
          } else {
            setErrorMsg("Gagal mendaftar. Mohon periksa input Anda.");
          }
        } else if (error.code === "ERR_NETWORK" || !error.response) {
          setErrorMsg("Gagal terhubung ke server backend. Pastikan server backend berjalan.");
        } else {
          setErrorMsg(
            "Gagal mendaftar. Periksa kembali data Anda atau coba lagi nanti.",
          );
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
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4 py-12">
      <div className="w-full max-w-md bg-surface dark:bg-[#0f1523] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Buat Akun Baru
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Bergabung dengan komunitas Lost & Found UISI
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400 text-center font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full bg-white dark:bg-[#0b1120] border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all text-gray-900 dark:text-white"
              placeholder="Nama Lengkap"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
              NIM
            </label>
            <input
              type="text"
              name="nim"
              value={formData.nim}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full bg-white dark:bg-[#0b1120] border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all text-gray-900 dark:text-white"
              placeholder="Nomor Induk Mahasiswa"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
              Program Studi
            </label>
            <select
              name="department"
              value={formData.department}
              // Gunakan as any sementara jika TypeScript rewel karena parameter event select sedikit berbeda dengan input text
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full bg-white dark:bg-[#0b1120] border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all text-gray-900 dark:text-white appearance-none cursor-pointer"
            >
              <option value="" disabled>
                Pilih Program Studi
              </option>
              <option value="informatika">informatika</option>
              <option value="Sistem Informasi">Sistem Informasi</option>
              <option value="Desain Komunikasi Visual">
                Desain Komunikasi Visual
              </option>
              <option value="Manajemen Rekayasa">Manajemen Rekayasa</option>
              <option value="Management">management</option>
              <option value="teknik kimia">teknik kimia</option>
              <option value="teknik logistik">teknik logistik</option>
              <option value="akutansi">akutansi</option>
              <option value="Teknologi Industri Pertanian">
                Teknologi Industri Pertanian
              </option>
              {/* Tambahkan opsi jurusan lain sesuai kebutuhan kampus Anda */}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full bg-white dark:bg-[#0b1120] border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all text-gray-900 dark:text-white"
              placeholder="email@student.uisi.ac.id"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full bg-white dark:bg-[#0b1120] border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all text-gray-900 dark:text-white"
              placeholder="********"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
              Password Confirmation
            </label>
            <input
              type="password"
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full bg-white dark:bg-[#0b1120] border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all text-gray-900 dark:text-white"
              placeholder="********"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#001d66] hover:bg-blue-800 disabled:bg-blue-900 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg flex justify-center items-center transition-colors shadow-md"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" />{" "}
                  Memproses...
                </>
              ) : (
                "Daftar"
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="text-primary dark:text-blue-400 hover:underline"
          >
            Masuk di sini
          </Link>
        </div>
      </div>
    </div>
  );
}
