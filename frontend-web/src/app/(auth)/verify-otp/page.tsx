"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import api from "@/lib/axios"; // Custom instance axios Anda untuk request
import axios from "axios"; // Axios bawaan HANYA untuk type guard (isAxiosError)

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  // State untuk 6 digit OTP
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // State untuk Timer Kirim Ulang (60 detik)
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Jika tidak ada parameter email di URL, kembalikan ke register
  useEffect(() => {
    if (!emailParam) {
      router.replace("/register");
    }
  }, [emailParam, router]);

  // Logika Timer Kirim Ulang OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (!canResend) {
      const asyncUpdate = setTimeout(() => {
        setCanResend(true);
      }, 0);
      return () => clearTimeout(asyncUpdate);
    }
  }, [countdown, canResend]);

  // Handler saat input diketik
  const handleChange = (index: number, value: string) => {
    // Hanya izinkan angka
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    // Ambil karakter terakhir jika user mengetik cepat
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Otomatis pindah ke kotak berikutnya jika sudah terisi
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handler untuk tombol Backspace (mundur ke kotak sebelumnya)
  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handler untuk Paste kode langsung 6 digit
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6).split("");
    if (pastedData.some((char) => !/^\d$/.test(char))) return; // Tolak jika ada huruf

    const newOtp = [...otp];
    pastedData.forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);

    // Focus ke input terakhir yang terisi
    const focusIndex = pastedData.length < 6 ? pastedData.length : 5;
    inputRefs.current[focusIndex]?.focus();
  };

  // FUNGSI UTAMA: Verifikasi OTP
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      setErrorMsg("Mohon masukkan 6 digit kode OTP secara lengkap.");
      return;
    }

    setIsLoading(true);

    try {
      // API CALL: Mengarah ke /api/auth/verify-email
      await api.post("/api/auth/verify-email", {
        email: emailParam,
        otp: otpCode, // Sesuaikan nama key 'otp' dengan apa yang diharapkan controller Laravel Anda (bisa juga 'code' atau 'token')
      });

      // Jika berhasil tembus OTP, login-kan user lalu lempar ke Dasbor
      // (Karena sistem OTP biasanya memberi respon sukses, tapi butuh fetch user data lagi)
      router.push("/");
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        setErrorMsg(error.response.data.message);
      } else {
        setErrorMsg("Kode OTP tidak valid atau sudah kadaluarsa.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // FUNGSI UTAMA: Resend OTP
  const handleResend = async () => {
    if (!canResend) return;

    setCanResend(false);
    setCountdown(60);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      // API CALL: Mengarah ke /api/auth/resend-verification
      await api.post("/api/auth/resend-verification", { email: emailParam });

      setSuccessMsg("Kode OTP baru telah dikirim ke email Anda.");
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        setErrorMsg(error.response.data.message);
      } else {
        setErrorMsg("Gagal mengirim ulang kode. Coba lagi nanti.");
      }
      // Reset timer jika gagal
      setCanResend(true);
      setCountdown(0);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface dark:bg-[#0f1523] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Lost & Found UISI
        </h1>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Verifikasi Email
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 px-4">
          Masukkan 6 digit kode OTP yang telah dikirimkan ke email <br />
          <span className="font-bold text-gray-700 dark:text-gray-300">
            {emailParam}
          </span>
        </p>

        {errorMsg && (
          <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400 font-medium">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-600 dark:text-green-400 font-medium">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-8">
          {/* 6 Digit Input Boxes */}
          <div className="flex justify-center gap-2 sm:gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                // @ts-expect-error - Mengabaikan error typing ref array di React yang kadang rewel
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={isLoading}
                className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold bg-white dark:bg-[#0b1120] border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none transition-all text-gray-900 dark:text-white disabled:opacity-50"
              />
            ))}
          </div>

          {/* Tombol Verifikasi */}
          <button
            type="submit"
            disabled={isLoading || otp.join("").length < 6}
            className="w-full bg-primary hover:bg-blue-700 disabled:bg-blue-900/50 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-lg flex justify-center items-center gap-2 transition-colors shadow-lg"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Memproses...
              </>
            ) : (
              <>
                Verifikasi Kode <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Resend OTP */}
        <div className="mt-6 text-sm">
          <p className="text-gray-500 dark:text-gray-400">
            Tidak menerima kode?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={!canResend}
              className={`font-semibold transition-colors ${canResend ? "text-primary dark:text-blue-400 hover:underline" : "text-gray-400 dark:text-gray-600 cursor-not-allowed"}`}
            >
              Kirim Ulang OTP
            </button>
          </p>
          {!canResend && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 flex items-center justify-center gap-1.5">
              Kirim ulang tersedia dalam 00:
              {countdown.toString().padStart(2, "0")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Wrapper Suspense (Wajib untuk Next.js App Router jika memakai useSearchParams)
export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center bg-gray-50 dark:bg-[#0b1120]">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-sm text-gray-500">Memuat halaman...</p>
        </div>
      }
    >
      <VerifyOtpContent />
    </Suspense>
  );
}
