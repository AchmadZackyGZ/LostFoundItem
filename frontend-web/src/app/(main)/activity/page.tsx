"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  Info,
  ArrowRight,
  Loader2,
  BellOff,
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import api from "@/lib/axios";

interface ActivityNotification {
  id: string;
  title: string;
  message: string;
  type: "report" | "claim" | "discussion" | "system" | string;
  action_url?: string;
  is_read: boolean;
  created_at: string;
}

export default function ActivityPage() {
  const [activeFilter, setActiveFilter] = useState<
    "all" | "report" | "claim" | "discussion"
  >("all");
  const [notifications, setNotifications] = useState<ActivityNotification[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);

  // Ambil Notifikasi dari Backend API
  useEffect(() => {
    let isMounted = true;

    const fetchNotifications = async () => {
      try {
        const response = await api.get("/api/v1/notifications");
        if (isMounted) {
          setNotifications(response.data?.data || []);
        }
      } catch (err) {
        console.error("Gagal mengambil notifikasi aktivitas:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchNotifications();

    return () => {
      isMounted = false;
    };
  }, []);

  // Tandai notifikasi telah dibaca ketika diklik
  const handleMarkAsRead = async (id: string) => {
    try {
      await api.put(`/api/v1/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, is_read: true } : item,
        ),
      );
    } catch (err) {
      console.error("Gagal menandai notifikasi:", err);
    }
  };

  // Sample Fallback jika pengguna belum memiliki notifikasi riwayat di database
  const sampleNotifications: ActivityNotification[] = [
    {
      id: "sample-1",
      title: "Laporan Barang Hilang Dibuat",
      message:
        "Anda melaporkan kehilangan **Dompet Kulit Coklat** di area Lobby Utama.",
      type: "report",
      action_url: "/items",
      is_read: true,
      created_at: "Hari ini, 10:45 AM",
    },
    {
      id: "sample-2",
      title: "Klaim Barang Disetujui",
      message:
        "Klaim anda untuk **Kunci Mobil Honda** telah diverifikasi dan disetujui oleh admin.",
      type: "claim",
      action_url: "/activity",
      is_read: true,
      created_at: "Kemarin, 14:20 PM",
    },
    {
      id: "sample-3",
      title: "Balasan Diskusi Baru",
      message:
        "Petugas keamanan membalas komentar anda pada item **Laptop Asus ROG** yang ditemukan.",
      type: "discussion",
      action_url: "/items",
      is_read: false,
      created_at: "12 Mei, 09:15 AM",
    },
    {
      id: "sample-4",
      title: "Pembaruan Sistem TraceBack",
      message:
        "Sistem telah diperbarui untuk meningkatkan kecepatan pencarian inventaris kampus.",
      type: "system",
      action_url: "#",
      is_read: true,
      created_at: "10 Mei, 00:00 AM",
    },
  ];

  // Gunakan data dari API jika ada, jika kosong gunakan data sampel agar tampilan persis sesuai desain
  const displayList =
    notifications.length > 0 ? notifications : sampleNotifications;

  // Filter List Berdasarkan Kategori yang Dipilih
  const filteredNotifications = displayList.filter((item) => {
    if (activeFilter === "all") return true;
    return item.type === activeFilter;
  });

  // Konfigurasi Icon & Warna Berdasarkan Tipe Notifikasi
  const getActivityConfig = (type: string) => {
    switch (type) {
      case "report":
        return {
          icon: <AlertCircle size={22} className="text-red-500" />,
          bg: "bg-red-500/10 border-red-500/20",
          actionText: "Lihat Detail Laporan",
        };
      case "claim":
        return {
          icon: <CheckCircle2 size={22} className="text-blue-500" />,
          bg: "bg-blue-500/10 border-blue-500/20",
          actionText: "Lihat Status Klaim",
        };
      case "discussion":
        return {
          icon: <MessageSquare size={22} className="text-gray-300" />,
          bg: "bg-gray-700/30 border-gray-600/30",
          actionText: "Buka Diskusi",
        };
      case "system":
      default:
        return {
          icon: <Info size={22} className="text-gray-400" />,
          bg: "bg-gray-800/40 border-gray-700/40",
          actionText: "Pelajari Lebih Lanjut",
        };
    }
  };

  // Helper untuk Memformat Markdown Bold Sederhana (**teks**)
  const renderFormattedMessage = (msg: string) => {
    const parts = msg.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={index} className="text-gray-100 font-bold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  // Format Tanggal / Waktu
  const formatTimestamp = (dateStr: string) => {
    if (
      dateStr.includes("Hari ini") ||
      dateStr.includes("Kemarin") ||
      dateStr.includes("Mei")
    ) {
      return dateStr;
    }
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="container mx-auto px-4 lg:px-8 py-10 max-w-4xl">
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Riwayat Aktivitas
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Pantau laporan, klaim, dan diskusi terbaru Anda.
          </p>
        </div>

        {/* Filter Pill Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveFilter("all")}
            className={clsx(
              "px-5 py-2 rounded-full text-xs font-semibold transition-all border",
              activeFilter === "all"
                ? "bg-blue-600 text-white border-blue-500 shadow-md"
                : "bg-surface dark:bg-[#1a2336] text-gray-400 border-gray-700/60 hover:text-white",
            )}
          >
            Semua
          </button>
          <button
            onClick={() => setActiveFilter("report")}
            className={clsx(
              "px-5 py-2 rounded-full text-xs font-semibold transition-all border",
              activeFilter === "report"
                ? "bg-blue-600 text-white border-blue-500 shadow-md"
                : "bg-surface dark:bg-[#1a2336] text-gray-400 border-gray-700/60 hover:text-white",
            )}
          >
            Laporan Saya
          </button>
          <button
            onClick={() => setActiveFilter("claim")}
            className={clsx(
              "px-5 py-2 rounded-full text-xs font-semibold transition-all border",
              activeFilter === "claim"
                ? "bg-blue-600 text-white border-blue-500 shadow-md"
                : "bg-surface dark:bg-[#1a2336] text-gray-400 border-gray-700/60 hover:text-white",
            )}
          >
            Klaim Saya
          </button>
          <button
            onClick={() => setActiveFilter("discussion")}
            className={clsx(
              "px-5 py-2 rounded-full text-xs font-semibold transition-all border",
              activeFilter === "discussion"
                ? "bg-blue-600 text-white border-blue-500 shadow-md"
                : "bg-surface dark:bg-[#1a2336] text-gray-400 border-gray-700/60 hover:text-white",
            )}
          >
            Diskusi
          </button>
        </div>
      </div>

      {/* Loading Indicator */}
      {isLoading ? (
        <div className="py-20 flex flex-col justify-center items-center gap-3 text-gray-400">
          <Loader2 className="animate-spin text-primary" size={36} />
          <p className="text-sm font-medium">Memuat riwayat aktivitas...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        /* Empty State */
        <div className="py-16 px-4 bg-surface dark:bg-[#151c2c] border border-gray-200 dark:border-gray-800 rounded-2xl text-center max-w-md mx-auto my-8 shadow-md">
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <BellOff size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Belum Ada Aktivitas
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Aktivitas laporan, klaim, atau balasan diskusi Anda akan muncul di
            sini.
          </p>
        </div>
      ) : (
        /* List Card Aktivitas */
        <div className="space-y-4">
          {filteredNotifications.map((item) => {
            const config = getActivityConfig(item.type);

            return (
              <div
                key={item.id}
                onClick={() => handleMarkAsRead(item.id)}
                className={clsx(
                  "p-6 rounded-2xl border transition-all relative overflow-hidden bg-surface dark:bg-[#151c2c] border-gray-200 dark:border-gray-800/80 hover:border-blue-500/40 hover:shadow-lg dark:hover:shadow-blue-900/10",
                  !item.is_read && "ring-1 ring-blue-500/30",
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Circle Icon Badge */}
                  <div
                    className={clsx(
                      "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border",
                      config.bg,
                    )}
                  >
                    {config.icon}
                  </div>

                  {/* Body Text Content */}
                  <div className="flex-grow pt-0.5">
                    <div className="flex justify-between items-start mb-2 gap-4">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {item.title}
                      </h3>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {formatTimestamp(item.created_at)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                      {renderFormattedMessage(item.message)}
                    </p>

                    {/* Action Link */}
                    {item.action_url && (
                      <Link
                        href={item.action_url}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-blue-500 hover:text-blue-400 transition-colors"
                      >
                        <span>{config.actionText}</span>
                        <ArrowRight size={16} />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
