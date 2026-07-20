import {
  AlertCircle,
  CheckSquare,
  MessageSquare,
  Info,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

export default function ActivityPage() {
  // Dummy data aktivitas
  const activities = [
    {
      id: 1,
      type: "report",
      title: "Laporan Barang Hilang Dibuat",
      time: "Hari ini, 10:45 AM",
      description: (
        <>
          Anda melaporkan kehilangan{" "}
          <span className="font-bold text-gray-900 dark:text-gray-100">
            Dompet Kulit Coklat
          </span>{" "}
          di area Lobby Utama.
        </>
      ),
      linkText: "Lihat Detail Laporan",
      linkHref: "/items/2",
      icon: AlertCircle,
      iconColor: "text-danger dark:text-red-400",
      iconBg:
        "bg-danger/10 border-danger/20 dark:bg-red-900/20 dark:border-red-800",
    },
    {
      id: 2,
      type: "claim",
      title: "Klaim Barang Disetujui",
      time: "Kemarin, 14:20 PM",
      description: (
        <>
          Klaim anda untuk{" "}
          <span className="font-bold text-gray-900 dark:text-gray-100">
            Kunci Mobil Honda
          </span>{" "}
          telah diverifikasi dan disetujui oleh admin.
        </>
      ),
      linkText: "Lihat Status Klaim",
      linkHref: "/items/1",
      icon: CheckSquare,
      iconColor: "text-primary dark:text-blue-400",
      iconBg:
        "bg-primary/10 border-primary/20 dark:bg-blue-900/20 dark:border-blue-800",
    },
    {
      id: 3,
      type: "discussion",
      title: "Balasan Diskusi Baru",
      time: "12 Mei, 09:15 AM",
      description: (
        <>
          Petugas keamanan membalas komentar anda pada item{" "}
          <span className="font-bold text-gray-900 dark:text-gray-100">
            Laptop Asus ROG
          </span>{" "}
          yang ditemukan.
        </>
      ),
      linkText: "Buka Diskusi",
      linkHref: "/items/3",
      icon: MessageSquare,
      iconColor: "text-gray-500 dark:text-gray-400",
      iconBg:
        "bg-gray-100 border-gray-200 dark:bg-gray-800 dark:border-gray-700",
    },
    {
      id: 4,
      type: "system",
      title: "Pembaruan Sistem TraceBack",
      time: "10 Mei, 00:00 AM",
      description: (
        <>
          Sistem telah diperbarui untuk meningkatkan kecepatan pencarian
          inventaris.
        </>
      ),
      icon: Info,
      iconColor: "text-gray-500 dark:text-gray-400",
      iconBg:
        "bg-gray-100 border-gray-200 dark:bg-gray-800 dark:border-gray-700",
    },
  ];

  return (
    <div className="container mx-auto px-4 lg:px-8 py-10 max-w-4xl">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Riwayat Aktivitas
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Pantau laporan, klaim, dan diskusi terbaru Anda.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          <button className="px-5 py-2 rounded-full text-sm font-medium bg-primary text-white shadow-sm">
            Semua
          </button>
          <button className="px-5 py-2 rounded-full text-sm font-medium bg-surface dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
            Laporan Saya
          </button>
          <button className="px-5 py-2 rounded-full text-sm font-medium bg-surface dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
            Klaim Saya
          </button>
          <button className="px-5 py-2 rounded-full text-sm font-medium bg-surface dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
            Diskusi
          </button>
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="bg-surface dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-xl p-5 md:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 hover:shadow-md dark:hover:shadow-blue-900/10 transition-shadow"
          >
            {/* Icon Box */}
            <div
              className={clsx(
                "w-12 h-12 rounded-full border flex flex-shrink-0 items-center justify-center",
                activity.iconBg,
                activity.iconColor,
              )}
            >
              <activity.icon size={20} strokeWidth={2.5} />
            </div>

            {/* Content */}
            <div className="flex-grow">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-1">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                  {activity.title}
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap pt-1">
                  {activity.time}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 leading-relaxed">
                {activity.description}
              </p>

              {/* Action Link (If exists) */}
              {activity.linkHref && (
                <Link
                  href={activity.linkHref}
                  className="inline-flex items-center text-sm font-semibold text-primary dark:text-blue-400 hover:underline gap-1"
                >
                  {activity.linkText} <ArrowRight size={16} />
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
