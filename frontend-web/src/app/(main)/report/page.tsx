"use client";

import { Suspense, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  UploadCloud,
  MapPin,
  Calendar,
  X,
  Info,
  FileText,
  Send,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import api from "@/lib/axios";
import axios from "axios";
import { useEffect } from "react";

function ReportFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabQuery = searchParams.get("tab");
  const reportType = tabQuery === "temuan" ? "temuan" : "kehilangan";

  // --- GLOBAL STATE UNTUK FORM ---
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    category_id: "",
    date: "",
    location: "",
    description: "",
  });

  // STATE BARU UNTUK KATEGORI DINAMIS
  interface Category {
    id: string;
    name: string;
  }

  const [categories, setCategories] = useState<Category[]>([]);

  // State untuk Ciri-ciri Khusus (Tag Input)
  const [features, setFeatures] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState("");

  // State untuk Gambar
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // --- HANDLER INPUT ---
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- HANDLER CIRI-CIRI KHUSUS (TAGS) ---
  const handleAddFeature = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && featureInput.trim() !== "") {
      e.preventDefault();
      if (!features.includes(featureInput.trim())) {
        setFeatures([...features, featureInput.trim()]);
      }
      setFeatureInput("");
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/api/v1/categories");
        setCategories(response.data);
      } catch (error) {
        console.error("Gagal memuat kategori:", error);
      }
    };
    fetchCategories();
  }, []);

  const removeFeature = (tagToRemove: string) => {
    setFeatures(features.filter((tag) => tag !== tagToRemove));
  };

  // --- HANDLER GAMBAR ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg("Ukuran gambar maksimal 5MB");
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setErrorMsg("");
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // --- SUBMIT HANDLER KESELURUHAN ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Validasi Sederhana
    if (
      !formData.title ||
      !formData.category_id ||
      !formData.date ||
      !formData.location
    ) {
      setErrorMsg("Mohon lengkapi semua field yang wajib diisi (*).");
      return;
    }

    setIsLoading(true);

    try {
      // Gabungkan deskripsi dengan ciri-ciri khusus
      const finalDescription =
        features.length > 0
          ? `${formData.description}\n\nCiri-ciri khusus: ${features.join(", ")}`
          : formData.description;

      // Kita WAJIB pakai FormData karena ada pengiriman File Gambar
      const submitData = new FormData();

      // Mapping ke bahasa Inggris agar lolos validasi "in:lost,found"
      const backendType = reportType === "kehilangan" ? "lost" : "found";
      submitData.append("type", backendType);

      submitData.append("title", formData.title);
      submitData.append("category_id", formData.category_id);
      submitData.append("date", formData.date);
      submitData.append("location", formData.location);
      submitData.append("description", finalDescription);

      if (image) {
        submitData.append("image", image);
      }

      // 🔑 WAJIB: minta CSRF cookie dulu sebelum request stateful
      await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/sanctum/csrf-cookie`,
        { withCredentials: true },
      );

      // Kembali gunakan `api` agar CSRF Sanctum bekerja otomatis!
      await api.post("/api/v1/items", submitData, {
        headers: {
          // 🔥 TRIK RAHASIA: Set ke undefined agar Axios membuang header JSON bawaannya.
          // Browser akan otomatis menggantinya menjadi multipart/form-data beserta boundary-nya!
          "Content-Type": undefined,
        },
      });

      // Jika sukses, lempar user kembali ke Dasbor
      router.push("/");
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ??
          "Terjadi kesalahan saat mengirim laporan.")
        : "Terjadi kesalahan tidak terduga.";
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

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

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg text-sm font-medium text-center">
          {errorMsg}
        </div>
      )}

      {/* ===================================================================== */}
      {/* FORM 1: LAPOR KEHILANGAN */}
      {/* ===================================================================== */}
      {reportType === "kehilangan" && (
        <div className="bg-surface dark:bg-[#151c2c] border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-orange-400 opacity-80"></div>

          <div className="p-8 md:p-10">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Lapor Kehilangan
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-10">
              Mohon isi detail barang yang hilang seakurat mungkin untuk
              mempermudah proses pencarian.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nama Barang *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full bg-white dark:bg-[#0b1120] border border-gray-300 dark:border-gray-700/60 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all text-gray-900 dark:text-gray-200"
                    placeholder="Misal: Dompet Kulit Hitam"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Kategori *
                  </label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    className="w-full bg-white dark:bg-[#0b1120] border border-gray-300 dark:border-gray-700/60 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all text-gray-900 dark:text-gray-200 appearance-none"
                  >
                    <option value="">Pilih Kategori</option>

                    {/* Render opsi kategori secara dinamis dari database */}
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tanggal Kehilangan *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full bg-white dark:bg-[#0b1120] border border-gray-300 dark:border-gray-700/60 rounded-lg pl-4 pr-10 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all text-gray-900 dark:text-gray-200"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Lokasi Terakhir Terlihat *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full bg-white dark:bg-[#0b1120] border border-gray-300 dark:border-gray-700/60 rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all text-gray-900 dark:text-gray-200"
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
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full bg-white dark:bg-[#0b1120] border border-gray-300 dark:border-gray-700/60 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all text-gray-900 dark:text-gray-200 resize-none"
                  placeholder="Jelaskan secara detail mengenai barang yang hilang..."
                ></textarea>
              </div>

              {/* Fitur Ciri Khusus Dinamis */}
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
                  {features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="bg-primary/10 dark:bg-blue-900/40 border border-primary/20 dark:border-blue-700/50 text-primary dark:text-blue-300 text-xs font-medium px-2.5 py-1.5 rounded-md flex items-center gap-1.5"
                    >
                      {feature}
                      <X
                        size={12}
                        className="cursor-pointer hover:text-red-400"
                        onClick={() => removeFeature(feature)}
                      />
                    </span>
                  ))}
                  <input
                    type="text"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={handleAddFeature}
                    className="flex-grow bg-transparent border-none outline-none text-sm text-gray-900 dark:text-gray-200 placeholder-gray-400 min-w-[150px]"
                    placeholder="Tambah ciri khusus..."
                  />
                </div>
              </div>

              {/* Fitur Unggah Gambar Fungsional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Unggah Foto (Opsional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                />

                {!imagePreview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-1 flex flex-col justify-center items-center px-6 pt-8 pb-10 border-2 border-gray-300 dark:border-gray-700/80 border-dashed rounded-xl bg-gray-50 dark:bg-[#0b1120]/50 hover:bg-gray-100 dark:hover:bg-[#0b1120] transition-colors cursor-pointer group"
                  >
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                      <UploadCloud className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Klik untuk mengunggah gambar
                    </p>
                    <p className="text-xs text-gray-500">
                      JPG, PNG atau WEBP (Maks. 5MB)
                    </p>
                  </div>
                ) : (
                  <div className="relative mt-1 border border-gray-300 dark:border-gray-700 rounded-xl p-2 bg-gray-50 dark:bg-[#0b1120] flex items-center gap-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-grow">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                        {image?.name}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-8 border-t border-gray-100 dark:border-gray-800/80 flex justify-end gap-4">
                <Link
                  href="/"
                  className="px-6 py-2.5 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-transparent dark:border-gray-700"
                >
                  Batal
                </Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2.5 rounded-lg text-sm font-semibold text-blue-900 bg-blue-100 dark:text-blue-900 dark:bg-blue-200 hover:bg-blue-200 dark:hover:bg-blue-300 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                  {isLoading ? "Memproses..." : "Kirim Laporan"}
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
              barang yang Anda temukan seakurat mungkin.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-8 bg-gray-50/50 dark:bg-[#1a2336] p-6 md:p-8 rounded-2xl border border-gray-100 dark:border-gray-700/50"
          >
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
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full bg-white dark:bg-[#0b1120] border border-gray-300 dark:border-gray-700/60 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none text-gray-900 dark:text-gray-200"
                    placeholder="Contoh: Dompet Hitam Kulit"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Kategori <span className="text-danger">*</span>
                  </label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    className="w-full bg-white dark:bg-[#0b1120] border border-gray-300 dark:border-gray-700/60 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all text-gray-900 dark:text-gray-200 appearance-none"
                  >
                    <option value="">Pilih Kategori</option>

                    {/* Render opsi kategori secara dinamis dari database */}
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

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
                    Tanggal Ditemukan <span className="text-danger">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full bg-white dark:bg-[#0b1120] border border-gray-300 dark:border-gray-700/60 rounded-lg pl-4 pr-10 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none text-gray-900 dark:text-gray-200"
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
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full bg-white dark:bg-[#0b1120] border border-gray-300 dark:border-gray-700/60 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none text-gray-900 dark:text-gray-200"
                    placeholder="Contoh: Gedung A, Lantai 2, R. A201"
                  />
                </div>
              </div>
            </div>

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
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full bg-white dark:bg-[#0b1120] border border-gray-300 dark:border-gray-700/60 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none text-gray-900 dark:text-gray-200 resize-none"
                    placeholder="Sebutkan ciri-ciri khusus barang..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Unggah Foto Barang{" "}
                    <span className="text-gray-400">(Opsional)</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                  />

                  {!imagePreview ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-1 flex flex-col justify-center items-center px-6 py-10 border-2 border-gray-300 dark:border-gray-700/80 border-dashed rounded-xl bg-white dark:bg-[#0b1120]/50 hover:bg-gray-50 dark:hover:bg-[#0b1120] transition-colors cursor-pointer group"
                    >
                      <ImageIcon className="h-8 w-8 text-gray-400 dark:text-gray-500 mb-3 group-hover:scale-110 transition-transform group-hover:text-primary dark:group-hover:text-blue-400" />
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Klik untuk memilih file gambar
                      </p>
                      <p className="text-xs text-gray-500 font-mono">
                        Format: JPG, PNG (Maks. 5MB)
                      </p>
                    </div>
                  ) : (
                    <div className="relative mt-1 border border-gray-300 dark:border-gray-700 rounded-xl p-2 bg-white dark:bg-[#0b1120] flex items-center gap-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-grow">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                          {image?.name}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  )}
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
                type="submit"
                disabled={isLoading}
                className="px-8 py-2.5 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20 flex items-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : null}
                {isLoading ? "Mengirim..." : "Kirim Laporan"}{" "}
                {!isLoading && <Send size={14} className="ml-1" />}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-20 text-center text-gray-500 font-medium flex justify-center items-center gap-2">
          <Loader2 className="animate-spin" size={20} /> Memuat formulir...
        </div>
      }
    >
      <ReportFormContent />
    </Suspense>
  );
}
