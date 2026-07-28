"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Loader2, PackageX, RotateCcw, X } from "lucide-react";
import ItemCard from "@/components/ui/ItemCard";
import api from "@/lib/axios";

interface Category {
  id: string;
  name: string;
}

interface ApiItem {
  id: string;
  type: "lost" | "found";
  title: string;
  category: string;
  category_id: string;
  description: string;
  location: string;
  date: string;
  image_path?: string;
  status: string;
  is_urgent: boolean;
  created_at: string;
  time?: string;
}

export default function ItemsPage() {
  // State Filter & Pencarian
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | "lost" | "found">("all");

  // State Data Dinamis & UI
  const [items, setItems] = useState<ApiItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [visibleCount, setVisibleCount] = useState(8);

  // Ambil Daftar Kategori dari API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/api/v1/categories");
        setCategories(response.data);
      } catch (err) {
        console.error("Gagal mengambil kategori:", err);
      }
    };
    fetchCategories();
  }, []);

  // Ambil Data Barang Dinamis Berdasarkan Filter
  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg("");

    try {
      const params: Record<string, string> = {};

      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedCategory) params.category_id = selectedCategory;
      if (selectedStatus) params.status = selectedStatus;
      if (selectedType !== "all") params.type = selectedType;

      const response = await api.get("/api/v1/items", { params });
      setItems(response.data?.data || []);
    } catch (err) {
      console.error("Gagal mengambil data barang:", err);
      setErrorMsg("Gagal memuat daftar barang. Pastikan Anda telah login.");
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedStatus, selectedType]);

  useEffect(() => {
    // Debounce pencarian agar tidak terlalu sering memanggil backend API
    const handler = setTimeout(() => {
      fetchItems();
    }, 300);

    return () => clearTimeout(handler);
  }, [fetchItems]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedStatus("");
    setSelectedType("all");
  };

  // Helper Pemetaan Status untuk Tampilan Badge di ItemCard
  const getDisplayStatus = (status: string, type: string) => {
    if (status === "completed") return "Selesai";
    if (status === "is_pending") return "Menunggu Validasi";
    if (type === "lost") return "Hilang";
    if (type === "found") return "Ditemukan";
    return status;
  };

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedCategory !== "" ||
    selectedStatus !== "" ||
    selectedType !== "all";

  return (
    <div className="container mx-auto px-4 lg:px-8 py-10 max-w-7xl">
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Eksplorasi Barang
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Cari dan temukan barang yang dilaporkan di lingkungan kampus.
          </p>
        </div>
      </div>

      {/* Tab Filter Tipe (Semua / Kehilangan / Temuan) */}
      <div className="flex items-center gap-2 mb-6 border-b border-gray-200 dark:border-gray-800 pb-4 overflow-x-auto">
        <button
          onClick={() => setSelectedType("all")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            selectedType === "all"
              ? "bg-primary text-white shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          Semua Laporan
        </button>
        <button
          onClick={() => setSelectedType("lost")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            selectedType === "lost"
              ? "bg-red-600 text-white shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          Barang Hilang
        </button>
        <button
          onClick={() => setSelectedType("found")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            selectedType === "found"
              ? "bg-teal-600 text-white shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          Barang Ditemukan
        </button>
      </div>

      {/* Baris Pencarian & Filter Dropdown */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {/* Input Pencarian */}
        <div className="flex-grow relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama barang, lokasi, atau deskripsi..."
            className="w-full bg-surface dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-xl pl-12 pr-10 py-3.5 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all text-gray-900 dark:text-white shadow-sm"
          />
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Dropdown Filter Kategori & Status */}
        <div className="flex flex-wrap sm:flex-nowrap gap-3">
          {/* Select Kategori */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-surface dark:bg-surface-dark border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 px-4 py-3.5 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/50 outline-none transition-colors shadow-sm cursor-pointer"
          >
            <option value="">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Select Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-surface dark:bg-surface-dark border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 px-4 py-3.5 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/50 outline-none transition-colors shadow-sm cursor-pointer"
          >
            <option value="">Semua Status</option>
            <option value="active">Aktif / Belum Selesai</option>
            <option value="is_pending">Dalam Proses Klaim</option>
            <option value="completed">Selesai / Dikembalikan</option>
          </select>

          {/* Tombol Reset Filter */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-3.5 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shadow-sm whitespace-nowrap"
            >
              <RotateCcw size={16} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Pesan Error */}
      {errorMsg && (
        <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl text-sm text-center font-medium">
          {errorMsg}
        </div>
      )}

      {/* Indikator Loading */}
      {isLoading ? (
        <div className="py-20 flex flex-col justify-center items-center gap-3 text-gray-500">
          <Loader2 className="animate-spin text-primary" size={36} />
          <p className="text-sm font-medium">Memuat data barang...</p>
        </div>
      ) : items.length === 0 ? (
        /* Empty State */
        <div className="py-16 px-4 bg-surface dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-2xl text-center max-w-md mx-auto my-8">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <PackageX size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Tidak Ada Barang Ditemukan
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Tidak ada laporan barang yang sesuai dengan kata kunci atau filter yang Anda pilih.
          </p>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-blue-800 transition"
            >
              <RotateCcw size={16} />
              Reset Semua Filter
            </button>
          )}
        </div>
      ) : (
        /* Grid Katalog Barang Dinamis */
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.slice(0, visibleCount).map((item) => (
              <ItemCard
                key={item.id}
                id={item.id}
                title={item.title}
                location={item.location}
                time={item.time || item.date}
                description={item.description}
                status={getDisplayStatus(item.status, item.type)}
                imageUrl={
                  item.image_path ||
                  "https://via.placeholder.com/400?text=Tidak+Ada+Gambar"
                }
                isUrgent={item.is_urgent}
              />
            ))}
          </div>

          {/* Tombol Muat Lebih Banyak */}
          {visibleCount < items.length && (
            <div className="mt-12 flex justify-center">
              <button
                onClick={() => setVisibleCount((prev) => prev + 8)}
                className="px-8 py-3 rounded-xl text-sm font-semibold text-primary dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors border border-blue-100 dark:border-blue-800/50 shadow-sm"
              >
                Muat Lebih Banyak ({items.length - visibleCount} barang tersisa)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
