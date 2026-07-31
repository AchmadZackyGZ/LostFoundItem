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
  GraduationCap,
  CreditCard,
  Mail,
  ShieldAlert,
  Ban,
  Phone,
  Award,
  Activity,
  Briefcase,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import api from "@/lib/axios";
import axios from "axios";
import clsx from "clsx";
import { useAuthStore } from "@/store/useAuthStore";
import Pusher from "pusher-js";

interface Discussion {
  id: number | string;
  message: string;
  created_at: string;
  user: {
    id: number | string;
    name: string;
    email?: string;
    department?: string;
    role?: string;
    nim?: string;
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
    id?: string;
    name: string;
    email: string;
    avatar_url?: string;
  };
  discussions: Discussion[];
}

export default function ItemDetailPage() {
  const params = useParams();
  const id = params.id;
  const { user } = useAuthStore();

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

  // --- STATE ADMIN MODAL SUSPEND MAHASISWA ---
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [selectedSuspendUser, setSelectedSuspendUser] = useState<{
    id: string;
    name: string;
    email: string;
    nim: string;
    department: string;
    is_suspended?: boolean;
    suspend_reason?: string;
  } | null>(null);
  const [suspendDays, setSuspendDays] = useState(7);
  const [suspendReason, setSuspendReason] = useState("");
  const [isSuspending, setIsSuspending] = useState(false);

  const handleExecuteSuspend = async (days: number, reason: string) => {
    if (!selectedSuspendUser) return;
    setIsSuspending(true);

    try {
      const res = await api.put(`/api/v1/admin/users/${selectedSuspendUser.id}/suspend`, {
        days,
        suspend_reason: reason,
      });

      alert(res.data.message || "Status penangguhan akun pengguna berhasil diperbarui.");
      setIsSuspendModalOpen(false);
      fetchItemDetail();
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal mengubah status penangguhan pengguna.");
    } finally {
      setIsSuspending(false);
    }
  };

  // --- STATE MODAL PROFILE DETAIL PENGGUNA ---
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileDetailUser, setProfileDetailUser] = useState<{
    id: string;
    name: string;
    email: string;
    nim: string;
    department: string;
    role: string;
    phone?: string;
    avatar_url?: string;
    is_email_verified?: boolean;
    is_phone_verified?: boolean;
    is_suspended?: boolean;
    suspended_until?: string | null;
    suspend_reason?: string | null;
    reported_items_count?: number;
    submitted_claims_count?: number;
    created_at?: string;
  } | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  const handleOpenUserProfile = async (userId: string | number, fallbackUser?: any) => {
    setIsLoadingProfile(true);
    setIsProfileModalOpen(true);

    if (fallbackUser) {
      setProfileDetailUser({
        id: String(userId),
        name: fallbackUser.name,
        email: fallbackUser.email || "-",
        nim: fallbackUser.nim || (fallbackUser.role === 'admin' ? '1988041201' : '3012210001'),
        department: fallbackUser.department || 'Informatika',
        role: fallbackUser.role || 'mahasiswa',
        avatar_url: fallbackUser.avatar_url,
      });
    }

    try {
      const response = await api.get(`/api/v1/users/${userId}`);
      if (response.data?.data) {
        setProfileDetailUser(response.data.data);
      }
    } catch (err) {
      console.log("Menggunakan data fallback profil pengguna.");
    } finally {
      setIsLoadingProfile(false);
    }
  };

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

  // --- PURE REAL-TIME WEBSOCKET LISTENER (PUSHER CHANNELS AP1) ---
  useEffect(() => {
    if (!id) return;

    // 1. Fetch data barang awal 1x saja
    fetchItemDetail();

    // 2. Hubungkan ke Pusher WebSocket Channel Resmi User (Key: b829baf1ed757a809bf3, Cluster: ap1)
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY || "b829baf1ed757a809bf3";
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER || "ap1";

    const pusher = new Pusher(pusherKey, {
      cluster: pusherCluster,
    });

    const channelName = `item-discussion-${id}`;
    const channel = pusher.subscribe(channelName);

    const handleNewMessage = (data: any) => {
      const newMsg = data?.discussion || data;
      if (!newMsg || !newMsg.message) return;

      setItem((prev) => {
        if (!prev) return prev;
        const exists = prev.discussions.some(
          (d) =>
            (d.id && newMsg.id && d.id === newMsg.id) ||
            (d.message === newMsg.message && d.user?.name === newMsg.user?.name),
        );
        if (exists) return prev;
        return {
          ...prev,
          discussions: [...prev.discussions, newMsg],
        };
      });
    };

    channel.bind("new-discussion", handleNewMessage);
    channel.bind("discussion-posted", handleNewMessage);

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(channelName);
    };
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

  // --- HANDLER KIRIM PESAN OPTIMISTIS (INSTANT 0MS RESPONSE TANPA LOADING) ---
  const handleSendMessage = async () => {
    const text = chatMessage.trim();
    if (!text || !item || isCompleted) return;

    // 1. Ambil data user yang sedang login dari useAuthStore
    const currentUser = useAuthStore.getState().user;

    // 2. Buat pesan sementara (Optimistic Message)
    const tempId = Date.now();
    const optimisticMsg: Discussion = {
      id: tempId,
      message: text,
      created_at: new Date().toISOString(),
      user: {
        id: currentUser?.id ? Number(currentUser.id) || tempId : tempId,
        name: currentUser?.name || "Anda",
        avatar_url: currentUser?.avatar_url,
      },
    };

    // 3. SEGERA TAMPILKAN PESAN DI CHAT BUBBLE & KOSONGKAN INPUT (0ms INSTANT!)
    setChatMessage("");
    setItem((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        discussions: [...prev.discussions, optimisticMsg],
      };
    });

    // 4. Kirim ke API secara asynchronous di background tanpa memblokir UI
    try {
      const res = await api.post(`/api/v1/items/${id}/discussions`, {
        message: text,
      });

      if (res.data?.data) {
        const realMsg: Discussion = res.data.data;
        setItem((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            discussions: prev.discussions.map((m) =>
              m.id === tempId ? realMsg : m,
            ),
          };
        });
      }
    } catch (error: unknown) {
      console.error("Gagal mengirim pesan di background:", error);
      // Revert optimistic update jika gagal
      setItem((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          discussions: prev.discussions.filter((m) => m.id !== tempId),
        };
      });
      alert("Gagal mengirim pesan. Silakan periksa koneksi internet Anda.");
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
    if (!dateString) return "-";
    if (dateString.length <= 10 && dateString.includes("-")) {
      const parts = dateString.split("-");
      if (parts.length === 3) {
        const [year, month, day] = parts;
        const months = [
          "Januari", "Februari", "Maret", "April", "Mei", "Juni",
          "Juli", "Agustus", "September", "Oktober", "November", "Desember"
        ];
        return `${parseInt(day, 10)} ${months[parseInt(month, 10) - 1]} ${year}`;
      }
    }
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
            <div
              onClick={() =>
                handleOpenUserProfile(
                  (item as any).user_id || (item.reporter as any)?.id || "1",
                  item.reporter,
                )
              }
              className="p-3 bg-gray-50 dark:bg-gray-900/60 hover:bg-blue-50/50 dark:hover:bg-gray-800/80 cursor-pointer transition rounded-xl border border-gray-200 dark:border-gray-800 flex items-center justify-between gap-3 mb-5 group/reporter"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-primary/20 text-primary dark:text-blue-400 font-bold flex items-center justify-center text-sm flex-shrink-0 overflow-hidden border border-primary/30 group-hover/reporter:scale-105 transition">
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
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 font-medium">
                    Pelapor Barang (Klik Profil)
                  </p>
                  <p className="text-xs font-bold text-gray-900 dark:text-white truncate group-hover/reporter:text-blue-400 transition">
                    {item.reporter.name} ({item.reporter.email})
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-blue-500 bg-blue-500/10 px-2 py-1 rounded-lg flex-shrink-0">
                Lihat Detail →
              </span>
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
                  const msgUser = msg.user || {
                    id: "",
                    name: "Pengguna UISI",
                    email: "-",
                    department: "Informatika",
                    role: "Mahasiswa",
                    nim: "-",
                    avatar_url: null,
                  };
                  const isPelapor = msgUser.name === item.reporter?.name;
                  const isUserAdmin =
                    msgUser.role === "admin" ||
                    (msgUser.name && msgUser.name.toLowerCase().includes("administrator"));

                  return (
                    <div key={msg.id} className="flex gap-3 items-start">
                      {/* HOVER PROFILE TRIGGER & POPDOWN CARD */}
                      <div className="relative group/userpopover flex-shrink-0">
                        {msgUser.avatar_url ? (
                          <img
                            src={msgUser.avatar_url}
                            alt={msgUser.name}
                            onClick={() => handleOpenUserProfile(msgUser.id, msgUser)}
                            className="w-8 h-8 rounded-full object-cover shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer hover:ring-2 hover:ring-primary transition"
                          />
                        ) : (
                          <div
                            onClick={() => handleOpenUserProfile(msgUser.id, msgUser)}
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm cursor-pointer hover:ring-2 hover:ring-primary transition ${isUserAdmin ? "bg-purple-600" : isPelapor ? "bg-primary" : "bg-gray-500"}`}
                          >
                            {msgUser.name.charAt(0).toUpperCase()}
                          </div>
                        )}

                        {/* FLOATING HOVER USER PROFILE CARD */}
                        <div className="absolute left-0 top-10 hidden group-hover/userpopover:block z-50 w-72 bg-[#0c1322] text-white border-2 border-blue-500/50 rounded-2xl p-4 shadow-[0_15px_40px_rgba(0,0,0,0.7)] animate-in fade-in zoom-in-95 duration-150 pointer-events-auto">
                          <div className="flex items-center gap-3 pb-3 border-b border-gray-800">
                            <div className="w-11 h-11 rounded-xl bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center border border-blue-500/40 overflow-hidden text-base flex-shrink-0">
                              {msgUser.avatar_url ? (
                                <img
                                  src={msgUser.avatar_url}
                                  alt={msgUser.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                msgUser.name.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-sm text-white truncate flex items-center gap-1">
                                {msgUser.name}
                              </h4>
                              <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider inline-block mt-0.5">
                                {msgUser.role || (isUserAdmin ? "Admin" : "Mahasiswa")}
                              </span>
                            </div>
                          </div>

                          <div className="mt-3 space-y-2 text-xs">
                            <div className="flex items-center justify-between bg-gray-900/80 p-2 rounded-lg border border-gray-800">
                              <span className="text-gray-400 flex items-center gap-1.5 font-medium">
                                <GraduationCap size={13} className="text-blue-400" /> Departemen
                              </span>
                              <span className="font-bold text-gray-200 truncate max-w-[130px]">
                                {msgUser.department || "Informatika"}
                              </span>
                            </div>

                            <div className="flex items-center justify-between bg-gray-900/80 p-2 rounded-lg border border-gray-800">
                              <span className="text-gray-400 flex items-center gap-1.5 font-medium">
                                <CreditCard size={13} className="text-emerald-400" /> NIM / NIP
                              </span>
                              <span className="font-mono font-bold text-blue-300">
                                {msgUser.nim || (isUserAdmin ? "1988041201" : "3012210001")}
                              </span>
                            </div>

                            <div className="flex items-center justify-between bg-gray-900/80 p-2 rounded-lg border border-gray-800">
                              <span className="text-gray-400 flex items-center gap-1.5 font-medium">
                                <Mail size={13} className="text-amber-400" /> Email
                              </span>
                              <span
                                className="font-medium text-gray-300 truncate max-w-[140px]"
                                title={msgUser.email}
                              >
                                {msgUser.email || "-"}
                              </span>
                            </div>

                            <button
                              onClick={() => handleOpenUserProfile(msgUser.id, msgUser)}
                              className="w-full mt-2 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                            >
                              🔍 Detail Profile Pengguna
                            </button>

                            {user?.role === "admin" && !isUserAdmin && (
                              <button
                                onClick={() => {
                                  setSelectedSuspendUser({
                                    id: String(msgUser.id),
                                    name: msgUser.name,
                                    email: msgUser.email || "-",
                                    nim: msgUser.nim || "3012210001",
                                    department: msgUser.department || "Informatika",
                                    is_suspended: (msgUser as any).is_suspended || false,
                                    suspend_reason: (msgUser as any).suspend_reason || "",
                                  });
                                  setSuspendReason(
                                    (msgUser as any).suspend_reason ||
                                      "Berkata kotor dan menyebarkan informasi bohong di diskusi",
                                  );
                                  setIsSuspendModalOpen(true);
                                }}
                                className="w-full mt-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/40 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md"
                              >
                                <ShieldAlert size={14} />{" "}
                                {(msgUser as any).is_suspended
                                  ? "Buka Suspend Akun"
                                  : "Suspend Akun Mahasiswa"}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span
                            onClick={() => handleOpenUserProfile(msgUser.id, msgUser)}
                            className="font-bold text-xs text-gray-900 dark:text-white cursor-pointer hover:underline hover:text-blue-400 transition"
                          >
                            {msgUser.name} {isPelapor && "(Pelapor)"}
                          </span>
                          <span className="text-[10px] text-gray-500" suppressHydrationWarning>
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
                    if (e.key === "Enter" && !isCompleted) handleSendMessage();
                  }}
                  placeholder={
                    isCompleted
                      ? "Diskusi telah ditutup."
                      : "Tulis pertanyaan atau komentar..."
                  }
                  disabled={isCompleted}
                  className="w-full bg-gray-50 dark:bg-[#0b1120] border border-gray-200 dark:border-gray-700 rounded-lg pl-4 pr-12 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white transition-colors disabled:opacity-50"
                />
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-blue-700 p-2 transition-colors disabled:opacity-50"
                  disabled={!chatMessage.trim() || isCompleted}
                  onClick={handleSendMessage}
                >
                  <Send size={16} />
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

      {/* ================================================================= */}
      {/* 🚫 MODAL ADMIN SUSPEND AKUN MAHASISWA */}
      {/* ================================================================= */}
      {isSuspendModalOpen && selectedSuspendUser && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0d1527] border-2 border-red-500/50 rounded-2xl max-w-md w-full p-6 text-white shadow-[0_20px_50px_rgba(239,68,68,0.35)] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-500 border border-red-500/40 flex items-center justify-center font-bold">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    Suspend Akun Mahasiswa
                  </h3>
                  <p className="text-xs text-gray-400">
                    Moderasi & Penangguhan Akun
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSuspendModalOpen(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* User Info Header */}
              <div className="bg-gray-900/80 p-3.5 rounded-xl border border-gray-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-sm flex-shrink-0">
                  {selectedSuspendUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-sm text-white truncate">
                    {selectedSuspendUser.name}
                  </h4>
                  <p className="text-gray-400 text-[11px] font-mono">
                    NIM: {selectedSuspendUser.nim} • {selectedSuspendUser.department}
                  </p>
                  <p className="text-gray-400 text-[11px] truncate">
                    {selectedSuspendUser.email}
                  </p>
                </div>
              </div>

              {selectedSuspendUser.is_suspended ? (
                <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300">
                  <p className="font-bold mb-1 flex items-center gap-1.5 text-xs text-red-400">
                    <Ban size={15} /> Status Akun Saat Ini: DITANGGUHKAN (SUSPEND)
                  </p>
                  <p className="text-[11px] text-gray-300">
                    Alasan: {selectedSuspendUser.suspend_reason || "Pelanggaran aturan"}
                  </p>
                </div>
              ) : (
                <>
                  {/* Durasi Suspend */}
                  <div>
                    <label className="block text-gray-300 font-bold mb-1.5">
                      Durasi Penangguhan (Suspend):
                    </label>
                    <select
                      value={suspendDays}
                      onChange={(e) => setSuspendDays(Number(e.target.value))}
                      className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-red-500 outline-none"
                    >
                      <option value={1}>1 Hari</option>
                      <option value={3}>3 Hari</option>
                      <option value={7}>7 Hari (1 Minggu - Rekomendasi)</option>
                      <option value={30}>30 Hari (1 Bulan)</option>
                      <option value={36500}>Permanen / Selamanya</option>
                    </select>
                  </div>

                  {/* Alasan Suspend */}
                  <div>
                    <label className="block text-gray-300 font-bold mb-1.5">
                      Alasan Suspend <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={suspendReason}
                      onChange={(e) => setSuspendReason(e.target.value)}
                      placeholder="Contoh: Berkata kotor dan menyebarkan informasi bohong di kolom diskusi..."
                      className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl p-3 text-xs focus:ring-2 focus:ring-red-500 outline-none resize-none"
                    />
                  </div>
                </>
              )}

              {/* Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSuspendModalOpen(false)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded-xl font-bold transition"
                >
                  Batal
                </button>

                {selectedSuspendUser.is_suspended ? (
                  <button
                    type="button"
                    onClick={() => handleExecuteSuspend(0, "")}
                    disabled={isSuspending}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/30"
                  >
                    {isSuspending ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      "Unsuspend (Buka Akses)"
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleExecuteSuspend(suspendDays, suspendReason)}
                    disabled={isSuspending || !suspendReason.trim()}
                    className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-red-600/30"
                  >
                    {isSuspending ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      "Konfirmasi Suspend"
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 👤 MODAL USER PROFILE DETAIL (LENGKAP) */}
      {/* ================================================================= */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b1220] border-2 border-blue-500/40 rounded-3xl max-w-md w-full overflow-hidden text-white shadow-[0_25px_60px_rgba(0,0,0,0.85)] animate-in fade-in zoom-in-95 duration-200">
            {/* Header Cover Banner */}
            <div className="h-24 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative p-4 flex justify-end items-start">
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition backdrop-blur-sm"
              >
                <X size={18} />
              </button>
            </div>

            {/* Profile Content Body */}
            <div className="px-6 pb-6 pt-0 relative">
              {/* Avatar Picture Overlapping Banner */}
              <div className="flex justify-between items-end -mt-12 mb-4">
                <div className="w-24 h-24 rounded-2xl bg-[#090e1a] border-4 border-[#0b1220] overflow-hidden shadow-xl flex items-center justify-center text-3xl font-extrabold text-blue-400">
                  {profileDetailUser?.avatar_url ? (
                    <img
                      src={profileDetailUser.avatar_url}
                      alt={profileDetailUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    profileDetailUser?.name?.charAt(0).toUpperCase() || "U"
                  )}
                </div>

                <div className="flex flex-col items-end gap-1 mb-1">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded-full text-xs font-bold uppercase tracking-wider">
                    {profileDetailUser?.role === "admin" ? "Campus Admin" : "Mahasiswa Aktif"}
                  </span>

                  <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-semibold flex items-center gap-1">
                    <ShieldCheck size={12} /> Civitas UISI Verified
                  </span>
                </div>
              </div>

              {/* Name & Main Info */}
              <div className="mb-5">
                <h3 className="text-xl font-bold text-white tracking-tight">
                  {profileDetailUser?.name || "Nama Pengguna"}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Pengguna Terverifikasi Sistem Lost & Found Universitas Internasional Semen Indonesia
                </p>
              </div>

              {/* Detail Info Grid */}
              <div className="space-y-2.5 text-xs">
                {/* Departemen / Prodi */}
                <div className="p-3 bg-[#080d18] border border-gray-800 rounded-xl flex items-center justify-between">
                  <span className="text-gray-400 flex items-center gap-2 font-medium">
                    <GraduationCap size={15} className="text-blue-400" /> Program Studi / Departemen
                  </span>
                  <span className="font-bold text-gray-200">
                    {profileDetailUser?.department || "Informatika"}
                  </span>
                </div>

                {/* NIM / NIP */}
                <div className="p-3 bg-[#080d18] border border-gray-800 rounded-xl flex items-center justify-between">
                  <span className="text-gray-400 flex items-center gap-2 font-medium">
                    <CreditCard size={15} className="text-emerald-400" /> NIM / Nomor Induk
                  </span>
                  <span className="font-mono font-bold text-blue-300">
                    {profileDetailUser?.nim || "3012410044"}
                  </span>
                </div>

                {/* Email Kampus */}
                <div className="p-3 bg-[#080d18] border border-gray-800 rounded-xl flex items-center justify-between">
                  <span className="text-gray-400 flex items-center gap-2 font-medium">
                    <Mail size={15} className="text-amber-400" /> Email Resmi Kampus
                  </span>
                  <span className="font-medium text-gray-200 truncate max-w-[180px]">
                    {profileDetailUser?.email || "-"}
                  </span>
                </div>

                {/* Status Moderasi Akun */}
                <div className="p-3 bg-[#080d18] border border-gray-800 rounded-xl flex items-center justify-between">
                  <span className="text-gray-400 flex items-center gap-2 font-medium">
                    <Activity size={15} className="text-purple-400" /> Status Akun Sistem
                  </span>
                  {profileDetailUser?.is_suspended ? (
                    <span className="font-bold text-red-400 bg-red-500/20 border border-red-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Ban size={12} /> Ditangguhkan (Suspend)
                    </span>
                  ) : (
                    <span className="font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <CheckCircle2 size={12} /> Aktif Normal
                    </span>
                  )}
                </div>
              </div>

              {/* Statistics Activity Card */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="p-3 bg-blue-950/30 border border-blue-800/40 rounded-xl text-center">
                  <span className="text-[10px] text-blue-400 font-bold uppercase block tracking-wider">Total Laporan</span>
                  <span className="text-lg font-extrabold text-white mt-0.5 block">
                    {profileDetailUser?.reported_items_count ?? 0} Barang
                  </span>
                </div>

                <div className="p-3 bg-indigo-950/30 border border-indigo-800/40 rounded-xl text-center">
                  <span className="text-[10px] text-indigo-400 font-bold uppercase block tracking-wider">Total Klaim</span>
                  <span className="text-lg font-extrabold text-white mt-0.5 block">
                    {profileDetailUser?.submitted_claims_count ?? 0} Klaim
                  </span>
                </div>
              </div>

              {/* Admin Action Button if logged in user is admin */}
              {user?.role === "admin" && profileDetailUser?.role !== "admin" && (
                <button
                  onClick={() => {
                    if (!profileDetailUser) return;
                    setIsProfileModalOpen(false);
                    setSelectedSuspendUser({
                      id: String(profileDetailUser.id),
                      name: profileDetailUser.name,
                      email: profileDetailUser.email || "-",
                      nim: profileDetailUser.nim || "3012410044",
                      department: profileDetailUser.department || "Informatika",
                      is_suspended: profileDetailUser.is_suspended || false,
                      suspend_reason: profileDetailUser.suspend_reason || "",
                    });
                    setSuspendReason(
                      profileDetailUser.suspend_reason ||
                        "Berkata kotor dan menyebarkan informasi bohong di diskusi",
                    );
                    setIsSuspendModalOpen(true);
                  }}
                  className="w-full mt-4 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/40 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md"
                >
                  <ShieldAlert size={15} />{" "}
                  {profileDetailUser?.is_suspended
                    ? "Pencabutan Suspend (Unsuspend Akun)"
                    : "Suspend Akun Mahasiswa Ini"}
                </button>
              )}

              {/* Close Button */}
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="w-full mt-3 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded-xl text-xs font-bold transition"
              >
                Tutup Profil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
