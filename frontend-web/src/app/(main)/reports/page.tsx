import { Plus, ClipboardList, CheckCircle2, TrendingUp } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

export default function ReportsPage() {
  const reports = [
    {
      id: 1,
      title: "Black Leather Wallet",
      type: "Kehilangan",
      date: "Dilaporkan pada 24 Okt 2023",
      location: "Perpustakaan Utama",
      status: "Aktif",
      imageUrl:
        "https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=200&auto=format&fit=crop",
    },
    {
      id: 2,
      title: "Silver MacBook Pro",
      type: "Temuan",
      date: "Dilaporkan pada 20 Okt 2023",
      location: "Kantin Area B",
      status: "Selesai",
      imageUrl:
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=200&auto=format&fit=crop",
    },
  ];

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
          href="/report"
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
          <p className="text-4xl font-bold text-gray-900 dark:text-white">3</p>
        </div>
        <div className="bg-surface dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-gray-600 dark:text-gray-400">
            <CheckCircle2
              size={20}
              className="text-green-600 dark:text-green-400"
            />
            <span className="font-medium text-sm">Laporan Selesai</span>
          </div>
          <p className="text-4xl font-bold text-gray-900 dark:text-white">12</p>
        </div>
        <div className="bg-surface dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4 text-gray-600 dark:text-gray-400">
            <TrendingUp size={20} className="text-primary dark:text-blue-400" />
            <span className="font-medium text-sm">Tingkat Pemulihan</span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-bold text-gray-900 dark:text-white">
              80%
            </p>
            <span className="text-sm text-gray-500">Bulan ini</span>
          </div>
        </div>
      </div>

      {/* List Section */}
      <div className="bg-surface dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/20">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Laporan Terbaru
          </h2>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {reports.map((report) => (
            <div
              key={report.id}
              className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
            >
              <div className="flex gap-5 items-center">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 border border-gray-200 dark:border-gray-700">
                  <img
                    src={report.imageUrl}
                    alt={report.title}
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
                        report.type === "Kehilangan"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                      )}
                    >
                      {report.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {report.date} • {report.location}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between w-full sm:w-auto mt-2 sm:mt-0">
                <span
                  className={clsx(
                    "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border",
                    report.status === "Aktif"
                      ? "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                      : "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
                  )}
                >
                  <span
                    className={clsx(
                      "w-2 h-2 rounded-full",
                      report.status === "Aktif"
                        ? "bg-blue-600 dark:bg-blue-400"
                        : "bg-gray-500 dark:bg-gray-400",
                    )}
                  ></span>
                  {report.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
