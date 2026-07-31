import {
  MapPin,
  Clock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import Image from "next/image";

interface ItemCardProps {
  id: string;
  variant?: "vertical" | "horizontal";
  title: string;
  location: string;
  time: string;
  description?: string;
  status: "Hilang" | "Menunggu Validasi" | "Selesai" | string;
  imageUrl: string;
  isUrgent?: boolean;
  isOldest?: boolean;
}

export default function ItemCard({
  id,
  variant = "vertical",
  title,
  location,
  time,
  description,
  status,
  imageUrl,
  isUrgent,
  isOldest,
}: ItemCardProps) {
  const statusColors: Record<string, string> = {
    Hilang:
      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800",
    Ditemukan:
      "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border border-teal-200 dark:border-teal-800",
    "Menunggu Validasi":
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800",
    Selesai:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800",
    // Tambahan fallback untuk status dari backend
    active:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800",
  };

  // Mengambil warna berdasarkan status, fallback ke warna abu-abu jika tidak ada
  const currentStatusColor =
    statusColors[status] || "bg-gray-100 text-gray-700 border border-gray-200";

  if (variant === "horizontal") {
    return (
      <div className="flex flex-col sm:flex-row bg-surface dark:bg-surface-dark rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 transition-all hover:shadow-lg dark:hover:shadow-blue-900/10 h-full">
        <div className="relative w-full sm:w-2/5 h-48 sm:h-auto bg-gray-100 dark:bg-gray-800">
          <Image
            src={imageUrl || "https://via.placeholder.com/400?text=No+Image"}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="w-full h-full object-cover"
          />
          {isOldest ? (
            <div className="absolute top-3 left-3 bg-amber-500 text-black font-extrabold text-[11px] px-3 py-1 rounded-lg flex items-center gap-1 shadow-lg border border-amber-300">
              <Clock size={13} /> LAPORAN WAKTU TERLAMA (BANTU TEMUKAN)
            </div>
          ) : isUrgent ? (
            <div className="absolute top-4 left-4 bg-danger text-white text-xs font-bold px-3 py-1.5 rounded-md flex items-center gap-1 shadow-md">
              <AlertCircle size={14} /> URGENT
            </div>
          ) : null}
        </div>
        <div className="w-full sm:w-3/5 p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-3">
              <span
                className={clsx(
                  "text-xs font-bold px-2.5 py-1 rounded-full capitalize",
                  currentStatusColor,
                )}
              >
                {status}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {time}
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {title}
            </h3>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3 gap-1">
              <MapPin size={16} /> {location}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
              {description}
            </p>
          </div>
          <Link
            href={`/items/${id}`}
            className="inline-flex items-center text-sm font-medium text-primary dark:text-blue-400 hover:underline mt-4 gap-1 w-max"
          >
            Lihat Detail <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-surface dark:bg-surface-dark rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 transition-all hover:shadow-lg dark:hover:shadow-blue-900/10 h-full">
      <div className="relative h-48 w-full flex-shrink-0 bg-gray-100 dark:bg-gray-800">
        <Image
          src={imageUrl || "https://via.placeholder.com/400?text=No+Image"}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4">
          <span
            className={clsx(
              "text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm backdrop-blur-md capitalize",
              currentStatusColor,
            )}
          >
            {status === "Selesai" && <CheckCircle2 size={14} />}
            {status}
          </span>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 line-clamp-1">
          {title}
        </h3>
        <div className="space-y-2 mb-6">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 gap-2">
            <MapPin size={16} className="text-gray-400 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 gap-2">
            <Clock size={16} className="text-gray-400 flex-shrink-0" />
            {time}
          </div>
        </div>
        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
          <Link
            href={`/items/${id}`}
            className={clsx(
              "w-full py-2.5 rounded-lg text-sm font-medium transition-colors border flex justify-center items-center",
              status === "Selesai"
                ? "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-400 cursor-not-allowed"
                : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300",
            )}
          >
            {status === "Selesai" ? "Telah Dikembalikan" : "Detail"}
          </Link>
        </div>
      </div>
    </div>
  );
}
