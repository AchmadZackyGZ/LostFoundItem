"use client";

import { useEffect, useState } from "react";
import {
  Search,
  PlusCircle,
  Loader2,
  Sparkles,
  ArrowRight,
  Package,
  CheckCircle2,
  HelpCircle,
  MapPin,
  Clock,
  ShieldCheck,
  TrendingUp,
  ChevronDown,
} from "lucide-react";
import ItemCard from "@/components/ui/ItemCard";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

import { useAuthStore } from "@/store/useAuthStore";

interface DashboardStats {
  reported: number;
  found: number;
  returned: number;
}

interface Item {
  id: string;
  title: string;
  category?: string;
  location: string;
  time: string;
  description?: string;
  status: "Hilang" | "Temuan" | "Selesai";
  type?: string;
  isUrgent?: boolean;
  imageUrl: string;
}

export default function Home() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [stats, setStats] = useState<DashboardStats>({
    reported: 0,
    found: 0,
    returned: 0,
  });
  const [recentItems, setRecentItems] = useState<Item[]>([]);
  const [heroSearchQuery, setHeroSearchQuery] = useState("");

  const [itemLimit, setItemLimit] = useState(7); // Default 1 hero + 6 grid cards
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Ambil Data Dinamis dari Backend API (Public Endpoints)
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [statsResponse, itemsResponse] = await Promise.all([
          api.get("/api/v1/dashboard/stats"),
          api.get(`/api/v1/items/recent?limit=${itemLimit}`),
        ]);

        if (statsResponse.data) {
          setStats(statsResponse.data);
        }

        const dataArray = Array.isArray(itemsResponse.data)
          ? itemsResponse.data
          : itemsResponse.data?.data || [];

        setRecentItems(dataArray);
      } catch (error) {
        console.error("Gagal mengambil data dasbor publik:", error);
        setErrorMsg("Gagal memuat data terbaru dari server.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // --- HANDLER MUAT LEBIH BANYAK BARANG PADA DASHBOARD ---
  const handleLoadMoreItems = async () => {
    if (isFetchingMore) return;
    setIsFetchingMore(true);
    const newLimit = itemLimit + 6;

    try {
      const res = await api.get(`/api/v1/items/recent?limit=${newLimit}`);
      const dataArray = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];

      if (dataArray.length <= recentItems.length) {
        setHasMore(false);
      } else {
        setRecentItems(dataArray);
        setItemLimit(newLimit);
      }
    } catch (err) {
      console.error("Gagal memuat lebih banyak laporan barang:", err);
    } finally {
      setIsFetchingMore(false);
    }
  };

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearchQuery.trim()) {
      router.push(
        `/items?search=${encodeURIComponent(heroSearchQuery.trim())}`,
      );
    } else {
      router.push("/items");
    }
  };

  return (
    <div className="container mx-auto px-4 lg:px-8 py-10">
      {/* ================================================================= */}
      {/* ✨ HERO SECTION DENGAN SEARCH BANNER & GLOWING BADGE */}
      {/* ================================================================= */}
      <section className="text-center max-w-4xl mx-auto mb-14 mt-4 relative">
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tight leading-tight">
          Temukan Barangmu yang{" "}
          <span className="text-primary dark:text-blue-400 underline decoration-blue-500/40">
            Hilang
          </span>{" "}
          & Laporkan Temuan
        </h1>

        <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg mb-8 leading-relaxed max-w-2xl mx-auto">
          Sistem informasi cerdas untuk civitas akademika Universitas
          Internasional Semen Indonesia. Laporkan atau klaim barang dengan
          verifikasi presisi GPS & bukti foto.
        </p>

        {/* HERO SEARCH BAR INTERAKTIF */}
        <form
          onSubmit={handleHeroSearchSubmit}
          className="max-w-2xl mx-auto mb-8 relative flex items-center bg-surface dark:bg-surface-dark border border-gray-300 dark:border-gray-700 rounded-2xl p-2 shadow-xl focus-within:ring-2 focus-within:ring-primary dark:focus-within:ring-blue-500 transition-all"
        >
          <Search size={20} className="ml-3 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={heroSearchQuery}
            onChange={(e) => setHeroSearchQuery(e.target.value)}
            placeholder="Cari barang hilang... (contoh: Dompet, Kunci Motor, Laptop ROG)"
            className="w-full px-4 py-2.5 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
          />
          <button
            type="submit"
            className="bg-primary hover:bg-blue-800 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition shadow-md flex items-center gap-1.5 flex-shrink-0"
          >
            Cari <ArrowRight size={16} />
          </button>
        </form>

        {/* QUICK ACTION BUTTONS */}
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => {
              if (user?.role === "admin") {
                alert(
                  "admin tidak bisa membuat laporan barang kehilangan dan laporan menemukan barang",
                );
                router.push("/admin");
              } else {
                router.push("/report?tab=kehilangan");
              }
            }}
            className="bg-primary text-white px-7 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-800 transition shadow-lg shadow-blue-900/20 cursor-pointer"
          >
            <Search size={18} />
            Lapor Kehilangan
          </button>
          <button
            onClick={() => {
              if (user?.role === "admin") {
                alert(
                  "admin tidak bisa membuat laporan barang kehilangan dan laporan menemukan barang",
                );
                router.push("/admin");
              } else {
                router.push("/report?tab=temuan");
              }
            }}
            className="bg-surface dark:bg-surface-dark text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700 px-7 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition shadow-sm cursor-pointer"
          >
            <PlusCircle size={18} />
            Lapor Temuan
          </button>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 📊 MAIN CONTENT GRID */}
      {/* ================================================================= */}
      <div className="space-y-10">
        {errorMsg && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/60 rounded-xl text-sm text-center font-medium">
            {errorMsg}
          </div>
        )}

        {/* ROW 1: Highlight Item Horizontal & Dynamic System Status Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="h-full min-h-[220px] flex items-center justify-center bg-surface dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-gray-800">
                <Loader2 className="w-8 h-8 animate-spin text-primary dark:text-blue-400" />
              </div>
            ) : recentItems.length > 0 ? (
              <ItemCard
                key={recentItems[0].id}
                id={recentItems[0].id}
                variant="horizontal"
                title={recentItems[0].title}
                location={recentItems[0].location}
                time={recentItems[0].time}
                description={recentItems[0].description}
                status={recentItems[0].status}
                isUrgent={recentItems[0].isUrgent}
                isOldest={true}
                imageUrl={recentItems[0].imageUrl}
              />
            ) : (
              <div className="h-full min-h-[220px] flex items-center justify-center bg-surface dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-gray-800 text-gray-500 text-sm font-medium">
                Belum ada laporan barang yang dipublikasikan.
              </div>
            )}
          </div>

          {/* SYSTEM STATUS CARD (DYNAMIC DATABASE DATA) */}
          <div className="bg-primary dark:bg-[#0f172a] text-white rounded-2xl p-6 h-full flex flex-col justify-between shadow-xl border border-blue-800/40 dark:border-gray-800 relative overflow-hidden">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                  <TrendingUp
                    size={20}
                    className="text-blue-300 dark:text-blue-400"
                  />
                  Status Sistem Hari Ini
                </h3>
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              </div>

              <div className="space-y-5">
                <div className="flex justify-between items-center border-b border-blue-700/50 dark:border-gray-800 pb-3">
                  <span className="text-blue-100/90 dark:text-gray-400 text-xs font-semibold flex items-center gap-2">
                    <Package
                      size={16}
                      className="text-blue-300 dark:text-blue-400"
                    />{" "}
                    Barang Dilaporkan
                  </span>
                  <span className="font-extrabold text-2xl tracking-tight">
                    {isLoading ? "..." : stats.reported}
                  </span>
                </div>

                <div className="flex justify-between items-center border-b border-blue-700/50 dark:border-gray-800 pb-3">
                  <span className="text-blue-100/90 dark:text-gray-400 text-xs font-semibold flex items-center gap-2">
                    <HelpCircle
                      size={16}
                      className="text-amber-300 dark:text-amber-400"
                    />{" "}
                    Barang Ditemukan
                  </span>
                  <span className="font-extrabold text-2xl tracking-tight">
                    {isLoading ? "..." : stats.found}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-blue-100/90 dark:text-gray-400 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2
                      size={16}
                      className="text-emerald-300 dark:text-emerald-400"
                    />{" "}
                    Selesai Dikembalikan
                  </span>
                  <span className="font-extrabold text-2xl tracking-tight text-emerald-300 dark:text-emerald-400">
                    {isLoading ? "..." : stats.returned}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-blue-700/40 dark:border-gray-800/80 mt-6">
              <Link
                href="/items"
                className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition"
              >
                Eksplorasi Katalog Barang →
              </Link>
            </div>
          </div>
        </div>

        {/* ROW 2: Grid 3 Kolom Vertical Barang Terbaru */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
              Laporan Terkini Civitas UISI (
              {recentItems.length > 1 ? recentItems.length - 1 : 0} Item Tampil)
            </h2>
            <Link
              href="/items"
              className="text-xs font-bold text-primary dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              Lihat Seluruh Katalog →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {isLoading ? (
              [1, 2, 3, 4, 5, 6].map((skeleton) => (
                <div
                  key={skeleton}
                  className="h-[300px] bg-gray-200 dark:bg-gray-800/60 animate-pulse rounded-2xl"
                ></div>
              ))
            ) : recentItems.length > 1 ? (
              recentItems
                .slice(1)
                .map((item) => (
                  <ItemCard
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    location={item.location}
                    time={item.time}
                    status={item.status}
                    imageUrl={item.imageUrl}
                  />
                ))
            ) : (
              <div className="col-span-3 text-center py-10 text-gray-400 text-sm">
                Belum ada laporan tambahan lainnya.
              </div>
            )}
          </div>
        </div>

        {/* ================================================================= */}
        {/* 📦 TOMBOL INTERAKTIF: MUAT LEBIH BANYAK LAPORAN BARANG */}
        {/* ================================================================= */}
        <div className="pt-8 flex justify-center pb-12">
          {hasMore ? (
            <button
              onClick={handleLoadMoreItems}
              disabled={isFetchingMore}
              className="px-8 py-3.5 rounded-xl text-sm font-bold bg-primary text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 transition-all duration-200 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 flex items-center gap-2.5 disabled:opacity-50 cursor-pointer"
            >
              {isFetchingMore ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Package size={18} />
              )}
              {isFetchingMore
                ? "Memuat Lebih Banyak Laporan..."
                : "Muat Lebih Banyak Laporan Barang"}
              <ChevronDown size={16} />
            </button>
          ) : (
            <div className="text-center text-xs font-semibold text-gray-400 bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/60 px-6 py-2.5 rounded-full">
              Seluruh Laporan Barang di Dasbor Telah Ditampilkan ✨
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
