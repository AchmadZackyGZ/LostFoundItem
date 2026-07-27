"use client";

import { useEffect, useState } from "react";
import {
  User as UserIcon,
  Settings,
  Shield,
  LogOut,
  Mail,
  Phone,
  Package,
  CheckCircle2,
  Edit3,
  Loader2,
  Save,
  Lock,
  Bell,
  Check,
  AlertCircle,
  Building2,
} from "lucide-react";
import clsx from "clsx";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  department?: string;
  phone?: string;
  role: string;
  nim?: string;
}

export default function ProfilePage() {
  const router = useRouter();

  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<"info" | "security" | "notifications">("info");

  // User Profile & Stats State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [reportsCount, setReportsCount] = useState<number>(0);
  const [completedCount, setCompletedCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Form States - Information
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [infoForm, setInfoForm] = useState({
    name: "",
    department: "",
    phone: "",
  });
  const [isSavingInfo, setIsSavingInfo] = useState(false);

  // Form States - Password
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Form States - Notifications
  const [notifSettings, setNotifSettings] = useState({
    emailNotif: true,
    discussionNotif: true,
    systemNotif: true,
  });

  // Alert Feedback
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Fetch User & Stats
  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        const [meRes, itemsRes] = await Promise.all([
          api.get("/api/auth/me"),
          api.get("/api/v1/my-items"),
        ]);

        if (isMounted) {
          const userData = meRes.data;
          setUser(userData);
          setInfoForm({
            name: userData.name || "",
            department: userData.department || "",
            phone: userData.phone || "",
          });

          const myItems = itemsRes.data?.data || [];
          setReportsCount(myItems.length);
          setCompletedCount(
            myItems.filter((item: { status: string }) => item.status === "completed").length,
          );
        }
      } catch (err) {
        console.error("Gagal mengambil data profil:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle Update Personal Information
  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsSavingInfo(true);

    try {
      const res = await api.put("/api/auth/profile", infoForm);
      setUser(res.data.user);
      setIsEditingInfo(false);
      setFeedback({
        type: "success",
        message: "Informasi pribadi berhasil diperbarui!",
      });
    } catch (err: unknown) {
      console.error("Gagal memperbarui profil:", err);
      setFeedback({
        type: "error",
        message: "Gagal memperbarui informasi pribadi. Periksa kembali input Anda.",
      });
    } finally {
      setIsSavingInfo(false);
    }
  };

  // Handle Update Password
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      setFeedback({
        type: "error",
        message: "Konfirmasi password baru tidak cocok.",
      });
      return;
    }

    setIsSavingPassword(true);

    try {
      await api.put("/api/auth/password", passwordForm);
      setPasswordForm({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
      });
      setFeedback({
        type: "success",
        message: "Password Anda berhasil diperbarui!",
      });
    } catch (err: unknown) {
      console.error("Gagal mengubah password:", err);
      setFeedback({
        type: "error",
        message: "Password saat ini tidak sesuai atau format password kurang kuat.",
      });
    } finally {
      setIsSavingPassword(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.clear();
      router.push("/login");
    }
  };

  // Helper Inisial Nama
  const getInitials = (name?: string) => {
    if (!name) return "AZ";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[70vh] text-gray-900 dark:text-white gap-3">
        <Loader2 className="animate-spin text-primary" size={32} />
        <p className="text-sm font-medium">Memuat profil pengguna...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-10 max-w-6xl">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Profil Saya
      </h1>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={clsx(
            "mb-6 p-4 rounded-xl text-sm font-medium flex items-center justify-between shadow-sm border",
            feedback.type === "success"
              ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
          )}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <Check size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs opacity-70 hover:opacity-100"
          >
            Tutup
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kolom Kiri: Card Profil & Navigasi Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Main Profile Card */}
          <div className="bg-surface dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-2xl p-6 text-center shadow-sm">
            <div className="w-24 h-24 bg-primary/10 dark:bg-blue-900/30 rounded-full mx-auto flex items-center justify-center mb-4 relative border-2 border-primary/20 dark:border-blue-500/30">
              <span className="text-3xl font-bold text-primary dark:text-blue-400">
                {getInitials(user?.name)}
              </span>
              <button
                onClick={() => {
                  setActiveTab("info");
                  setIsEditingInfo(true);
                }}
                className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full shadow-md hover:bg-blue-800 transition"
                title="Edit Profil"
              >
                <Edit3 size={14} />
              </button>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              {user?.name || "Nama Pengguna"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {user?.department || "Program Studi"}
            </p>
            <span className="bg-blue-50 dark:bg-blue-900/20 text-primary dark:text-blue-400 border border-blue-100 dark:border-blue-800 text-xs font-semibold px-3 py-1 rounded-full capitalize">
              {user?.role || "Mahasiswa"}
            </span>
          </div>

          {/* Sidebar Menu Navigasi */}
          <div className="bg-surface dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="flex flex-col">
              <button
                onClick={() => {
                  setActiveTab("info");
                  setFeedback(null);
                }}
                className={clsx(
                  "flex items-center gap-3 px-6 py-4 text-sm font-medium transition text-left",
                  activeTab === "info"
                    ? "text-primary dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10 border-l-4 border-primary dark:border-blue-400 font-bold"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/50",
                )}
              >
                <UserIcon size={18} /> Informasi Pribadi
              </button>
              <button
                onClick={() => {
                  setActiveTab("security");
                  setFeedback(null);
                }}
                className={clsx(
                  "flex items-center gap-3 px-6 py-4 text-sm font-medium transition text-left",
                  activeTab === "security"
                    ? "text-primary dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10 border-l-4 border-primary dark:border-blue-400 font-bold"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/50",
                )}
              >
                <Shield size={18} /> Keamanan & Password
              </button>
              <button
                onClick={() => {
                  setActiveTab("notifications");
                  setFeedback(null);
                }}
                className={clsx(
                  "flex items-center gap-3 px-6 py-4 text-sm font-medium transition text-left",
                  activeTab === "notifications"
                    ? "text-primary dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10 border-l-4 border-primary dark:border-blue-400 font-bold"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/50",
                )}
              >
                <Settings size={18} /> Pengaturan Notifikasi
              </button>
              <div className="h-px bg-gray-100 dark:bg-gray-800 w-full"></div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-6 py-4 text-sm font-medium text-danger dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition w-full text-left font-semibold"
              >
                <LogOut size={18} /> Keluar (Logout)
              </button>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Detail Informasi & Konten Tab */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Summary Header */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-surface dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-2xl p-6 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 text-primary dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                <Package size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total Laporan Anda
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {reportsCount}
                </p>
              </div>
            </div>
            <div className="bg-surface dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-2xl p-6 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Barang Dikembalikan
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {completedCount}
                </p>
              </div>
            </div>
          </div>

          {/* TAB 1: INFORMASI PRIBADI */}
          {activeTab === "info" && (
            <div className="bg-surface dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Informasi Pribadi
                </h3>
                {!isEditingInfo ? (
                  <button
                    onClick={() => setIsEditingInfo(true)}
                    className="text-sm font-semibold text-primary dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <Edit3 size={15} /> Edit Data
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsEditingInfo(false);
                      setInfoForm({
                        name: user?.name || "",
                        department: user?.department || "",
                        phone: user?.phone || "",
                      });
                    }}
                    className="text-sm font-semibold text-gray-500 hover:underline"
                  >
                    Batal
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveInfo} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Nama Lengkap *
                    </label>
                    {isEditingInfo ? (
                      <input
                        type="text"
                        value={infoForm.name}
                        onChange={(e) =>
                          setInfoForm({ ...infoForm, name: e.target.value })
                        }
                        required
                        className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 outline-none"
                      />
                    ) : (
                      <div className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700/60 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white font-medium">
                        {user?.name}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Program Studi
                    </label>
                    {isEditingInfo ? (
                      <input
                        type="text"
                        value={infoForm.department}
                        onChange={(e) =>
                          setInfoForm({ ...infoForm, department: e.target.value })
                        }
                        className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 outline-none"
                        placeholder="Contoh: Ilmu Komputer"
                      />
                    ) : (
                      <div className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700/60 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white flex items-center gap-2 font-medium">
                        <Building2 size={16} className="text-gray-400" />
                        {user?.department || "Belum diisi"}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Alamat Email (Tetap)
                  </label>
                  <div className="w-full bg-gray-100 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 cursor-not-allowed">
                    <Mail size={16} className="text-gray-400" />
                    {user?.email}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Nomor Telepon / WhatsApp
                  </label>
                  {isEditingInfo ? (
                    <input
                      type="text"
                      value={infoForm.phone}
                      onChange={(e) =>
                        setInfoForm({ ...infoForm, phone: e.target.value })
                      }
                      placeholder="+62 812-3456-7890"
                      className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 outline-none"
                    />
                  ) : (
                    <div className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700/60 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white flex items-center gap-2 font-medium">
                      <Phone size={16} className="text-gray-400" />
                      {user?.phone || "Belum diisi"}
                    </div>
                  )}
                </div>

                {isEditingInfo && (
                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSavingInfo}
                      className="bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 transition flex items-center gap-2 shadow-sm disabled:opacity-50"
                    >
                      {isSavingInfo ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Save size={16} />
                      )}
                      {isSavingInfo ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* TAB 2: KEAMANAN & PASSWORD */}
          {activeTab === "security" && (
            <div className="bg-surface dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Keamanan & Password
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Perbarui kata sandi Anda secara berkala untuk menjaga keamanan akun.
              </p>

              <form onSubmit={handleSavePassword} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Password Saat Ini *
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={passwordForm.current_password}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          current_password: e.target.value,
                        })
                      }
                      required
                      placeholder="Masukkan password saat ini"
                      className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 outline-none"
                    />
                    <Lock
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Password Baru * (Min. 8 karakter)
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={passwordForm.new_password}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          new_password: e.target.value,
                        })
                      }
                      required
                      placeholder="Masukkan password baru"
                      className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 outline-none"
                    />
                    <Lock
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Konfirmasi Password Baru *
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={passwordForm.new_password_confirmation}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          new_password_confirmation: e.target.value,
                        })
                      }
                      required
                      placeholder="Ulangi password baru"
                      className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 outline-none"
                    />
                    <Lock
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSavingPassword}
                    className="bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 transition flex items-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    {isSavingPassword ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Shield size={16} />
                    )}
                    {isSavingPassword ? "Memproses..." : "Perbarui Password"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: PENGATURAN NOTIFIKASI */}
          {activeTab === "notifications" && (
            <div className="bg-surface dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Pengaturan Notifikasi
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Atur preferensi pemberitahuan email dan notifikasi sistem Anda.
              </p>

              <div className="space-y-6">
                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                      Notifikasi Email Laporan & Klaim
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Terima email saat laporan barang Anda disetujui atau klaim diverifikasi admin.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifSettings.emailNotif}
                    onChange={(e) =>
                      setNotifSettings({
                        ...notifSettings,
                        emailNotif: e.target.checked,
                      })
                    }
                    className="w-5 h-5 text-primary rounded focus:ring-primary cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                      Notifikasi Diskusi & Komentar
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Beritahu saya saat seseorang membalas komentar atau bertanya di laporan saya.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifSettings.discussionNotif}
                    onChange={(e) =>
                      setNotifSettings({
                        ...notifSettings,
                        discussionNotif: e.target.checked,
                      })
                    }
                    className="w-5 h-5 text-primary rounded focus:ring-primary cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                      Pengumuman Sistem & Kampus
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Dapatkan info pembaruan fitur aplikasi dan pemberitahuan penting.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifSettings.systemNotif}
                    onChange={(e) =>
                      setNotifSettings({
                        ...notifSettings,
                        systemNotif: e.target.checked,
                      })
                    }
                    className="w-5 h-5 text-primary rounded focus:ring-primary cursor-pointer"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={() =>
                      setFeedback({
                        type: "success",
                        message: "Preferensi notifikasi berhasil disimpan!",
                      })
                    }
                    className="bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 transition flex items-center gap-2 shadow-sm"
                  >
                    <Bell size={16} />
                    Simpan Preferensi
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
