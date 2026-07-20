"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Hand,
  Send,
  CheckCircle2,
  CircleDashed,
  Clock,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import api from "@/lib/axios";

// 1. Siapkan TypeScript Interfaces sesuai struktur JSON Backend
interface Discussion {
  id: number;
  message: string;
  created_at: string;
  user: {
    id: number;
    name: string;
  };
}

interface ItemDetail {
  id: string;
  type: string;
  title: string;
  category: string;
  description: string;
  location: string;
  date: string;
  image_path: string | null;
  status: string;
  reporter: {
    name: string;
    email: string;
  };
  discussions: Discussion[];
}

export default function ItemDetail() {
  const params = useParams();
  const id = params.id;

  // 2. Siapkan State untuk Data, Loading, dan Pesan Chat Baru
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chatMessage, setChatMessage] = useState("");

  // 3. Tarik data dari API ketika halaman dimuat
  useEffect(() => {
    const fetchItemDetail = async () => {
      try {
        const response = await api.get(`/api/v1/items/${id}`);
        setItem(response.data.data);
      } catch (error) {
        console.error("Gagal mengambil detail barang:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchItemDetail();
    }
  }, [id]);

  // Fungsi untuk memformat tanggal bawaan ISO ke format yang mudah dibaca
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-900 dark:text-white">
        <CircleDashed className="animate-spin mr-2" /> Memuat data...
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center text-gray-900 dark:text-white mt-20">
        Laporan barang tidak ditemukan.
      </div>
    );
  }

  // Ekstrak fitur dari deskripsi (karena sebelumnya input 'Ciri-ciri' digabung ke deskripsi)
  // Menampilkan fitur dummy jika tidak ada pola spesifik, atau membiarkannya kosong.
  const features = item.description.includes("Ciri-ciri khusus:")
    ? item.description
        .split("Ciri-ciri khusus:")[1]
        .split(",")
        .map((f) => f.trim())
    : [];

  // Tentukan label status berdasarkan tipe (lost/temuan)
  const statusLabel = item.type === "lost" ? "Kehilangan" : "Temuan";

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      {/* Tombol Back */}
      <Link
        href="/items"
        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={16} className="mr-2" /> Back to Items
      </Link>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ================= KOLOM KIRI (Gambar & Detail) ================= */}
        <div className="w-full lg:w-3/5 space-y-6">
          {/* Main Image Card */}
          <div className="bg-surface dark:bg-surface-dark rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="relative h-80 md:h-[400px] w-full bg-gray-100 dark:bg-gray-900">
              <Image
                src={
                  item.image_path ||
                  "https://via.placeholder.com/800x600?text=No+Image"
                }
                alt={item.title}
                fill
                priority
                className="object-cover"
              />
              <div className="absolute top-4 right-4">
                <span
                  className={`text-sm font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm backdrop-blur-md border ${
                    item.type === "lost"
                      ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800 border-red-200"
                      : "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800 border-blue-200"
                  }`}
                >
                  <CheckCircle2 size={16} /> {statusLabel}
                </span>
              </div>
            </div>

            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-gray-800">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  Category
                </p>
                <p className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  🏷️ {item.category}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  Location {statusLabel}
                </p>
                <p className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  📍 {item.location}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  Reference ID
                </p>
                <p className="font-semibold text-gray-900 dark:text-gray-100 font-mono text-sm">
                  #{item.id.split("-")[0].toUpperCase()}
                </p>
              </div>
            </div>
          </div>

          {/* Details Card */}
          <div className="bg-surface dark:bg-surface-dark rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-800 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Item Details
            </h3>
            <div className="text-gray-600 dark:text-gray-300 leading-relaxed space-y-4 text-sm md:text-base whitespace-pre-line">
              {item.description}
            </div>

            {features.length > 0 && (
              <>
                <hr className="my-6 border-gray-100 dark:border-gray-800" />
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                  Distinguishing Features
                </h4>
                <div className="flex flex-wrap gap-2">
                  {features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 text-xs px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ================= KOLOM KANAN (Timeline & Diskusi) ================= */}
        <div className="w-full lg:w-2/5 space-y-6">
          {/* Status & Claim Card */}
          <div className="bg-surface dark:bg-surface-dark rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {item.title}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 flex items-center gap-1">
              <Clock size={14} /> Dilaporkan pada {formatDate(item.date)}
            </p>

            {/* Timeline UI Dinamis */}
            <div className="flex items-start justify-between mb-10 relative mt-2">
              <div className="absolute top-[14px] left-4 right-4 h-[2px] bg-gray-200 dark:bg-gray-700/80 z-0"></div>

              {/* Progress Line bergantung pada status */}
              <div
                className={`absolute top-[14px] left-4 h-[2px] bg-primary dark:bg-blue-500 z-0 transition-all ${
                  item.status === "completed" ? "w-[100%]" : "w-[60%]"
                }`}
              ></div>

              <div className="flex flex-col items-center gap-2 relative z-10">
                <div className="w-7 h-7 rounded-full bg-primary dark:bg-blue-500 text-white flex items-center justify-center shadow-md">
                  <CheckCircle2 size={16} strokeWidth={3} />
                </div>
                <span className="text-xs font-bold text-gray-900 dark:text-gray-200">
                  Reported
                </span>
              </div>

              <div className="flex flex-col items-center gap-2 relative z-10">
                <div className="w-7 h-7 rounded-full bg-primary dark:bg-blue-500 text-white flex items-center justify-center shadow-md">
                  <CheckCircle2 size={16} strokeWidth={3} />
                </div>
                <span className="text-xs font-bold text-gray-900 dark:text-gray-200">
                  Verified
                </span>
              </div>

              <div className="flex flex-col items-center gap-2 relative z-10">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center ${
                    item.status === "completed"
                      ? "bg-primary dark:bg-blue-500 text-white shadow-md"
                      : "bg-surface dark:bg-surface-dark border-[3px] border-primary dark:border-blue-500"
                  }`}
                >
                  {item.status === "completed" ? (
                    <CheckCircle2 size={16} strokeWidth={3} />
                  ) : (
                    <div className="w-2.5 h-2.5 bg-primary dark:bg-blue-500 rounded-full"></div>
                  )}
                </div>
                <span className="text-xs font-bold text-primary dark:text-blue-400">
                  {item.type === "lost" ? "Searching" : "Found"}
                </span>
              </div>

              <div className="flex flex-col items-center gap-2 relative z-10">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center ${
                    item.status === "completed"
                      ? "bg-surface dark:bg-surface-dark border-[3px] border-primary dark:border-blue-500"
                      : "bg-surface dark:bg-surface-dark border-[3px] border-gray-200 dark:border-gray-700"
                  }`}
                >
                  {item.status === "completed" && (
                    <div className="w-2.5 h-2.5 bg-primary dark:bg-blue-500 rounded-full"></div>
                  )}
                </div>
                <span
                  className={`text-xs font-medium ${item.status === "completed" ? "text-primary dark:text-blue-400" : "text-gray-400 dark:text-gray-500"}`}
                >
                  Claimed
                </span>
              </div>
            </div>

            {/* Tombol Klaim */}
            <button
              disabled={item.status === "completed"}
              className={`w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors shadow-md ${
                item.status === "completed"
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-primary text-white hover:bg-blue-800"
              }`}
            >
              <Hand size={18} />
              {item.status === "completed"
                ? "Barang Sudah Diklaim"
                : "Ini Barang Saya (Klaim)"}
            </button>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4 px-4 leading-relaxed">
              Anda wajib melampirkan bukti kepemilikan yang sah saat melakukan
              klaim.
            </p>
          </div>

          {/* Discussion / Chat Modul Dinamis */}
          <div className="bg-surface dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col h-[400px]">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/20 rounded-t-2xl">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                💬 Discussion
              </h3>
              <span className="text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md">
                {item.discussions.length} Messages
              </span>
            </div>

            {/* Area Chat */}
            <div className="flex-grow p-4 overflow-y-auto space-y-4 no-scrollbar">
              {item.discussions.length === 0 ? (
                <div className="flex justify-center items-center h-full text-sm text-gray-500">
                  Belum ada pesan. Jadilah yang pertama bertanya!
                </div>
              ) : (
                item.discussions.map((msg) => {
                  const isPelapor = msg.user.name === item.reporter.name;
                  return (
                    <div key={msg.id} className="flex gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white shadow-sm ${
                          isPelapor
                            ? "bg-primary"
                            : "bg-gray-400 dark:bg-gray-700"
                        }`}
                      >
                        {msg.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="font-bold text-sm text-gray-900 dark:text-white">
                            {msg.user.name} {isPelapor && "(Pelapor)"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(msg.created_at).toLocaleTimeString(
                              "id-ID",
                              { hour: "2-digit", minute: "2-digit" },
                            )}
                          </span>
                        </div>
                        <div
                          className={`p-3 rounded-2xl rounded-tl-none text-sm text-gray-700 dark:text-gray-300 ${
                            isPelapor
                              ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800"
                              : "bg-gray-100 dark:bg-gray-800 border border-transparent"
                          }`}
                        >
                          {msg.message}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Chat */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800">
              <div className="relative">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Tulis pesan..."
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-primary dark:focus:border-blue-500 text-gray-900 dark:text-white transition-colors"
                />
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-blue-700 p-2 transition-colors disabled:opacity-50"
                  disabled={!chatMessage.trim()}
                  onClick={() => {
                    // TODO: Tembak endpoint POST /api/v1/items/{id}/discussions disini
                    console.log("Kirim pesan:", chatMessage);
                    setChatMessage("");
                  }}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
