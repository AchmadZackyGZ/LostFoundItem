"use client";

import { useEffect, useState } from "react";
import { Search, PlusCircle, Loader2 } from "lucide-react";
import ItemCard from "@/components/ui/ItemCard";
import Link from "next/link";
import api from "@/lib/axios";

// Definisi Tipe Data (TypeScript)
interface DashboardStats {
  reported: number;
  found: number;
  returned: number;
}

interface Item {
  id: string | number;
  title: string;
  location: string;
  time: string; // atau created_at yang nanti diformat
  description?: string;
  status: "Hilang" | "Menunggu Validasi" | "Selesai";
  isUrgent?: boolean;
  imageUrl: string;
}

export default function Home() {
  // State untuk menyimpan data dari API
  const [stats, setStats] = useState<DashboardStats>({
    reported: 0,
    found: 0,
    returned: 0,
  });
  const [recentItems, setRecentItems] = useState<Item[]>([]);

  // State untuk status loading
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Fungsi untuk mengambil data dinamis dari Backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Asumsi nama endpoint API yang akan kita buat di Laravel nanti
        const [statsResponse, itemsResponse] = await Promise.all([
          api.get("/api/v1/dashboard/stats"),
          api.get("/api/v1/items/recent"),
        ]);

        setStats(statsResponse.data);
        setRecentItems(itemsResponse.data);
      } catch (error) {
        console.error("Gagal mengambil data dasbor:", error);
        setErrorMsg("Gagal memuat data terbaru. Silakan muat ulang halaman.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="container mx-auto px-4 lg:px-8 py-12">
      {/* Hero Section (Center) */}
      <section className="text-center max-w-3xl mx-auto mb-16 mt-8">
        <h1 className="text-4xl font-bold text-primary dark:text-blue-400 mb-6 tracking-tight">
          Temukan Barangmu yang Hilang
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
          Sistem informasi Lost & Found cerdas untuk lingkungan kampus. Laporkan
          barang hilang atau temuan Anda dengan cepat dan mudah.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            href="/report?tab=kehilangan"
            className="bg-primary text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-blue-800 transition shadow-sm"
          >
            <Search size={20} />
            Lapor Kehilangan
          </Link>
          <Link
            href="/report?tab=temuan"
            className="bg-surface dark:bg-surface-dark text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition shadow-sm"
          >
            <PlusCircle size={20} />
            Lapor Temuan
          </Link>
        </div>
      </section>

      {/* Konten Utama */}
      <div className="space-y-6">
        {errorMsg && (
          <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm text-center">
            {errorMsg}
          </div>
        )}

        {/* ROW 1: Card Horizontal & Status Sistem */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="h-full min-h-[200px] flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : recentItems.length > 0 ? (
              // Menampilkan item pertama yang paling baru (dan urgent jika ada)
              <ItemCard
                variant="horizontal"
                title={recentItems[0].title}
                location={recentItems[0].location}
                time={recentItems[0].time}
                description={recentItems[0].description}
                status={recentItems[0].status}
                isUrgent={recentItems[0].isUrgent}
                imageUrl={recentItems[0].imageUrl}
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-500">
                Belum ada laporan barang terbaru.
              </div>
            )}
          </div>

          {/* Status Sistem - Dynamic Data */}
          <div className="bg-primary dark:bg-[#15234b] text-white rounded-xl p-6 h-full flex flex-col shadow-md border border-blue-800/30">
            <h3 className="font-semibold text-lg mb-6 text-blue-50">
              Status Sistem Hari Ini
            </h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-blue-700/50 pb-3">
                <span className="text-blue-100/80 text-sm">
                  Barang Dilaporkan
                </span>
                <span className="font-bold text-2xl">
                  {isLoading ? "..." : stats.reported}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-blue-700/50 pb-3">
                <span className="text-blue-100/80 text-sm">
                  Barang Ditemukan
                </span>
                <span className="font-bold text-2xl">
                  {isLoading ? "..." : stats.found}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-100/80 text-sm">
                  Selesai Dikembalikan
                </span>
                <span className="font-bold text-2xl">
                  {isLoading ? "..." : stats.returned}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 2: Grid 3 Kolom Vertical */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isLoading
            ? // Skeleton Loading sederhana
              [1, 2, 3].map((skeleton) => (
                <div
                  key={skeleton}
                  className="h-[300px] bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl"
                ></div>
              ))
            : recentItems.length > 1
              ? // Mapping sisa item (mulai dari index 1 karena index 0 sudah dipakai di atas)
                recentItems
                  .slice(1, 4)
                  .map((item) => (
                    <ItemCard
                      key={item.id}
                      title={item.title}
                      location={item.location}
                      time={item.time}
                      status={item.status}
                      imageUrl={item.imageUrl}
                    />
                  ))
              : null}
        </div>

        {/* Tombol Lihat Semua */}
        <div className="pt-8 flex justify-center pb-12">
          <button className="px-6 py-2.5 rounded-md text-sm font-medium border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
            Lihat Semua Laporan
          </button>
        </div>
      </div>
    </div>
  );
}
