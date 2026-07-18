import { UploadCloud, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ReportPage() {
  return (
    <div className="container mx-auto px-4 lg:px-8 py-10 max-w-3xl">
      <Link
        href="/"
        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-primary dark:hover:text-blue-400 mb-6 transition-colors"
      >
        <ArrowLeft size={16} className="mr-2" /> Kembali ke Dasbor
      </Link>

      <div className="bg-surface dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        {/* Header Form */}
        <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Formulir Lapor Barang
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Silakan isi detail barang yang hilang atau Anda temukan. Informasi
            yang akurat akan sangat mempercepat proses pencocokan sistem.
          </p>
        </div>

        {/* Body Form */}
        <form className="p-6 md:p-8 space-y-6">
          {/* Tipe Laporan (Radio Cards) */}
          <div>
            <label className="block text-sm font-bold text-gray-900 dark:text-gray-200 mb-3">
              Tipe Laporan
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="cursor-pointer">
                <input
                  type="radio"
                  name="report_type"
                  className="peer sr-only"
                  defaultChecked
                />
                <div className="text-center px-4 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 peer-checked:border-danger peer-checked:bg-red-50 dark:peer-checked:bg-red-900/20 peer-checked:text-danger dark:peer-checked:text-red-400 font-medium transition-all shadow-sm">
                  Kehilangan Barang
                </div>
              </label>
              <label className="cursor-pointer">
                <input
                  type="radio"
                  name="report_type"
                  className="peer sr-only"
                />
                <div className="text-center px-4 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 peer-checked:border-success peer-checked:bg-green-50 dark:peer-checked:bg-green-900/20 peer-checked:text-success dark:peer-checked:text-green-400 font-medium transition-all shadow-sm">
                  Menemukan Barang
                </div>
              </label>
            </div>
          </div>

          {/* Area Unggah Gambar */}
          <div>
            <label className="block text-sm font-bold text-gray-900 dark:text-gray-200 mb-2">
              Foto Barang
            </label>
            <div className="mt-1 flex justify-center px-6 pt-6 pb-8 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-xl bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors cursor-pointer group">
              <div className="space-y-2 text-center">
                <UploadCloud className="mx-auto h-12 w-12 text-gray-400 group-hover:text-primary transition-colors" />
                <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                  <span className="relative rounded-md font-bold text-primary dark:text-blue-400 hover:underline focus-within:outline-none">
                    Unggah file
                  </span>
                  <p className="pl-1">
                    atau tarik lepas (drag and drop) di sini
                  </p>
                </div>
                <p className="text-xs text-gray-500">
                  Mendukung PNG, JPG, JPEG hingga 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Input Text Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-900 dark:text-gray-200 mb-2">
                Nama Barang <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all text-gray-900 dark:text-white"
                placeholder="Contoh: Kunci Mobil Honda, Dompet Kulit Hitam..."
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-gray-200 mb-2">
                Kategori
              </label>
              <select className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all text-gray-900 dark:text-white appearance-none cursor-pointer">
                <option>Pilih Kategori...</option>
                <option>Elektronik & Gadget</option>
                <option>Dokumen & Kartu Identitas</option>
                <option>Kunci Kendaraan</option>
                <option>Pakaian & Tas</option>
                <option>Lainnya</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-gray-200 mb-2">
                Lokasi Terakhir <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all text-gray-900 dark:text-white"
                placeholder="Contoh: Perpustakaan Lantai 2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 dark:text-gray-200 mb-2">
              Deskripsi Tambahan
            </label>
            <textarea
              rows={4}
              className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all text-gray-900 dark:text-white resize-none"
              placeholder="Sebutkan ciri-ciri khusus (ada goresan, warna gantungan kunci, isi dompet, dll)..."
            ></textarea>
          </div>

          {/* Kotak Informasi Tambahan */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex gap-3">
            <AlertCircle
              className="text-primary dark:text-blue-400 flex-shrink-0 mt-0.5"
              size={18}
            />
            <p className="text-xs md:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              Pastikan seluruh informasi sudah benar. Jika Anda melaporkan{" "}
              <span className="font-bold">temuan barang</span>, silakan serahkan
              barang fisik ke Pos Satpam terdekat dengan menunjukkan ID Laporan
              setelah Anda mengirim formulir ini.
            </p>
          </div>

          {/* Tombol Aksi */}
          <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
            <Link
              href="/"
              className="px-6 py-2.5 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Batal
            </Link>
            <button
              type="button"
              className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-primary hover:bg-blue-800 transition-colors shadow-md"
            >
              Kirim Laporan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
