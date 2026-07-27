"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Hand,
  Send,
  CheckCircle2,
  CircleDashed,
  Clock,
  Lock,
  UploadCloud,
  X,
  Loader2,
  MapPin,
  Tag,
  Maximize2,
  Sparkles,
  User,
  ShieldCheck,
  Calendar,
  MessageSquare,
  FileText,
  Copy,
  Check,
  ExternalLink,
  Navigation,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import api from "@/lib/axios";
import axios from "axios";
import clsx from "clsx";

interface Discussion {
  id: number;
  message: string;
  created_at: string;
  user: {
    id: number;
    name: string;
    avatar_url?: string;
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
  images?: string[];
  status: string;
  reporter: {
    name: string;
    email: string;
    avatar_url?: string;
  };
  discussions: Discussion[];
}

export default function ItemDetailPage() {
  const params = useParams();
  const id = params.id;

  // --- STATE UTAMA ---
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- STATE MULTI-IMAGE CAROUSEL & LIGHTBOX ---
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // --- STATE LOKASI PETA & COPY ---
  const [isLocationMapOpen, setIsLocationMapOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // --- STATE DISKUSI ---
  const [chatMessage, setChatMessage] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // --- STATE MODAL KLAIM ---
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claimDesc, setClaimDesc] = useState("");
  const [claimImage, setClaimImage] = useState<File | null>(null);
  const [claimImagePreview, setClaimImagePreview] = useState<string | null>(
    null,
  );
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);
  const [claimError, setClaimError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- FUNGSI AMBIL DATA ---
  const fetchItemDetail = async () => {
    try {
      const response = await api.get(`/api/v1/items/${id}`);
      const data = response.data.data;
      setItem(data);
    } catch (error) {
      console.error("Gagal mengambil detail barang:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchItemDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Parse Multi Images List
  const getImageList = (): string[] => {
    if (!item) return [];
    if (item.images && item.images.length > 0) {
      return item.images;
    }
    if (item.image_path) {
      if (item.image_path.startsWith("[")) {
        try {
          const parsed = JSON.parse(item.image_path);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {}
      }
      return [item.image_path];
    }
    return ["https://via.placeholder.com/800x600?text=Foto+Tidak+Tersedia"];
  };

  const imageList = getImageList();
  const currentMainImage = imageList[activeImageIndex] || imageList[0];

  // --- HANDLER COPY ALAMAT & KOORDINAT ---
  const handleCopyLocation = () => {
    if (!item?.location) return;
    navigator.clipboard.writeText(item.location);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // --- HANDLER KIRIM PESAN ---
  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;
    setIsSendingMessage(true);
    try {
      await api.post(`/api/v1/items/${id}/discussions`, {
        message: chatMessage,
      });
      setChatMessage("");
      fetchItemDetail();
    } catch (error: unknown) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message
        : "Gagal mengirim pesan.";
      alert(errorMessage);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // --- HANDLER GAMBAR KLAIM ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setClaimError("Ukuran gambar maksimal 5MB");
        return;
      }
      setClaimImage(file);
      setClaimImagePreview(URL.createObjectURL(file));
      setClaimError("");
    }
  };

  // --- HANDLER SUBMIT KLAIM ---
  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimDesc) {
      setClaimError("Deskripsi bukti kepemilikan wajib diisi.");
      return;
    }

    setIsSubmittingClaim(true);
    setClaimError("");

    try {
      const formData = new FormData();
      formData.append("proof_description", claimDesc);
      if (claimImage) {
        formData.append("proof_image", claimImage);
      }

      await api.post(`/api/v1/items/${id}/claims`, formData, {
        headers: {
          "Content-Type": undefined,
        },
      });

      alert(
        "Klaim berhasil diajukan! Barang telah dikunci. Menunggu verifikasi dari Admin.",
      );
      setIsClaimModalOpen(false);
      setClaimDesc("");
      setClaimImage(null);
      setClaimImagePreview(null);
      fetchItemDetail();
    } catch (error: unknown) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message
        : "Terjadi kesalahan saat mengajukan klaim.";
      setClaimError(errorMessage);
    } finally {
      setIsSubmittingClaim(false);
    }
  };

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
      <div className="flex justify-center items-center h-screen text-gray-900 dark:text-white gap-2">
        <CircleDashed className="animate-spin text-primary" size={24} />
        <span className="font-semibold text-sm">Memuat detail laporan...</span>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center text-gray-900 dark:text-white mt-20 font-semibold">
        Laporan barang tidak ditemukan.
      </div>
    );
  }

  // Separasi Ciri-ciri Khusus & Deskripsi
  let rawDesc = item.description;
  let featuresList: string[] = [];

  if (rawDesc.includes("Ciri-ciri khusus:")) {
    const parts = rawDesc.split("Ciri-ciri khusus:");
    rawDesc = parts[0].trim();
    featuresList = parts[1]
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);
  }

  const statusLabel = item.type === "lost" ? "Kehilangan" : "Temuan";
  const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    item.location,
  )}`;

  // --- LOGIKA STATE MACHINE PRD ---
  const isPending = item.status === "pending";
  const isActive = item.status === "active";
  const isClaimPending = item.status === "is_pending";
  const isCompleted = item.status === "completed";

  let progressWidth = "w-[0%]";
  if (isActive || isClaimPending) progressWidth = "w-[66%]";
  if (isCompleted) progressWidth = "w-[100%]";

  let btnConfig = {
    disabled: false,
    text: "Ini Barang Saya (Klaim)",
    style:
      "bg-primary text-white hover:bg-blue-800 shadow-lg shadow-blue-900/30",
    icon: <Hand size={18} />,
  };

  if (isPending) {
    btnConfig = {
      disabled: true,
      text: "Menunggu Validasi Admin",
      style: "bg-gray-200 dark:bg-gray-800 text-gray-500 cursor-not-allowed",
      icon: <Lock size={18} />,
    };
  } else if (isClaimPending) {
    btnConfig = {
      disabled: true,
      text: "Klaim Sedang Diproses Admin",
      style:
        "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 cursor-not-allowed font-bold",
      icon: <Clock size={18} className="animate-pulse" />,
    };
  } else if (isCompleted) {
    btnConfig = {
      disabled: true,
      text: "Barang Telah Dikembalikan",
      style:
        "bg-gray-200 dark:bg-gray-800 text-gray-500 cursor-not-allowed opacity-75",
      icon: <CheckCircle2 size={18} />,
    };
  }

  const imageFilter =
    isClaimPending || isCompleted ? "grayscale contrast-75 opacity-80" : "";

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 relative">
      <Link
        href="/items"
        className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={16} className="mr-2" /> Kembali ke Daftar Barang
      </Link>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ================= KOLOM KIRI: GALLERY & INFORMASI DETAIL ================= */}
        <div className="w-full lg:w-3/5 space-y-6">
          <div className="bg-surface dark:bg-[#151c2c] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-md">
            {/* Main Featured Image Display */}
            <div className="relative h-80 md:h-[420px] w-full bg-gray-900 overflow-hidden group cursor-pointer">
              <Image
                src={currentMainImage}
                alt={item.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 50vw"
                className={`object-cover transition-all duration-300 ${imageFilter} group-hover:scale-105`}
                onClick={() => setIsLightboxOpen(true)}
              />

              {/* Status Badge Tag */}
              <div className="absolute top-4 right-4 z-10">
                <span
                  className={`text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg backdrop-blur-md border ${
                    item.type === "lost"
                      ? "bg-red-500/80 text-white border-red-400/50"
                      : "bg-blue-500/80 text-white border-blue-400/50"
                  }`}
                >
                  <CheckCircle2 size={14} /> {statusLabel}
                </span>
              </div>

              {/* Lightbox Zoom Button Overlay */}
              <button
                onClick={() => setIsLightboxOpen(true)}
                className="absolute bottom-4 right-4 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white p-2.5 rounded-xl border border-white/20 shadow-lg opacity-80 group-hover:opacity-100 transition flex items-center gap-1.5 text-xs font-semibold"
              >
                <Maximize2 size={14} /> Perbesar Foto
              </button>
            </div>

            {/* Multi-Image Thumbnail Selector Gallery Bar */}
            {imageList.length > 1 && (
              <div className="p-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-800 flex items-center gap-3 overflow-x-auto">
                {imageList.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={clsx(
                      "relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0",
                      activeImageIndex === idx
                        ? "border-primary scale-105 shadow-md"
                        : "border-transparent opacity-60 hover:opacity-100",
                    )}
                  >
                    <Image
                      src={imgUrl}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Quick Metadata Bar & Interactive Location Card */}
            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 bg-white dark:bg-[#151c2c] border-t border-gray-100 dark:border-gray-800">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1 font-semibold">
                  <Tag size={13} className="text-primary dark:text-blue-400" /> Kategori
                </p>
                <p className="font-bold text-gray-900 dark:text-gray-100">
                  {item.category}
                </p>
              </div>

              {/* LOKASI KEHILANGAN DENGAN SHARING & PETA ACTIONS */}
              <div className="md:col-span-1">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1 font-semibold">
                  <MapPin size={13} className="text-primary dark:text-blue-400" /> Lokasi {statusLabel}
                </p>
                <p className="font-bold text-gray-900 dark:text-gray-100 text-sm leading-snug mb-2">
                  {item.location}
                </p>

                {/* Tombol Akses Peta & Salin Alamat */}
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setIsLocationMapOpen(true)}
                    className="bg-primary/10 dark:bg-blue-900/40 text-primary dark:text-blue-400 hover:bg-primary/20 text-[11px] font-bold px-2.5 py-1 rounded-md transition flex items-center gap-1 border border-primary/20"
                  >
                    <Maximize2 size={11} /> Lihat Peta
                  </button>
                  <button
                    onClick={handleCopyLocation}
                    className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 text-[11px] font-semibold px-2.5 py-1 rounded-md transition flex items-center gap-1 border border-gray-200 dark:border-gray-700"
                  >
                    {isCopied ? (
                      <Check size={11} className="text-green-500" />
                    ) : (
                      <Copy size={11} />
                    )}
                    {isCopied ? "Tersalin!" : "Salin"}
                  </button>
                  <a
                    href={googleMapsSearchUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 text-[11px] font-semibold px-2 py-1 rounded-md transition flex items-center gap-1 border border-gray-200 dark:border-gray-700"
                    title="Buka Langsung di Google Maps"
                  >
                    <ExternalLink size={11} />
                  </a>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1 font-semibold">
                  <ShieldCheck size={13} className="text-primary dark:text-blue-400" /> ID Laporan
                </p>
                <p className="font-bold text-gray-900 dark:text-gray-100 font-mono text-sm">
                  #{item.id.split("-")[0].toUpperCase()}
                </p>
              </div>
            </div>
          </div>

          {/* Item Description & Distinguishing Features Card */}
          <div className="bg-surface dark:bg-[#151c2c] rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText size={18} className="text-primary dark:text-blue-400" />
              Detail Deskripsi Barang
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm md:text-base whitespace-pre-line">
              {rawDesc || item.description}
            </p>

            {featuresList.length > 0 && (
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-1.5">
                  <Sparkles size={16} className="text-amber-400" />
                  Ciri-ciri Khusus Spesifik
                </h4>
                <div className="flex flex-wrap gap-2">
                  {featuresList.map((feature, idx) => (
                    <span
                      key={idx}
                      className="bg-primary/10 dark:bg-blue-900/30 text-primary dark:text-blue-300 text-xs font-semibold px-3 py-1.5 rounded-lg border border-primary/20"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= KOLOM KANAN: STATUS TRACKER & DISKUSI ================= */}
        <div className="w-full lg:w-2/5 space-y-6">
          {/* Status Tracker & Klaim Action Card */}
          <div className="bg-surface dark:bg-[#151c2c] rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {item.title}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 flex items-center gap-1">
              <Calendar size={14} /> Dilaporkan pada {formatDate(item.date)}
            </p>

            {/* Stepper Status Bar */}
            <div className="flex items-start justify-between mb-8 relative mt-2">
              <div className="absolute top-[14px] left-4 right-4 h-[2px] bg-gray-200 dark:bg-gray-700/80 z-0"></div>
              <div
                className={`absolute top-[14px] left-4 h-[2px] bg-primary dark:bg-blue-500 z-0 transition-all duration-700 ease-in-out ${progressWidth}`}
              ></div>

              <div className="flex flex-col items-center gap-1.5 relative z-10">
                <div className="w-7 h-7 rounded-full bg-primary dark:bg-blue-500 text-white flex items-center justify-center shadow-md">
                  <CheckCircle2 size={16} strokeWidth={3} />
                </div>
                <span className="text-[11px] font-bold text-gray-900 dark:text-gray-200">
                  Dilaporkan
                </span>
              </div>

              <div className="flex flex-col items-center gap-1.5 relative z-10">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${!isPending ? "bg-primary dark:bg-blue-500 text-white shadow-md" : "bg-surface dark:bg-surface-dark border-[3px] border-gray-200 dark:border-gray-700"}`}
                >
                  {!isPending && <CheckCircle2 size={16} strokeWidth={3} />}
                </div>
                <span
                  className={`text-[11px] font-bold ${!isPending ? "text-gray-900 dark:text-gray-200" : "text-gray-400"}`}
                >
                  Terverifikasi
                </span>
              </div>

              <div className="flex flex-col items-center gap-1.5 relative z-10">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${isCompleted ? "bg-primary dark:bg-blue-500 text-white shadow-md" : !isPending ? "bg-surface dark:bg-surface-dark border-[3px] border-primary dark:border-blue-500" : "bg-surface dark:bg-surface-dark border-[3px] border-gray-200 dark:border-gray-700"}`}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={16} strokeWidth={3} />
                  ) : (
                    !isPending && (
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${isClaimPending ? "bg-yellow-500 animate-pulse" : "bg-primary dark:bg-blue-500"}`}
                      ></div>
                    )
                  )}
                </div>
                <span
                  className={`text-[11px] font-bold ${!isPending ? "text-primary dark:text-blue-400" : "text-gray-400"}`}
                >
                  {item.type === "lost" ? "Pencarian" : "Temuan"}
                </span>
              </div>

              <div className="flex flex-col items-center gap-1.5 relative z-10">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${isCompleted ? "bg-primary dark:bg-blue-500 text-white shadow-md" : "bg-surface dark:bg-surface-dark border-[3px] border-gray-200 dark:border-gray-700"}`}
                >
                  {isCompleted && <CheckCircle2 size={16} strokeWidth={3} />}
                </div>
                <span
                  className={`text-[11px] font-bold ${isCompleted ? "text-primary dark:text-blue-400" : "text-gray-400 dark:text-gray-500"}`}
                >
                  Selesai
                </span>
              </div>
            </div>

            {/* Reporter Profile Badge */}
            <div className="p-3 bg-gray-50 dark:bg-gray-900/60 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-full bg-primary/20 text-primary dark:text-blue-400 font-bold flex items-center justify-center text-sm flex-shrink-0 overflow-hidden border border-primary/30">
                {item.reporter.avatar_url ? (
                  <img
                    src={item.reporter.avatar_url}
                    alt={item.reporter.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <User size={16} />
                )}
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium">Pelapor Barang</p>
                <p className="text-xs font-bold text-gray-900 dark:text-white">
                  {item.reporter.name} ({item.reporter.email})
                </p>
              </div>
            </div>

            <button
              disabled={btnConfig.disabled}
              onClick={() => setIsClaimModalOpen(true)}
              className={`w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors ${btnConfig.style}`}
            >
              {btnConfig.icon}
              {btnConfig.text}
            </button>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3 px-2 leading-relaxed">
              {isClaimPending || isCompleted
                ? "Aksi klaim pada barang ini telah dibatasi oleh sistem."
                : "Anda wajib melampirkan bukti kepemilikan yang sah saat melakukan klaim."}
            </p>
          </div>

          {/* Interactive Discussion Chat Card */}
          <div className="bg-surface dark:bg-[#151c2c] rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col h-[420px]">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/40 rounded-t-2xl">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                <MessageSquare size={16} className="text-primary dark:text-blue-400" /> Diskusi & Tanya Jawab
              </h3>
              <span className="text-xs font-semibold bg-primary/10 text-primary dark:text-blue-400 px-2.5 py-1 rounded-md">
                {item.discussions.length} Pesan
              </span>
            </div>

            <div className="flex-grow p-4 overflow-y-auto space-y-4">
              {item.discussions.length === 0 ? (
                <div className="flex justify-center items-center h-full text-xs text-gray-500">
                  Belum ada pesan. Silakan ajukan pertanyaan terkait barang ini.
                </div>
              ) : (
                item.discussions.map((msg) => {
                  const isPelapor = msg.user.name === item.reporter.name;
                  return (
                    <div key={msg.id} className="flex gap-3">
                      {msg.user.avatar_url ? (
                        <img
                          src={msg.user.avatar_url}
                          alt={msg.user.name}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0 shadow-sm border border-gray-200 dark:border-gray-700"
                        />
                      ) : (
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-white shadow-sm ${isPelapor ? "bg-primary" : "bg-gray-500"}`}
                        >
                          {msg.user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="font-bold text-xs text-gray-900 dark:text-white">
                            {msg.user.name} {isPelapor && "(Pelapor)"}
                          </span>
                          <span className="text-[10px] text-gray-500">
                            {new Date(msg.created_at).toLocaleTimeString(
                              "id-ID",
                              { hour: "2-digit", minute: "2-digit" },
                            )}
                          </span>
                        </div>
                        <div
                          className={`p-3 rounded-2xl rounded-tl-none text-xs text-gray-800 dark:text-gray-200 ${isPelapor ? "bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800" : "bg-gray-100 dark:bg-gray-800 border border-transparent"}`}
                        >
                          {msg.message}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-4 border-t border-gray-100 dark:border-gray-800">
              <div className="relative">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isSendingMessage && !isCompleted)
                      handleSendMessage();
                  }}
                  placeholder={
                    isCompleted ? "Diskusi telah ditutup." : "Tulis pertanyaan atau komentar..."
                  }
                  disabled={isCompleted || isSendingMessage}
                  className="w-full bg-gray-50 dark:bg-[#0b1120] border border-gray-200 dark:border-gray-700 rounded-lg pl-4 pr-12 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white transition-colors disabled:opacity-50"
                />
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-blue-700 p-2 transition-colors disabled:opacity-50"
                  disabled={
                    !chatMessage.trim() || isCompleted || isSendingMessage
                  }
                  onClick={handleSendMessage}
                >
                  {isSendingMessage ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODAL MAP PREVIEW INTERAKTIF ================= */}
      {isLocationMapOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface dark:bg-[#151c2c] border border-gray-200 dark:border-gray-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
            {/* Header Modal */}
            <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-900/40">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary dark:text-blue-400 flex items-center justify-center font-bold">
                  <Navigation size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">
                    Peta Lokasi Kejadian
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Posisi barang dilaporkan di area kampus UISI.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsLocationMapOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Map Preview Body */}
            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="relative w-full h-80 rounded-xl overflow-hidden border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 shadow-inner">
                <iframe
                  title="Peta Lokasi Barang"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight={0}
                  marginWidth={0}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=112.6500%2C-7.1620%2C112.6610%2C-7.1540&layer=mapnik&marker=-7.1584%2C112.6555`}
                  className="w-full h-full border-none"
                ></iframe>
              </div>

              {/* Detail Text Location Box */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900/60 rounded-xl border border-gray-200 dark:border-gray-800">
                <p className="text-xs text-gray-400 font-semibold mb-1">
                  Detail Alamat & Lokasi Spesifik:
                </p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {item.location}
                </p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-5 border-t border-gray-200 dark:border-gray-800 flex flex-wrap justify-between items-center gap-3 bg-gray-50 dark:bg-gray-900/40">
              <button
                type="button"
                onClick={handleCopyLocation}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 text-gray-800 dark:text-gray-200 text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
              >
                {isCopied ? (
                  <Check size={14} className="text-green-500" />
                ) : (
                  <Copy size={14} />
                )}
                {isCopied ? "Alamat Tersalin!" : "Salin Koordinat & Alamat"}
              </button>

              <div className="flex gap-2">
                <a
                  href={googleMapsSearchUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-blue-800 transition shadow-md flex items-center gap-1.5"
                >
                  <ExternalLink size={14} /> Buka Navigasi Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= LIGHTBOX MODAL VIEWER ================= */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center">
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition"
            >
              <X size={28} />
            </button>
            <img
              src={currentMainImage}
              alt="Foto Perbesar"
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* ================= MODAL FORM KLAIM ================= */}
      {isClaimModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#151c2c] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Formulir Klaim Barang
              </h2>
              <button
                onClick={() => setIsClaimModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmitClaim} className="p-6 space-y-5">
              {claimError && (
                <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm">
                  {claimError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ceritakan Bukti Kepemilikan Anda{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={claimDesc}
                  onChange={(e) => setClaimDesc(e.target.value)}
                  rows={4}
                  className="w-full bg-gray-50 dark:bg-[#0b1120] border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all text-gray-900 dark:text-gray-200 resize-none"
                  placeholder="Misal: Saya punya goresan khusus di bagian belakang, atau ada stiker x..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Unggah Bukti Foto (Opsional tapi disarankan)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                />

                {!claimImagePreview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-6 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-xl bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <UploadCloud className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Klik untuk unggah foto (Maks. 5MB)
                    </p>
                  </div>
                ) : (
                  <div className="relative border border-gray-300 dark:border-gray-700 rounded-xl p-2 bg-gray-50 dark:bg-gray-900 flex items-center gap-4">
                    <img
                      src={claimImagePreview}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <p className="text-sm text-gray-700 dark:text-gray-300 truncate flex-grow">
                      {claimImage?.name}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setClaimImage(null);
                        setClaimImagePreview(null);
                      }}
                      className="p-2 text-red-500 hover:bg-red-100 rounded-lg"
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsClaimModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingClaim}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmittingClaim ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : null}
                  {isSubmittingClaim ? "Mengirim..." : "Kirim Klaim"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
