"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  UploadCloud,
  MapPin,
  Calendar,
  X,
  Info,
  FileText,
  Send,
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

// Komponen Utama Isi Formulir
function ReportFormContent() {
  const searchParams = useSearchParams();
  const tabQuery = searchParams.get("tab");

  // Logika Cerdas & Bersih: Jadikan URL sebagai Penentu Tab (Single Source of Truth)
  // Tidak perlu useState dan useEffect yang memicu error linter beruntun!
  const reportType = tabQuery === "temuan" ? "temuan" : "kehilangan";

  return (
    <div className="container mx-auto px-4 lg:px-8 py-10 max-w-4xl">
      {/* Tab Switcher */}
      <div className="flex justify-center mb-8">
        <div className="bg-surface dark:bg-surface-dark border border-gray-200 dark:border-gray-800 p-1.5 rounded-xl inline-flex shadow-sm">
          <Link
            href="/report?tab=kehilangan"
            className={clsx(
              "px-8 py-2.5 rounded-lg text-sm font-bold transition-all text-center",
              reportType === "kehilangan"
                ? "bg-primary text-white shadow-md"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white",
            )}
          >
            Lapor Kehilangan
          </Link>
          <Link
            href="/report?tab=temuan"
            className={clsx(
              "px-8 py-2.5 rounded-lg text-sm font-bold transition-all text-center",
              reportType === "temuan"
                ? "bg-primary text-white shadow-md"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white",
            )}
          >
            Lapor Temuan
          </Link>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* FORM 1: LAPOR KEHILANGAN */}
      {/* ===================================================================== */}
      {reportType === "kehilangan" && (
        <div className="bg-surface dark:bg-[#151c2c] border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg overflow-hidden relative">
          {/* Garis Gradien Dekoratif */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-orange-400 opacity-80"></div>

          <div className="p-8 md:p-10">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Lapor Kehilangan
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-10">
              Mohon isi detail barang yang hilang seakurat mungkin untuk
              mempermudah proses pencarian.
            </p>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nama Barang
                  </label>
                  <input
                    type="text"
                    className="w-full bg-white dark:bg-[#0b1120] border border-gray-300 dark:border-gray-700/60 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600"
                    placeholder="Misal: Dompet Kulit Hitam"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Kategori
                  </label>
                  <select className="w-full bg-white dark:bg-[#0b1120] border border-gray-300 dark:border-gray-700/60 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all text-gray-900 dark:text-gray-200 appearance-none">
                    <option>Pilih Kategori</option>
                    <option>Elektronik</option>
                    <option>Dokumen</option>
                    <option>Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tanggal Kehilangan
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full bg-white dark:bg-[#0b1120] border border-gray-300 dark:border-gray-700/60 rounded-lg pl-4 pr-10 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600"
                      placeholder="mm/dd/yyyy"
                    />
                    <Calendar
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Lokasi Terakhir Terlihat
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full bg-white dark:bg-[#0b1120] border border-gray-300 dark:border-gray-700/60 rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600"
                      placeholder="Gedung, Ruangan, atau Area"
                    />
                    <MapPin
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Deskripsi Detail
                </label>
                <textarea
                  rows={4}
                  className="w-full bg-white dark:bg-[#0b1120] border border-gray-300 dark:border-gray-700/60 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 resize-none"
                  placeholder="Jelaskan secara detail mengenai barang yang hilang..."
                ></textarea>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Ciri-ciri Khusus
                  </label>
                  <span className="text-[10px] text-gray-500 font-mono tracking-wider">
                    Tekan Enter untuk menambah
                  </span>
                </div>
                <div className="w-full min-h-[50px] bg-white dark:bg-[#0b1120] border border-gray-300 dark:border-gray-700/60 rounded-lg px-3 py-2 flex flex-wrap gap-2 items-center focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                  <span className="bg-primary/10 dark:bg-blue-900/40 border border-primary/20 dark:border-blue-700/50 text-primary dark:text-blue-300 text-xs font-medium px-2.5 py-1.5 rounded-md flex items-center gap-1.5">
                    Warna Hitam{" "}
                    <X
                      size={12}
                      className="cursor-pointer hover:text-red-400"
                    />
                  </span>
                  <span className="bg-primary/10 dark:bg-blue-900/40 border border-primary/20 dark:border-blue-700/50 text-primary dark:text-blue-300 text-xs font-medium px-2.5 py-1.5 rounded-md flex items-center gap-1.5">
                    Gantungan Kunci Doraemon{" "}
                    <X
                      size={12}
                      className="cursor-pointer hover:text-red-400"
                    />
                  </span>
                  <input
                    type="text"
                    className="flex-grow bg-transparent border-none outline-none text-sm text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 min-w-[150px]"
                    placeholder="Tambah ciri khusus..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Unggah Foto (Opsional)
                </label>
                <div className="mt-1 flex flex-col justify-center items-center px-6 pt-8 pb-10 border-2 border-gray-300 dark:border-gray-700/80 border-dashed rounded-xl bg-gray-50 dark:bg-[#0b1120]/50 hover:bg-gray-100 dark:hover:bg-[#0b1120] transition-colors cursor-pointer group">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <UploadCloud className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Klik untuk mengunggah atau seret gambar ke sini
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    JPG, PNG atau GIF (Maks. 5MB)
                  </p>
                </div>
              </div>

              <div className="pt-8 border-t border-gray-100 dark:border-gray-800/80 flex justify-end gap-4">
                <Link
                  href="/"
                  className="px-6 py-2.5 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-transparent dark:border-gray-700"
                >
                  Batal
                </Link>
                <button
                  type="button"
                  className="px-6 py-2.5 rounded-lg text-sm font-semibold text-blue-900 bg-blue-100 dark:text-blue-900 dark:bg-blue-200 hover:bg-blue-200 dark:hover:bg-blue-300 transition-colors shadow-sm flex items-center gap-2"
                >
                  <Send size={16} /> Kirim Laporan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* FORM 2: LAPOR TEMUAN */}
      {/* ===================================================================== */}
      {reportType === "temuan" && (
        <div className="bg-surface dark:bg-[#151c2c] border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg overflow-hidden p-8 md:p-10">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Lapor Temuan Barang
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              Bantu kembalikan barang hilang kepada pemiliknya. Isi detail
              barang yang Anda temukan seakurat mungkin untuk memudahkan proses
              pencocokan.
            </p>
          </div>

          <form className="space-y-8 bg-gray-50/50 dark:bg-[#1a2336] p-6 md:p-8 rounded-2xl border border-gray-100 dark:border-gray-700/50">
            {/* Section 1: Informasi Dasar */}
            <div>
              <div className="flex items-center gap-2 text-primary dark:text-blue-400 mb-4">
                <Info size={18} />
                <h3 className="font-semibold text-sm">Informasi Dasar</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Nama Barang <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full bg-white dark:bg-[#0b1120] border border-gray-300 dark:border-gray-700/60 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600"
                    placeholder="Contoh: Dompet Hitam Kulit"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Kategori <span className="text-danger">*</span>
                  </label>
                  <select className="w-full bg-white dark:bg-[#0b1120] border border-gray-300 dark:border-gray-700/60 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all text-gray-900 dark:text-gray-200 appearance-none">
                    <option>Pilih Kategori</option>
                    <option>Elektronik</option>
                    <option>Dokumen</option>
                    <option>Lainnya</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 2: Waktu & Lokasi */}
            <div>
              <div className="flex items-center gap-2 text-primary dark:text-blue-400 mb-4">
                <MapPin size={18} />
                <h3 className="font-semibold text-sm">
                  Waktu & Lokasi Penemuan
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Tanggal & Waktu Ditemukan{" "}
                    <span className="text-danger">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full bg-white dark:bg-[#0b1120] border border-gray-300 dark:border-gray-700/60 rounded-lg pl-4 pr-10 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600"
                      placeholder="mm/dd/yyyy, --:-- --"
                    />
                    <Calendar
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Lokasi (Gedung/Ruangan){" "}
                    <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full bg-white dark:bg-[#0b1120] border border-gray-300 dark:border-gray-700/60 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600"
                    placeholder="Contoh: Gedung A, Lantai 2, R. A201"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Detail Tambahan */}
            <div>
              <div className="flex items-center gap-2 text-primary dark:text-blue-400 mb-4">
                <FileText size={18} />
                <h3 className="font-semibold text-sm">Detail Tambahan</h3>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Deskripsi Tambahan
                  </label>
                  <textarea
                    rows={4}
                    className="w-full bg-white dark:bg-[#0b1120] border border-gray-300 dark:border-gray-700/60 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all text-gray-900 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-600 resize-none"
                    placeholder="Sebutkan ciri-ciri khusus barang (warna, merek, kondisi, isi jika berupa tas/dompet)..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Unggah Foto Barang <span className="text-danger">*</span>
                  </label>
                  <div className="mt-1 flex flex-col justify-center items-center px-6 py-10 border-2 border-gray-300 dark:border-gray-700/80 border-dashed rounded-xl bg-white dark:bg-[#0b1120]/50 hover:bg-gray-50 dark:hover:bg-[#0b1120] transition-colors cursor-pointer group">
                    <UploadCloud className="h-8 w-8 text-gray-400 dark:text-gray-500 mb-3 group-hover:scale-110 transition-transform group-hover:text-primary dark:group-hover:text-blue-400" />
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tarik & Lepas foto ke sini, atau{" "}
                      <span className="text-primary dark:text-blue-400 underline">
                        Jelajahi File
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 font-mono">
                      Format: JPG, PNG (Maks. 5MB)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 flex justify-end gap-4">
              <Link
                href="/"
                className="px-6 py-2.5 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors border border-transparent dark:border-gray-700"
              >
                Batal
              </Link>
              <button
                type="button"
                className="px-8 py-2.5 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20 flex items-center gap-2"
              >
                Kirim Laporan <Send size={14} className="ml-1" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// WAJIB: Bungkus dengan Suspense (Syarat Next.js untuk penggunaan useSearchParams)
export default function ReportPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-20 text-center text-gray-500 font-medium">
          Memuat formulir...
        </div>
      }
    >
      <ReportFormContent />
    </Suspense>
  );
}
