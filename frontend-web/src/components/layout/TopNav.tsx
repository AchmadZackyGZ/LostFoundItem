"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  HelpCircle,
  User,
  Settings,
  Shield,
  LogOut,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  FileText,
  PhoneCall,
  ExternalLink,
  Info,
  X,
  Sparkles,
} from "lucide-react";
import clsx from "clsx";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/axios";

interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: string;
  is_read: boolean;
  action_url: string;
  created_at: string;
}

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  // --- STATE INTERAKTIF ---
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Notifications State & Global Floating Toast Alert
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toastNotif, setToastNotif] = useState<AppNotification | null>(null);

  const notifRef = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);
  const knownNotifIdsRef = useRef<Set<string>>(new Set());
  const isInitialFetchRef = useRef<boolean>(true);

  const navLinks = [
    { name: "Dasbor", href: "/" },
    { name: "Barang", href: "/items" },
    { name: "Aktivitas", href: "/activity" },
    { name: "Laporan", href: "/reports" },
  ];

  // --- AMBIL DATA NOTIFIKASI DINAMIS & PROSES FLOATING TOAST ALERT ---
  const fetchNotifications = async () => {
    try {
      const res = await api.get("/api/v1/notifications");
      const rawList: AppNotification[] = res.data.data || [];

      // 🚫 EXCLUDE NOTIFIKASI DISKUSI/CHAT: Filter notifikasi bertipe 'discussion' agar tidak penuhi lonceng & toast
      const notifList = rawList.filter(
        (n) => n.type !== "discussion" && !n.title.toLowerCase().includes("diskusi"),
      );

      setNotifications(notifList);

      const unreadList = notifList.filter((n) => !n.is_read);
      setUnreadCount(unreadList.length);

      if (isInitialFetchRef.current) {
        notifList.forEach((n) => knownNotifIdsRef.current.add(n.id));
        isInitialFetchRef.current = false;
      } else {
        // Polling lanjutan: cari notifikasi baru (bukan diskusi) yang belum pernah muncul
        const newUnread = unreadList.find(
          (n) => !knownNotifIdsRef.current.has(n.id),
        );
        if (newUnread) {
          knownNotifIdsRef.current.add(newUnread.id);
          setToastNotif(newUnread);
          setTimeout(() => setToastNotif(null), 8000);
        }
      }
    } catch {
      setNotifications([]);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Close Popovers on Click Outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setIsNotifOpen(false);
      }
      if (helpRef.current && !helpRef.current.contains(event.target as Node)) {
        setIsHelpOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Tandai Semua Dibaca
  const handleMarkAllRead = async () => {
    try {
      await api.put("/api/v1/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Gagal menandai semua dibaca:", err);
    }
  };

  // Tandai 1 Dibaca & Navigasi
  const handleNotifClick = async (notif: AppNotification) => {
    if (!notif.is_read) {
      try {
        await api.put(`/api/v1/notifications/${notif.id}/read`);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n)),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error(err);
      }
    }
    setIsNotifOpen(false);
    if (notif.action_url) {
      router.push(notif.action_url);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    const names = name.trim().split(" ");
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // FAQ Data List
  const faqList = [
    {
      question: "Bagaimana cara melaporkan barang yang hilang?",
      answer:
        "Buka menu 'Lapor Barang' di pojok kanan atas, pilih tab 'Lapor Kehilangan', lalu tentukan titik lokasi presisi menggunakan Peta Interaktif / GPS, sertakan deskripsi dan minimal 1 foto barang.",
    },
    {
      question: "Bagaimana cara melakukan klaim barang temuan?",
      answer:
        "Buka menu 'Barang', cari laporan barang temuan yang cocok dengan milik Anda, buka detailnya lalu klik tombol 'Ini Barang Saya (Klaim)'. Anda wajib melampirkan deskripsi atau foto bukti kepemilikan.",
    },
    {
      question: "Berapa lama laporan baru disetujui oleh Admin?",
      answer:
        "Laporan yang baru saja Anda buat akan masuk ke antrean validasi Admin kampus UISI terlebih dahulu (status Pending). Validasi biasanya diproses dalam kurun waktu 1x24 jam.",
    },
    {
      question: "Bagaimana cara memverifikasi WhatsApp OTP?",
      answer:
        "Buka halaman Profil Anda (klik inisial nama di navbar), masukkan nomor telepon Anda, klik 'Kirim Kode OTP via WhatsApp', lalu masukkan 6-digit kode unik yang dikirimkan oleh bot WhatsApp Fonnte Gateway.",
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-surface dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 backdrop-blur-md">
      <div className="container mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-xl font-bold text-primary dark:text-blue-400 flex items-center gap-2"
          >
            Lost Found Uisi
          </Link>

          {/* Menu Navigasi Utama Desktop */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600 dark:text-gray-300">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={clsx(
                    "py-5 transition-colors border-b-2 font-semibold",
                    isActive
                      ? "text-primary dark:text-blue-400 border-primary dark:border-blue-400"
                      : "border-transparent hover:text-primary dark:hover:text-blue-400",
                  )}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (user?.role === "admin") {
                alert("admin tidak bisa membuat laporan barang kehilangan dan laporan menemukan barang");
                router.push("/admin");
              } else {
                router.push("/report");
              }
            }}
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 transition hidden sm:block shadow-md shadow-blue-900/20"
          >
            + Lapor Barang
          </button>

          {/* ================================================================= */}
          {/* 🔔 INTERACTIVE NOTIFICATION POPDOWN DROPDOWN (TOMBOL LONCENG) */}
          {/* ================================================================= */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setIsNotifOpen(!isNotifOpen);
                setIsHelpOpen(false);
              }}
              className="relative p-2 text-gray-500 hover:text-primary dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/60"
              title="Notifikasi Aktivitas"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-gray-900 animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-surface dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Header Dropdown */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/70 dark:bg-gray-900/40">
                  <div className="flex items-center gap-2">
                    <Bell
                      size={16}
                      className="text-primary dark:text-blue-400"
                    />
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                      Notifikasi
                    </h3>
                    {unreadCount > 0 && (
                      <span className="bg-red-100 text-red-600 dark:bg-red-900/40 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {unreadCount} baru
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-primary dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
                    >
                      <CheckCheck size={14} /> Tandai Dibaca
                    </button>
                  )}
                </div>

                {/* Notifications List */}
                <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-xs text-gray-400 font-medium">
                      Belum ada notifikasi terbaru.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleNotifClick(notif)}
                        className={clsx(
                          "p-4 cursor-pointer transition-colors flex gap-3 items-start hover:bg-gray-50 dark:hover:bg-gray-800/50",
                          !notif.is_read
                            ? "bg-blue-50/50 dark:bg-blue-900/10"
                            : "bg-transparent",
                        )}
                      >
                        <div
                          className={clsx(
                            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold shadow-sm",
                            notif.type === "report"
                              ? "bg-blue-500"
                              : notif.type === "claim"
                                ? "bg-amber-500"
                                : "bg-emerald-500",
                          )}
                        >
                          {notif.type === "report" ? (
                            <FileText size={14} />
                          ) : notif.type === "claim" ? (
                            <Info size={14} />
                          ) : (
                            <Bell size={14} />
                          )}
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="flex justify-between items-baseline mb-0.5">
                            <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                              {notif.title}
                            </h4>
                            <span className="text-[10px] text-gray-400 flex-shrink-0">
                              {new Date(notif.created_at).toLocaleTimeString(
                                "id-ID",
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 leading-snug">
                            {notif.body}
                          </p>
                        </div>
                        {!notif.is_read && (
                          <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Footer Dropdown */}
                <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-900/40 text-center">
                  <Link
                    href="/activity"
                    onClick={() => setIsNotifOpen(false)}
                    className="text-xs font-bold text-primary dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                  >
                    Lihat Seluruh Aktivitas & Riwayat →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* ================================================================= */}
          {/* ❓ INTERACTIVE HELP & FAQ POPDOWN DROPDOWN (TOMBOL TANDA TANYA) */}
          {/* ================================================================= */}
          <div className="relative" ref={helpRef}>
            <button
              onClick={() => {
                setIsHelpOpen(!isHelpOpen);
                setIsNotifOpen(false);
              }}
              className="p-2 text-gray-500 hover:text-primary dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/60 hidden sm:block"
              title="Pusat Bantuan & Panduan"
            >
              <HelpCircle size={20} />
            </button>

            {isHelpOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-surface dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Header Dropdown */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/70 dark:bg-gray-900/40">
                  <div className="flex items-center gap-2">
                    <HelpCircle
                      size={16}
                      className="text-primary dark:text-blue-400"
                    />
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                      Panduan & Pusat Bantuan
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsHelpOpen(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* FAQ Accordion Content */}
                <div className="p-4 max-h-80 overflow-y-auto space-y-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-2">
                    Pertanyaan yang Sering Diajukan (FAQ):
                  </p>

                  {faqList.map((faq, idx) => (
                    <div
                      key={idx}
                      className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-gray-50/50 dark:bg-gray-900/30"
                    >
                      <button
                        onClick={() =>
                          setExpandedFaq(expandedFaq === idx ? null : idx)
                        }
                        className="w-full p-3 text-left font-bold text-xs text-gray-900 dark:text-white flex justify-between items-center gap-2"
                      >
                        <span>{faq.question}</span>
                        {expandedFaq === idx ? (
                          <ChevronUp size={14} className="text-primary" />
                        ) : (
                          <ChevronDown size={14} className="text-gray-400" />
                        )}
                      </button>
                      {expandedFaq === idx && (
                        <div className="px-3 pb-3 text-xs text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-100 dark:border-gray-800/80 pt-2 font-medium">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Direct Contact Support Box */}
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/60 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PhoneCall
                        size={16}
                        className="text-primary dark:text-blue-400"
                      />
                      <div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white">
                          Butuh Bantuan CS Satpam?
                        </p>
                        <p className="text-[10px] text-gray-500">
                          Hubungi Pos Satpam UISI via WhatsApp
                        </p>
                      </div>
                    </div>
                    <a
                      href="https://wa.me/62895630205913?text=Halo%20Satpam%20Lost%20Found%20UISI,%20saya%20butuh%20bantuan"
                      target="_blank"
                      rel="noreferrer"
                      className="bg-primary text-white text-[11px] font-bold px-3 py-1.5 rounded-lg hover:bg-blue-800 transition flex items-center gap-1"
                    >
                      Chat WA <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ================================================================= */}
          {/* 👤 USER PROFILE DROPDOWN MENU */}
          {/* ================================================================= */}
          <div className="relative group">
            <Link
              href="/profile"
              className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden cursor-pointer shadow-sm border border-gray-300 dark:border-gray-600 transition group-hover:ring-2 group-hover:ring-primary/50 relative z-10"
            >
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                  {getInitials(user?.name)}
                </span>
              )}
            </Link>

            {/* Dropdown Menu (Slide Down on Hover) */}
            <div className="absolute right-0 top-full pt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 translate-y-2 group-hover:translate-y-0">
              <div className="bg-surface dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col overflow-hidden">
                {/* Header Dropdown: Informasi Utama */}
                <div className="p-5 flex flex-col items-center border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20">
                  <div className="w-14 h-14 bg-primary/10 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3 border border-primary/20 dark:border-blue-500/30 overflow-hidden">
                    {user?.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span className="text-lg font-bold text-primary dark:text-blue-400">
                        {getInitials(user?.name)}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base text-center line-clamp-1">
                    {user?.name || "Pengguna UISI"}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">
                    {user?.department || "Belum ada prodi"}
                  </p>
                  <span className="bg-blue-50 dark:bg-blue-900/20 text-primary dark:text-blue-400 border border-blue-100 dark:border-blue-800 text-[10px] font-semibold px-2.5 py-0.5 rounded-full capitalize">
                    {user?.role || "Mahasiswa"}
                  </span>
                </div>

                {/* List Menu Links */}
                <div className="flex flex-col py-2">
                  {user?.role === "admin" && (
                    <>
                      <Link
                        href="/admin"
                        className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors border-l-4 border-blue-600 dark:border-blue-400"
                      >
                        <Shield size={16} /> Admin Command Center
                      </Link>
                      <div className="h-px bg-gray-100 dark:bg-gray-800 w-full my-1"></div>
                    </>
                  )}

                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary dark:hover:text-blue-400 transition-colors"
                  >
                    <User size={16} /> Informasi Pribadi
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary dark:hover:text-blue-400 transition-colors"
                  >
                    <Shield size={16} /> Keamanan & Password
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary dark:hover:text-blue-400 transition-colors"
                  >
                    <Settings size={16} /> Pengaturan Notifikasi
                  </Link>
                  <div className="h-px bg-gray-100 dark:bg-gray-800 w-full my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-danger dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors w-full text-left"
                  >
                    <LogOut size={16} /> Keluar (Logout)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 🔔 GLOBAL FLOATING TOAST ALERT BANNER (MENGAMBANG POJOK KANAN ATAS) */}
      {/* ================================================================= */}
      {toastNotif && (
        <div className="fixed top-20 right-5 z-[9999] max-w-md w-full bg-[#0d1527] text-white border-2 border-emerald-500 rounded-2xl p-4 shadow-[0_10px_40px_rgba(16,185,129,0.35)] animate-in fade-in slide-in-from-top-5 duration-300 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center flex-shrink-0 font-bold">
            <Bell size={20} className="animate-bounce" />
          </div>

          <div
            className="flex-1 min-w-0 cursor-pointer"
            onClick={() => handleNotifClick(toastNotif)}
          >
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-bold text-sm text-emerald-400 flex items-center gap-1.5 truncate">
                <Sparkles size={14} /> {toastNotif.title}
              </h4>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold flex-shrink-0">
                BARU
              </span>
            </div>
            <p className="text-xs text-gray-200 mt-1 line-clamp-2 leading-relaxed">
              {toastNotif.body}
            </p>
            <p className="text-[10px] text-blue-400 font-bold mt-1.5 flex items-center gap-1 hover:underline">
              Klik untuk membuka laporan <ExternalLink size={10} />
            </p>
          </div>

          <button
            onClick={() => setToastNotif(null)}
            className="text-gray-400 hover:text-white p-1 rounded-lg transition"
          >
            <X size={18} />
          </button>
        </div>
      )}
    </header>
  );
}
