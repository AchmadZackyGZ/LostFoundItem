"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  ClipboardList,
  CheckCircle2,
  Clock,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import api from "@/lib/axios";
import Image from "next/image";

// Interface sesuai dengan mapping backend di myItems
interface MyItem {
  id: string;
  type: string;
  title: string;
  category: string;
  status: string;
  date: string;
  image_path?: string; // Ditambahkan opsional karena di backend sebelumnya belum di-map
}

export default function ReportsPage() {
  const [reports, setReports] = useState<MyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Tarik data laporan dari API
  useEffect(() => {
    const fetchMyItems = async () => {
      try {
        const response = await api.get("/api/v1/my-items");
        setReports(response.data.data);
      } catch (error) {
        console.error("Gagal mengambil data laporan:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyItems();
  }, []);

  // Hitung Statistik secara Dinamis
  const activeCount = reports.filter(
    (r) => r.status === "active" || r.status === "is_pending",
  ).length;
  const completedCount = reports.filter((r) => r.status === "completed").length;
  const pendingCount = reports.filter((r) => r.status === "pending").length;

  // Konfigurasi Label Status berdasarkan PRD
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return { label: "Menunggu Validasi", dot: "bg-yellow-500" };
      case "active":
        return { label: "Aktif di Publik", dot: "bg-blue-500" };
      case "is_pending":
        return { label: "Sedang Diklaim", dot: "bg-purple-500" };
      case "completed":
        return { label: "Selesai", dot: "bg-green-500" };
      default:
        return { label: status, dot: "bg-gray-500" };
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[70vh] text-gray-900 dark:text-white">
        <Loader2 className="animate-spin mr-2" /> Memuat daftar laporan...
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-10 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Daftar Laporan Anda
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Ringkasan seluruh laporan kehilangan dan temuan Anda.
          </p>
        </div>
        <Link
          href="/report?tab=kehilangan"
          className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 transition flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} /> Lapor Baru
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-surface dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-gray-600 dark:text-gray-400">
            <ClipboardList
              size={20}
              className="text-primary dark:text-blue-400"
            />
            <span className="font-medium text-sm">Laporan Aktif</span>
          </div>
          <p className="text-4xl font-bold text-gray-900 dark:text-white">
            {activeCount}
          </p>
        </div>
        <div className="bg-surface dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-gray-600 dark:text-gray-400">
            <Clock size={20} className="text-yellow-600 dark:text-yellow-500" />
            <span className="font-medium text-sm">Menunggu Validasi</span>
          </div>
          <p className="text-4xl font-bold text-gray-900 dark:text-white">
            {pendingCount}
          </p>
        </div>
        <div className="bg-surface dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-gray-600 dark:text-gray-400">
            <CheckCircle2
              size={20}
              className="text-green-600 dark:text-green-400"
            />
            <span className="font-medium text-sm">Laporan Selesai</span>
          </div>
          <p className="text-4xl font-bold text-gray-900 dark:text-white">
            {completedCount}
          </p>
        </div>
      </div>

      {/* List Section */}
      <div className="bg-surface dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/20">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Riwayat Laporan Terbaru
          </h2>
        </div>

        {reports.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            Anda belum pernah membuat laporan barang.
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {reports.map((report) => {
              const statusConfig = getStatusConfig(report.status);

              return (
                <Link
                  href={`/items/${report.id}`} // Supaya card-nya bisa diklik
                  key={report.id}
                  className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors cursor-pointer block"
                >
                  <div className="flex gap-5 items-center">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 border border-gray-200 dark:border-gray-700 relative">
                      <Image
                        src={
                          report.image_path ||
                          "https://via.placeholder.com/150?text=No+Image"
                        }
                        alt={report.title}
                        fill
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-gray-900 dark:text-white text-base">
                          {report.title}
                        </h3>
                        <span
                          className={clsx(
                            "text-[10px] font-bold px-2 py-0.5 rounded-md",
                            report.type === "lost"
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                          )}
                        >
                          {report.type === "lost" ? "Kehilangan" : "Temuan"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Dilaporkan pada{" "}
                        {new Date(report.date).toLocaleDateString("id-ID")} •
                        Kategori: {report.category}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between w-full sm:w-auto mt-2 sm:mt-0">
                    <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
                      <span
                        className={clsx(
                          "w-2 h-2 rounded-full",
                          statusConfig.dot,
                        )}
                      ></span>
                      {statusConfig.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
