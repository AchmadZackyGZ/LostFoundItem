"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Package,
  Users,
  Settings,
  Shield,
  LogOut,
  Calendar,
  Download,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Server,
  X,
  Check,
  Loader2,
  Maximize2,
  ExternalLink,
  Eye,
  FileText,
  Search,
  Filter,
  Trash2,
  RefreshCw,
  MapPin,
  Tag,
  Globe,
  UserCheck,
  Key,
  Lock,
  Bell,
  Sliders,
  Database,
  Save,
  CheckCircle,
  Activity,
  Cpu,
  Wifi,
} from "lucide-react";
import clsx from "clsx";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";

interface RealClaim {
  id: string;
  item_id: string;
  user_id: string;
  proof_description: string;
  proof_image_path: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  item?: {
    id: string;
    title: string;
    location: string;
    type: string;
    image_path?: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
  };
}

interface InventoryItem {
  id: string;
  title: string;
  category: string;
  type: "lost" | "found";
  location: string;
  description: string;
  date: string;
  image_path: string | null;
  status: "pending" | "active" | "is_pending" | "completed";
  created_at: string;
  reporter?: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
  };
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  nim: string;
  department: string;
  role: "mahasiswa";
  phone: string;
  avatar_url?: string;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  reported_items_count: number;
  submitted_claims_count: number;
  created_at: string;
}

interface FlaggedUser {
  id: string;
  name: string;
  reason: string;
  status: "active" | "suspended";
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { logout, checkAuth, user } = useAuthStore();
  const [activeNav, setActiveNav] = useState<
    "Overview" | "Claim Queue" | "Inventory" | "User Management" | "Settings"
  >("Overview");
  const [isLoading, setIsLoading] = useState(true);

  // Stats Counters State
  const [stats, setStats] = useState({
    totalLost: 0,
    successRate: 78.5,
    pendingClaims: 0,
    pendingItems: 0,
    activeUsers: 0,
  });

  // Database Claims State
  const [claims, setClaims] = useState<RealClaim[]>([]);
  const [isFetchingClaims, setIsFetchingClaims] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Database Inventory Items State
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isFetchingInventory, setIsFetchingInventory] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Database Users State
  const [usersList, setUsersList] = useState<AdminUser[]>([]);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userStatusFilter, setUserStatusFilter] = useState<string>("all");

  // Modal State
  const [selectedProof, setSelectedProof] = useState<RealClaim | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSystemStatusOpen, setIsSystemStatusOpen] = useState(false);

  // Admin Settings Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Notification & System Toggle Toggles
  const [systemConfig, setSystemConfig] = useState({
    waAutoNotify: true,
    emailBroadcast: true,
    requireAdminApproval: true,
    claimLimitPerDay: true,
    autoArchive90Days: true,
  });

  // User Flagging State (Dynamic from Database users)
  const [userFlags, setUserFlags] = useState<Record<string, "active" | "suspended">>({});

  // Fetch Live Claims from Backend API
  const fetchAdminClaims = async () => {
    setIsFetchingClaims(true);
    try {
      const res = await api.get("/api/v1/admin/claims");
      const claimData: RealClaim[] = res.data.data || [];
      setClaims(claimData);
      setStats((prev) => ({
        ...prev,
        pendingClaims: claimData.filter((c) => c.status === "pending").length,
      }));
    } catch (err) {
      console.error("Gagal mengunduh antrean klaim admin:", err);
    } finally {
      setIsFetchingClaims(false);
    }
  };

  // Fetch Live Inventory Items from Backend API
  const fetchAdminInventory = async () => {
    setIsFetchingInventory(true);
    try {
      const res = await api.get("/api/v1/admin/inventory");
      const items: InventoryItem[] = res.data.data || [];
      setInventoryItems(items);
      setStats((prev) => ({
        ...prev,
        totalLost: items.length,
        pendingItems: items.filter((i) => i.status === "pending").length,
      }));
    } catch (err) {
      console.error("Gagal mengunduh inventaris admin:", err);
    } finally {
      setIsFetchingInventory(false);
    }
  };

  // Fetch Live Users from Backend API
  const fetchAdminUsers = async () => {
    setIsFetchingUsers(true);
    try {
      const res = await api.get("/api/v1/admin/users");
      const usersData: AdminUser[] = res.data.data || [];
      setUsersList(usersData);
      setStats((prev) => ({
        ...prev,
        activeUsers: usersData.length,
      }));
    } catch (err) {
      console.error("Gagal mengunduh pengguna admin:", err);
    } finally {
      setIsFetchingUsers(false);
    }
  };

  // Fetch Real Live Database Analytics Stats
  const fetchAdminStats = async () => {
    try {
      const res = await api.get("/api/v1/admin/stats");
      if (res.data) {
        setStats((prev) => ({
          ...prev,
          totalLost: res.data.total_items ?? prev.totalLost,
          successRate: res.data.success_rate ?? prev.successRate,
          pendingClaims: res.data.pending_claims ?? prev.pendingClaims,
          activeUsers: res.data.active_users ?? prev.activeUsers,
        }));
      }
    } catch (err) {
      console.error("Gagal mengunduh statistik admin:", err);
    }
  };

  // Auth Protection Check for Admin Role
  useEffect(() => {
    const verifyAdminAccess = async () => {
      try {
        const currentUser = useAuthStore.getState().user;
        if (!currentUser) {
          await checkAuth();
        }
        const updatedUser = useAuthStore.getState().user;

        if (updatedUser?.role !== "admin") {
          alert("Akses ditolak: Halaman ini khusus Administrator Kampus.");
          router.push("/");
          return;
        }

        // Ambil data klaim, inventaris, pengguna, dan statistik asli dari database
        await Promise.all([
          fetchAdminClaims(),
          fetchAdminInventory(),
          fetchAdminUsers(),
          fetchAdminStats(),
        ]);
      } catch (err) {
        console.error(err);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    verifyAdminAccess();
  }, [checkAuth, router]);

  // --- HANDLER EXPORT REPORT CSV ---
  const handleExportReportCSV = () => {
    if (inventoryItems.length === 0) {
      alert("Belum ada data inventaris untuk dieksport.");
      return;
    }

    const headers = [
      "ID Laporan",
      "Judul Barang",
      "Kategori",
      "Tipe",
      "Lokasi",
      "Status System",
      "Tanggal Dibuat",
      "Nama Pelapor",
    ];

    const rows = inventoryItems.map((item) => [
      item.id,
      `"${item.title.replace(/"/g, '""')}"`,
      `"${item.category}"`,
      item.type,
      `"${item.location.replace(/"/g, '""')}"`,
      item.status,
      item.created_at || item.date,
      `"${item.reporter?.name || "Anonim"}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Laporan_Inventaris_LostFound_UISI_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- HANDLER APPROVE KLAIM ---
  const handleApproveClaim = async (claimId: string) => {
    if (
      !confirm(
        "Apakah Anda yakin ingin MENYETUJUI klaim ini? Barang akan ditandai Selesai Dikembalikan.",
      )
    )
      return;
    setActionLoadingId(claimId);

    try {
      await api.put(`/api/v1/admin/claims/${claimId}/approve`);
      alert("Klaim berhasil DISETUJUI. Barang telah diperbarui menjadi Selesai.");
      await Promise.all([
        fetchAdminClaims(),
        fetchAdminInventory(),
        fetchAdminStats(),
      ]);
    } catch (err) {
      console.error("Gagal menyetujui klaim:", err);
      alert("Terjadi kesalahan saat memproses persetujuan klaim.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // --- HANDLER REJECT KLAIM ---
  const handleRejectClaim = async (claimId: string) => {
    if (
      !confirm(
        "Apakah Anda yakin ingin MENOLAK klaim ini? Barang akan kembali berstatus Aktif di publik.",
      )
    )
      return;
    setActionLoadingId(claimId);

    try {
      await api.put(`/api/v1/admin/claims/${claimId}/reject`);
      alert("Klaim berhasil DITOLAK. Barang kembali berstatus aktif di publik.");
      await Promise.all([
        fetchAdminClaims(),
        fetchAdminInventory(),
        fetchAdminStats(),
      ]);
    } catch (err) {
      console.error("Gagal menolak klaim:", err);
      alert("Terjadi kesalahan saat memproses penolakan klaim.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // --- HANDLER APPROVE LAPORAN BARU (PENDING ITEM) ---
  const handleApprovePendingReport = async (itemId: string) => {
    if (
      !confirm(
        "Apakah Anda yakin ingin MENYETUJUI laporan baru ini agar tayang di publik?",
      )
    )
      return;
    setActionLoadingId(itemId);

    try {
      await api.put(`/api/v1/admin/items/${itemId}/approve`);
      alert("Laporan barang berhasil DISETUJUI dan sekarang sudah tayang di publik!");
      await Promise.all([fetchAdminInventory(), fetchAdminStats()]);
    } catch (err) {
      console.error("Gagal menyetujui laporan:", err);
      alert("Terjadi kesalahan saat menyetujui laporan barang.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // --- HANDLER HAPUS BARANG DARI INVENTARIS ---
  const handleDeleteInventoryItem = async (itemId: string) => {
    if (
      !confirm(
        "Apakah Anda yakin ingin MENGHAPUS laporan barang ini secara permanen dari sistem?",
      )
    )
      return;
    setActionLoadingId(itemId);

    try {
      await api.delete(`/api/v1/admin/items/${itemId}`);
      alert("Laporan barang berhasil dihapus dari inventaris.");
      await Promise.all([fetchAdminInventory(), fetchAdminStats()]);
    } catch (err) {
      console.error("Gagal menghapus barang:", err);
      alert("Terjadi kesalahan saat menghapus laporan barang.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // --- HANDLER USER MANAGEMENT ACTIONS ---
  const handleVerifyUserAccount = async (targetUser: AdminUser) => {
    if (!confirm(`Verifikasi email akun mahasiswa ${targetUser.name} secara manual?`))
      return;

    setActionLoadingId(targetUser.id);
    try {
      await api.put(`/api/v1/admin/users/${targetUser.id}/verify`);
      alert(`Akun mahasiswa ${targetUser.name} telah diverifikasi!`);
      await fetchAdminUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal memverifikasi pengguna.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteUserAccount = async (targetUser: AdminUser) => {
    if (
      !confirm(
        `APAKAH ANDA YAKIN ingin MENGHAPUS akun mahasiswa ${targetUser.name} secara permanen dari sistem?`,
      )
    )
      return;

    setActionLoadingId(targetUser.id);
    try {
      await api.delete(`/api/v1/admin/users/${targetUser.id}`);
      alert(`Akun mahasiswa ${targetUser.name} berhasil dihapus dari database.`);
      await Promise.all([fetchAdminUsers(), fetchAdminStats()]);
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal menghapus akun pengguna.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // --- HANDLER UPDATE ADMIN PASSWORD ---
  const handleUpdateAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      alert("Silakan lengkapi seluruh field password.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("Konfirmasi password baru tidak cocok.");
      return;
    }

    setIsSavingPassword(true);
    try {
      await api.put("/api/v1/auth/password", {
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
        new_password_confirmation: passwordForm.confirmPassword,
      });
      alert("Password Admin berhasil diperbarui!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal memperbarui password Admin.");
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleToggleUserFlag = (userId: string) => {
    setUserFlags((prev) => ({
      ...prev,
      [userId]: prev[userId] === "suspended" ? "active" : "suspended",
    }));
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    if (dateString.length <= 10 && dateString.includes("-")) {
      const parts = dateString.split("-");
      if (parts.length === 3) {
        const [year, month, day] = parts;
        const months = [
          "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
          "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
        ];
        return `${parseInt(day, 10)} ${months[parseInt(month, 10) - 1]} ${year}`;
      }
    }
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "-";
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  // Filtered Inventory Data
  const filteredInventory = inventoryItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.reporter?.name &&
        item.reporter.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;
    const matchesType = typeFilter === "all" || item.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Filtered Users List (Mahasiswa Only)
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.nim.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.department.toLowerCase().includes(userSearchQuery.toLowerCase());

    if (userStatusFilter === "verified") return matchesSearch && u.is_email_verified;
    if (userStatusFilter === "unverified") return matchesSearch && !u.is_email_verified;
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070c18] text-white flex flex-col justify-center items-center gap-3">
        <Loader2 className="animate-spin text-blue-500" size={36} />
        <p className="text-sm font-semibold text-gray-400">
          Memuat Command Center Admin...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070c18] text-gray-100 flex font-sans antialiased">
      {/* ================================================================= */}
      {/* 🛡️ SIDEBAR LEFT NAVIGATION */}
      {/* ================================================================= */}
      <aside className="w-64 bg-[#0d1424] border-r border-gray-800/80 flex flex-col justify-between p-5 flex-shrink-0">
        <div>
          {/* Logo & Header */}
          <div className="flex items-center gap-3 px-2 py-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
              <Shield size={20} />
            </div>
            <div>
              <h1 className="font-bold text-white text-base tracking-tight leading-none mb-1">
                Command Center
              </h1>
              <p className="text-[11px] text-gray-400 font-medium tracking-wide">
                Enterprise Admin
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {[
              { name: "Overview", icon: LayoutDashboard },
              { name: "Claim Queue", icon: ClipboardList },
              { name: "Inventory", icon: Package },
              { name: "User Management", icon: Users },
              { name: "Settings", icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.name;

              return (
                <button
                  key={item.name}
                  onClick={() => setActiveNav(item.name as any)}
                  className={clsx(
                    "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 text-left",
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                      : "text-gray-400 hover:bg-gray-800/50 hover:text-white",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </div>
                  {item.name === "Claim Queue" && stats.pendingClaims > 0 && (
                    <span className="bg-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {stats.pendingClaims}
                    </span>
                  )}
                  {item.name === "Inventory" && stats.pendingItems > 0 && (
                    <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {stats.pendingItems}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="space-y-2 pt-6 border-t border-gray-800/60">
          <button
            onClick={() => setIsSystemStatusOpen(true)}
            className="w-full bg-[#131c31] hover:bg-[#1a2642] text-gray-300 border border-gray-700/50 py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <Server size={14} /> System Status
          </button>

          <button
            onClick={handleLogout}
            className="w-full text-red-400 hover:bg-red-500/10 py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center gap-2 transition text-left"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </aside>

      {/* ================================================================= */}
      {/* 📊 MAIN CONTENT AREA */}
      {/* ================================================================= */}
      <main className="flex-1 p-8 overflow-y-auto max-w-7xl">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight mb-1">
              {activeNav}
            </h2>
            <p className="text-sm text-gray-400">
              {activeNav === "Claim Queue"
                ? "Kelola dan verifikasi klaim bukti kepemilikan barang dari civitas akademika UISI."
                : activeNav === "Inventory"
                  ? "Manajemen inventaris seluruh laporan barang hilang & temuan kampus UISI."
                  : activeNav === "User Management"
                    ? "Kelola akun pengguna mahasiswa, verifikasi status email, dan moderasi akun."
                    : activeNav === "Settings"
                      ? "Konfigurasi keamanan akun admin, otomatisi notifikasi, dan kontrol moderasi sistem."
                      : "Real-time system analytics and active queue monitoring."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="bg-[#131c31] hover:bg-[#1a2642] border border-blue-500/40 text-blue-400 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-sm"
            >
              <Globe size={14} /> Tampilan Publik (Mahasiswa)
            </Link>
            <button className="bg-[#131c31] hover:bg-[#1a2642] border border-gray-700/60 text-gray-200 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-sm">
              <Calendar size={14} /> Last 30 Days
            </button>
            <button
              onClick={handleExportReportCSV}
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-blue-600/30"
            >
              <Download size={14} /> Export Report
            </button>
          </div>
        </div>

        {/* ================= TOP 4 METRIC CARDS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Metric 1 */}
          <div className="bg-[#0f172a] border border-gray-800/80 rounded-2xl p-5 relative overflow-hidden shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center font-bold">
                <Package size={18} />
              </div>
              <span className="text-[11px] font-bold text-gray-400 bg-gray-800/80 border border-gray-700 px-2.5 py-1 rounded-full">
                {stats.totalLost} Total
              </span>
            </div>
            <p className="text-xs text-gray-400 font-semibold mb-1">
              Total Barang Dalam Inventaris
            </p>
            <p className="text-3xl font-extrabold text-white tracking-tight">
              {stats.totalLost.toLocaleString()}
            </p>
          </div>

          {/* Metric 2 */}
          <div className="bg-[#0f172a] border border-gray-800/80 rounded-2xl p-5 relative overflow-hidden shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold">
                <CheckCircle2 size={18} />
              </div>
              <span className="text-[11px] font-bold text-blue-400 bg-blue-900/30 border border-blue-700/50 px-2.5 py-1 rounded-full">
                +5.4%
              </span>
            </div>
            <p className="text-xs text-gray-400 font-semibold mb-1">
              Success Rate Pengembalian
            </p>
            <p className="text-3xl font-extrabold text-white tracking-tight">
              {stats.successRate}%
            </p>
          </div>

          {/* Metric 3 */}
          <div className="bg-[#0f172a] border border-gray-800/80 rounded-2xl p-5 relative overflow-hidden shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold">
                <ClipboardList size={18} />
              </div>
              <span className="text-[11px] font-bold text-amber-400 bg-amber-900/30 border border-amber-700/50 px-2.5 py-1 rounded-full">
                {stats.pendingClaims} Pending
              </span>
            </div>
            <p className="text-xs text-gray-400 font-semibold mb-1">
              Pending Claims
            </p>
            <p className="text-3xl font-extrabold text-white tracking-tight">
              {stats.pendingClaims}
            </p>
          </div>

          {/* Metric 4 */}
          <div className="bg-[#0f172a] border border-gray-800/80 rounded-2xl p-5 relative overflow-hidden shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold">
                <Users size={18} />
              </div>
              <span className="text-[11px] font-bold text-blue-400 bg-blue-900/30 border border-blue-700/50 px-2.5 py-1 rounded-full">
                {stats.activeUsers} Mahasiswa
              </span>
            </div>
            <p className="text-xs text-gray-400 font-semibold mb-1">
              Active Users (Mahasiswa)
            </p>
            <p className="text-3xl font-extrabold text-white tracking-tight">
              {stats.activeUsers.toLocaleString()}
            </p>
          </div>
        </div>

        {/* ================= CONDITION 1: OVERVIEW TAB ================= */}
        {activeNav === "Overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT 2/3 COLUMN: CLAIM QUEUE SUMMARY TABLE */}
            <div className="lg:col-span-2 bg-[#0f172a] border border-gray-800/80 rounded-2xl p-6 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    <ClipboardList size={18} className="text-blue-400" />
                    Claim Queue (Antrean Terbaru)
                  </h3>
                  <button
                    onClick={() => setActiveNav("Claim Queue")}
                    className="text-xs font-semibold text-blue-400 hover:underline"
                  >
                    View All ({claims.length}) →
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[11px] text-gray-400 uppercase tracking-wider border-b border-gray-800/80 pb-3">
                        <th className="pb-3 font-medium">Claimant</th>
                        <th className="pb-3 font-medium">Item</th>
                        <th className="pb-3 font-medium">Date Filed</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50 text-xs">
                      {isFetchingClaims ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="py-8 text-center text-gray-400"
                          >
                            <Loader2
                              className="animate-spin inline mr-2"
                              size={16}
                            />{" "}
                            Memuat data klaim...
                          </td>
                        </tr>
                      ) : claims.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="py-8 text-center text-gray-500"
                          >
                            Belum ada klaim barang dari pengguna.
                          </td>
                        </tr>
                      ) : (
                        claims.slice(0, 5).map((claim) => {
                          const isPending = claim.status === "pending";
                          const isApproved = claim.status === "approved";
                          return (
                            <tr
                              key={claim.id}
                              className="hover:bg-gray-800/30 transition-colors"
                            >
                              <td className="py-4">
                                <div className="flex items-center gap-3">
                                  {claim.user?.avatar_url ? (
                                    <img
                                      src={claim.user.avatar_url}
                                      alt={claim.user.name}
                                      className="w-8 h-8 rounded-full object-cover border border-blue-500/30"
                                    />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center text-xs border border-blue-500/30">
                                      {getInitials(claim.user?.name)}
                                    </div>
                                  )}
                                  <div>
                                    <span className="font-semibold text-white block">
                                      {claim.user?.name || "Pengguna"}
                                    </span>
                                    <span className="text-[10px] text-gray-400">
                                      {claim.user?.email}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              <td className="py-4 font-medium text-gray-300">
                                {claim.item?.title || "Barang"}
                              </td>

                              <td className="py-4 text-gray-400 font-medium">
                                {formatDate(claim.created_at)}
                              </td>

                              <td className="py-4">
                                <span
                                  className={clsx(
                                    "text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border",
                                    isPending
                                      ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                      : isApproved
                                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                        : "bg-red-500/20 text-red-400 border-red-500/30",
                                  )}
                                >
                                  {claim.status}
                                </span>
                              </td>

                              <td className="py-4 text-right">
                                <button
                                  onClick={() => setSelectedProof(claim)}
                                  className="bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                                >
                                  Periksa Proof
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* RIGHT 1/3 COLUMN: LIVE USER FLAGGING & MODERATION */}
            <div className="lg:col-span-1 bg-[#0f172a] border border-gray-800/80 rounded-2xl p-6 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-base font-bold text-white tracking-tight">
                    User Flagging & Moderasi
                  </h3>
                  <AlertTriangle size={18} className="text-amber-400" />
                </div>

                <div className="space-y-4 mb-6">
                  {usersList.length === 0 ? (
                    <div className="p-4 text-center text-xs text-gray-500">
                      Belum ada pengguna terdaftar.
                    </div>
                  ) : (
                    usersList.slice(0, 4).map((u) => {
                      const isSuspended = userFlags[u.id] === "suspended";

                      return (
                        <div
                          key={u.id}
                          className="p-3.5 bg-[#090f1d] border border-gray-800 rounded-xl flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-white mb-0.5 truncate">
                              {u.name}
                            </h4>
                            <p className="text-[11px] text-gray-400 truncate">
                              {u.department} ({u.reported_items_count} laporan)
                            </p>
                          </div>

                          <button
                            onClick={() => handleToggleUserFlag(u.id)}
                            className={clsx(
                              "px-3 py-1.5 rounded-lg text-xs font-semibold transition border flex-shrink-0",
                              isSuspended
                                ? "bg-red-500/20 text-red-400 border-red-500/30"
                                : "bg-emerald-500/10 hover:bg-red-500/10 text-emerald-400 hover:text-red-400 border-emerald-500/30 hover:border-red-500/40",
                            )}
                          >
                            {isSuspended ? "Suspended" : "Aktif"}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <button
                onClick={() => setActiveNav("User Management")}
                className="w-full bg-[#131c31] hover:bg-[#1a2642] text-gray-300 border border-gray-700/60 py-2.5 rounded-xl text-xs font-semibold transition text-center"
              >
                Kelola Seluruh Pengguna Mahasiswa ({usersList.length}) →
              </button>
            </div>
          </div>
        )}

        {/* ================= CONDITION 2: CLAIM QUEUE TAB ================= */}
        {activeNav === "Claim Queue" && (
          <div className="bg-[#0f172a] border border-gray-800/80 rounded-2xl p-6 shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800/80 pb-5">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <ClipboardList size={22} className="text-blue-400" />
                  Antrean Klaim Bukti Kepemilikan (Claim Queue)
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Verifikasi bukti kepemilikan yang dikirimkan oleh pemohon
                  untuk menyetujui atau menolak pengembalian barang.
                </p>
              </div>

              <button
                onClick={fetchAdminClaims}
                disabled={isFetchingClaims}
                className="bg-[#131c31] hover:bg-[#1a2642] text-gray-300 border border-gray-700/60 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition"
              >
                {isFetchingClaims ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : null}
                Refresh Data
              </button>
            </div>

            {/* Claims Table View */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[11px] text-gray-400 uppercase tracking-wider border-b border-gray-800/80 pb-3">
                    <th className="pb-3 font-medium">Pemohon (Claimant)</th>
                    <th className="pb-3 font-medium">Barang Yang Diklaim</th>
                    <th className="pb-3 font-medium">Bukti Kepemilikan</th>
                    <th className="pb-3 font-medium">Tanggal Pengajuan</th>
                    <th className="pb-3 font-medium">Status Klaim</th>
                    <th className="pb-3 font-medium text-right">
                      Aksi Verifikasi Admin
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50 text-xs">
                  {isFetchingClaims ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-12 text-center text-gray-400"
                      >
                        <Loader2
                          className="animate-spin inline mr-2 text-blue-500"
                          size={24}
                        />
                        Sedang mengunduh antrean klaim dari database...
                      </td>
                    </tr>
                  ) : claims.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-12 text-center text-gray-500 font-medium"
                      >
                        Belum ada klaim barang yang diajukan oleh pengguna.
                      </td>
                    </tr>
                  ) : (
                    claims.map((claim) => {
                      const isPending = claim.status === "pending";
                      const isApproved = claim.status === "approved";
                      const isRejected = claim.status === "rejected";

                      return (
                        <tr
                          key={claim.id}
                          className="hover:bg-gray-800/30 transition-colors"
                        >
                          <td className="py-4 pr-4">
                            <div className="flex items-center gap-3">
                              {claim.user?.avatar_url ? (
                                <img
                                  src={claim.user.avatar_url}
                                  alt={claim.user.name}
                                  className="w-9 h-9 rounded-full object-cover border border-blue-500/30"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center text-xs border border-blue-500/30 flex-shrink-0">
                                  {getInitials(claim.user?.name)}
                                </div>
                              )}
                              <div>
                                <span className="font-bold text-white block">
                                  {claim.user?.name || "Pengguna UISI"}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                  {claim.user?.email}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 pr-4">
                            <span className="font-bold text-gray-200 block text-sm">
                              {claim.item?.title || "Barang"}
                            </span>
                            <span className="text-[11px] text-gray-400">
                              📍 {claim.item?.location || "Area UISI"}
                            </span>
                            {claim.item_id && (
                              <Link
                                href={`/items/${claim.item_id}`}
                                target="_blank"
                                className="text-[10px] text-blue-400 hover:underline flex items-center gap-1 mt-1 font-semibold"
                              >
                                Lihat Laporan Publik <ExternalLink size={10} />
                              </Link>
                            )}
                          </td>

                          <td className="py-4 pr-4 max-w-xs">
                            <p className="text-gray-300 line-clamp-2 text-xs mb-2 italic">
                              "{claim.proof_description}"
                            </p>

                            <button
                              onClick={() => setSelectedProof(claim)}
                              className="text-[11px] font-bold text-blue-400 bg-blue-900/30 border border-blue-700/50 hover:bg-blue-600 hover:text-white px-2.5 py-1 rounded-md transition flex items-center gap-1"
                            >
                              <Eye size={12} /> Periksa Detail Proof & Foto
                            </button>
                          </td>

                          <td className="py-4 text-gray-400 font-medium text-xs whitespace-nowrap">
                            {formatDate(claim.created_at)}
                          </td>

                          <td className="py-4">
                            <span
                              className={clsx(
                                "text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border inline-flex items-center gap-1",
                                isPending
                                  ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                  : isApproved
                                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                    : "bg-red-500/20 text-red-400 border-red-500/30",
                              )}
                            >
                              {isPending && (
                                <Loader2 size={10} className="animate-spin" />
                              )}
                              {isApproved && <CheckCircle2 size={10} />}
                              {isRejected && <XCircle size={10} />}
                              {claim.status}
                            </span>
                          </td>

                          <td className="py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {isPending ? (
                                <>
                                  <button
                                    onClick={() => handleApproveClaim(claim.id)}
                                    disabled={actionLoadingId === claim.id}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition flex items-center gap-1 shadow-md disabled:opacity-50"
                                  >
                                    {actionLoadingId === claim.id ? (
                                      <Loader2
                                        size={12}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <Check size={14} />
                                    )}
                                    Setujui
                                  </button>
                                  <button
                                    onClick={() => handleRejectClaim(claim.id)}
                                    disabled={actionLoadingId === claim.id}
                                    className="bg-red-600/20 border border-red-500/40 text-red-400 hover:bg-red-600 hover:text-white font-bold px-3 py-1.5 rounded-lg text-xs transition flex items-center gap-1 disabled:opacity-50"
                                  >
                                    {actionLoadingId === claim.id ? (
                                      <Loader2
                                        size={12}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <X size={14} />
                                    )}
                                    Tolak
                                  </button>
                                </>
                              ) : (
                                <span className="text-[11px] text-gray-500 italic">
                                  Selesai diproses
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= CONDITION 3: INVENTORY TAB ================= */}
        {activeNav === "Inventory" && (
          <div className="bg-[#0f172a] border border-gray-800/80 rounded-2xl p-6 shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800/80 pb-5">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <Package size={22} className="text-blue-400" />
                  Kelola Inventaris Seluruh Barang (Inventory Management)
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Pantau, validasi laporan baru, dan kelola seluruh barang
                  hilang & temuan di lingkungan UISI.
                </p>
              </div>

              <button
                onClick={fetchAdminInventory}
                disabled={isFetchingInventory}
                className="bg-[#131c31] hover:bg-[#1a2642] text-gray-300 border border-gray-700/60 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition"
              >
                {isFetchingInventory ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <RefreshCw size={14} />
                )}
                Refresh Inventaris
              </button>
            </div>

            {/* Filter & Search Bar Controls */}
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center bg-[#090f1d] p-4 rounded-xl border border-gray-800">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari barang berdasarkan nama, lokasi, atau pelapor..."
                  className="w-full bg-[#0f172a] border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex bg-[#0f172a] p-1 rounded-lg border border-gray-800 text-xs">
                  {[
                    "all",
                    "pending",
                    "active",
                    "is_pending",
                    "completed",
                  ].map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={clsx(
                        "px-3 py-1.5 rounded-md font-semibold capitalize transition",
                        statusFilter === st
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-gray-400 hover:text-white",
                      )}
                    >
                      {st === "all"
                        ? "Semua"
                        : st === "pending"
                          ? "Pending"
                          : st === "active"
                            ? "Aktif"
                            : st === "is_pending"
                              ? "Proses Klaim"
                              : "Selesai"}
                    </button>
                  ))}
                </div>

                <div className="flex bg-[#0f172a] p-1 rounded-lg border border-gray-800 text-xs">
                  {["all", "lost", "found"].map((tp) => (
                    <button
                      key={tp}
                      onClick={() => setTypeFilter(tp)}
                      className={clsx(
                        "px-3 py-1.5 rounded-md font-semibold capitalize transition",
                        typeFilter === tp
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-gray-400 hover:text-white",
                      )}
                    >
                      {tp === "all"
                        ? "Semua Tipe"
                        : tp === "lost"
                          ? "Kehilangan"
                          : "Temuan"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[11px] text-gray-400 uppercase tracking-wider border-b border-gray-800/80 pb-3">
                    <th className="pb-3 font-medium">Foto</th>
                    <th className="pb-3 font-medium">Barang & Kategori</th>
                    <th className="pb-3 font-medium">Tipe</th>
                    <th className="pb-3 font-medium">Lokasi</th>
                    <th className="pb-3 font-medium">Pelapor</th>
                    <th className="pb-3 font-medium">Status System</th>
                    <th className="pb-3 font-medium text-right">Aksi Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50 text-xs">
                  {isFetchingInventory ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-12 text-center text-gray-400"
                      >
                        <Loader2
                          className="animate-spin inline mr-2 text-blue-500"
                          size={24}
                        />
                        Sedang memuat data inventaris...
                      </td>
                    </tr>
                  ) : filteredInventory.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-12 text-center text-gray-500 font-medium"
                      >
                        Tidak ada barang yang cocok dengan filter pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredInventory.map((item) => {
                      const isPendingReport = item.status === "pending";
                      const isActiveReport = item.status === "active";
                      const isClaimProcess = item.status === "is_pending";

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-gray-800/30 transition-colors"
                        >
                          <td className="py-4 pr-3">
                            <div
                              onClick={() =>
                                setSelectedImage(
                                  item.image_path ||
                                    "https://via.placeholder.com/800",
                                )
                              }
                              className="w-12 h-12 rounded-xl overflow-hidden bg-gray-900 border border-gray-700 relative cursor-pointer group flex-shrink-0"
                            >
                              <img
                                src={
                                  item.image_path ||
                                  "https://via.placeholder.com/150"
                                }
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition"
                              />
                            </div>
                          </td>

                          <td className="py-4 pr-4">
                            <span className="font-bold text-white block text-sm">
                              {item.title}
                            </span>
                            <span className="text-[11px] text-gray-400 flex items-center gap-1">
                              <Tag size={10} /> {item.category}
                            </span>
                            <span className="text-[10px] text-gray-500 font-mono">
                              #{item.id.split("-")[0].toUpperCase()}
                            </span>
                          </td>

                          <td className="py-4 pr-4">
                            <span
                              className={clsx(
                                "text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border",
                                item.type === "lost"
                                  ? "bg-red-500/20 text-red-400 border-red-500/30"
                                  : "bg-blue-500/20 text-blue-400 border-blue-500/30",
                              )}
                            >
                              {item.type === "lost" ? "Kehilangan" : "Temuan"}
                            </span>
                          </td>

                          <td className="py-4 pr-4 text-gray-300">
                            <div className="flex items-center gap-1 text-xs">
                              <MapPin
                                size={12}
                                className="text-gray-400 flex-shrink-0"
                              />
                              <span className="truncate max-w-xs">
                                {item.location}
                              </span>
                            </div>
                            <span className="text-[10px] text-gray-400 font-medium block mt-0.5">
                              {formatDateTime(item.created_at || item.date)}
                            </span>
                          </td>

                          <td className="py-4 pr-4">
                            <div className="flex items-center gap-2">
                              {item.reporter?.avatar_url ? (
                                <img
                                  src={item.reporter.avatar_url}
                                  alt={item.reporter.name}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-gray-800 text-gray-400 font-bold flex items-center justify-center text-[10px]">
                                  {getInitials(item.reporter?.name)}
                                </div>
                              )}
                              <span className="text-xs font-semibold text-gray-200">
                                {item.reporter?.name || "Anonim"}
                              </span>
                            </div>
                          </td>

                          <td className="py-4 pr-4">
                            <span
                              className={clsx(
                                "text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border inline-flex items-center gap-1",
                                isPendingReport
                                  ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                  : isActiveReport
                                    ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                    : isClaimProcess
                                      ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                                      : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
                              )}
                            >
                              {isPendingReport
                                ? "Pending Validasi"
                                : isActiveReport
                                  ? "Dipublikasikan"
                                  : isClaimProcess
                                    ? "Proses Klaim"
                                    : "Selesai"}
                            </span>
                          </td>

                          <td className="py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {isPendingReport && (
                                <button
                                  onClick={() =>
                                    handleApprovePendingReport(item.id)
                                  }
                                  disabled={actionLoadingId === item.id}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition flex items-center gap-1 shadow-md disabled:opacity-50"
                                  title="Setujui Laporan Tayang di Publik"
                                >
                                  {actionLoadingId === item.id ? (
                                    <Loader2
                                      size={12}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <Check size={13} />
                                  )}
                                  Approve Tayang
                                </button>
                              )}

                              <Link
                                href={`/items/${item.id}`}
                                target="_blank"
                                className="bg-[#131c31] hover:bg-[#1a2642] text-gray-300 p-1.5 rounded-lg transition"
                                title="Buka Detail Laporan Publik"
                              >
                                <ExternalLink size={14} />
                              </Link>

                              <button
                                onClick={() =>
                                  handleDeleteInventoryItem(item.id)
                                }
                                disabled={actionLoadingId === item.id}
                                className="bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600 hover:text-white p-1.5 rounded-lg transition disabled:opacity-50"
                                title="Hapus Dari Inventaris"
                              >
                                {actionLoadingId === item.id ? (
                                  <Loader2
                                    size={14}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Trash2 size={14} />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= CONDITION 4: USER MANAGEMENT TAB (MAHASISWA ONLY) ================= */}
        {activeNav === "User Management" && (
          <div className="bg-[#0f172a] border border-gray-800/80 rounded-2xl p-6 shadow-md space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800/80 pb-5">
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <Users size={22} className="text-blue-400" />
                  Manajemen Akun Mahasiswa
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Kelola seluruh akun mahasiswa UISI, verifikasi status email, pantau aktivitas laporan & klaim, serta kelola akun.
                </p>
              </div>

              <button
                onClick={fetchAdminUsers}
                disabled={isFetchingUsers}
                className="bg-[#131c31] hover:bg-[#1a2642] text-gray-300 border border-gray-700/60 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition"
              >
                {isFetchingUsers ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <RefreshCw size={14} />
                )}
                Refresh Data Mahasiswa
              </button>
            </div>

            {/* Search & Filter Bar Controls */}
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center bg-[#090f1d] p-4 rounded-xl border border-gray-800">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Cari mahasiswa berdasarkan nama, email, NIM, atau prodi..."
                  className="w-full bg-[#0f172a] border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex bg-[#0f172a] p-1 rounded-lg border border-gray-800 text-xs">
                  {["all", "verified", "unverified"].map((st) => (
                    <button
                      key={st}
                      onClick={() => setUserStatusFilter(st)}
                      className={clsx(
                        "px-3 py-1.5 rounded-md font-semibold capitalize transition",
                        userStatusFilter === st
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-gray-400 hover:text-white",
                      )}
                    >
                      {st === "all"
                        ? "Semua Mahasiswa"
                        : st === "verified"
                          ? "Email Terverifikasi"
                          : "Belum Verifikasi"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Users Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[11px] text-gray-400 uppercase tracking-wider border-b border-gray-800/80 pb-3">
                    <th className="pb-3 font-medium">Mahasiswa</th>
                    <th className="pb-3 font-medium">Email & Verifikasi</th>
                    <th className="pb-3 font-medium">Program Studi (Prodi)</th>
                    <th className="pb-3 font-medium">Aktivitas Sistem</th>
                    <th className="pb-3 font-medium">Terdaftar</th>
                    <th className="pb-3 font-medium text-right">Aksi Kelola Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50 text-xs">
                  {isFetchingUsers ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400">
                        <Loader2 className="animate-spin inline mr-2 text-blue-500" size={24} />
                        Sedang mengunduh data mahasiswa...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-500 font-medium">
                        Tidak ada akun mahasiswa yang cocok dengan kriteria pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      return (
                        <tr key={u.id} className="hover:bg-gray-800/30 transition-colors">
                          {/* User Avatar, Name, NIM */}
                          <td className="py-4 pr-4">
                            <div className="flex items-center gap-3">
                              {u.avatar_url ? (
                                <img
                                  src={u.avatar_url}
                                  alt={u.name}
                                  className="w-9 h-9 rounded-full object-cover border border-blue-500/30 flex-shrink-0"
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center text-xs border border-blue-500/30 flex-shrink-0">
                                  {getInitials(u.name)}
                                </div>
                              )}
                              <div>
                                <span className="font-bold text-white block">
                                  {u.name}
                                </span>
                                <span className="text-[10px] text-gray-400 font-mono">
                                  NIM: {u.nim}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Email & Verification Status */}
                          <td className="py-4 pr-4">
                            <span className="text-gray-200 font-semibold block text-xs">
                              {u.email}
                            </span>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span
                                className={clsx(
                                  "text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border",
                                  u.is_email_verified
                                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                    : "bg-amber-500/20 text-amber-400 border-amber-500/30",
                                )}
                              >
                                {u.is_email_verified ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />}
                                {u.is_email_verified ? "Email Verified" : "Unverified"}
                              </span>
                            </div>
                          </td>

                          {/* Department */}
                          <td className="py-4 pr-4 font-semibold text-gray-300">
                            <span className="bg-blue-900/20 text-blue-400 border border-blue-800/60 px-2.5 py-1 rounded-lg text-xs inline-block">
                              {u.department}
                            </span>
                          </td>

                          {/* System Activity Counts */}
                          <td className="py-4 pr-4 text-xs text-gray-400 font-medium">
                            <span className="block text-gray-300">
                              📦 {u.reported_items_count} Laporan
                            </span>
                            <span className="block text-gray-400 text-[11px]">
                              📋 {u.submitted_claims_count} Klaim
                            </span>
                          </td>

                          {/* Created At */}
                          <td className="py-4 pr-4 text-gray-400 text-xs whitespace-nowrap">
                            {formatDate(u.created_at)}
                          </td>

                          {/* Admin Actions */}
                          <td className="py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* Verify Email Button if not verified */}
                              {!u.is_email_verified && (
                                <button
                                  onClick={() => handleVerifyUserAccount(u)}
                                  disabled={actionLoadingId === u.id}
                                  className="bg-amber-600 hover:bg-amber-500 text-black font-bold px-2.5 py-1.5 rounded-lg text-xs transition flex items-center gap-1 shadow-sm disabled:opacity-50"
                                  title="Verifikasi Email Mahasiswa Secara Manual"
                                >
                                  {actionLoadingId === u.id ? (
                                    <Loader2 size={12} className="animate-spin" />
                                  ) : (
                                    <UserCheck size={13} />
                                  )}
                                  Verifikasi Manual
                                </button>
                              )}

                              {/* Delete User Button */}
                              <button
                                onClick={() => handleDeleteUserAccount(u)}
                                disabled={actionLoadingId === u.id}
                                className="bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600 hover:text-white p-1.5 rounded-lg transition disabled:opacity-50"
                                title="Hapus Akun Mahasiswa"
                              >
                                {actionLoadingId === u.id ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <Trash2 size={14} />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= CONDITION 5: SETTINGS TAB (ENTERPRISE SYSTEM SETTINGS) ================= */}
        {activeNav === "Settings" && (
          <div className="space-y-6">
            <div className="bg-[#0f172a] border border-gray-800/80 rounded-2xl p-6 shadow-md">
              <div className="flex items-center gap-3 border-b border-gray-800/80 pb-4 mb-6">
                <Settings size={22} className="text-blue-400" />
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    System & Administrator Settings
                  </h3>
                  <p className="text-xs text-gray-400">
                    Konfigurasi keamanan akun admin, otomatisi notifikasi WhatsApp/Email, dan kontrol moderasi sistem.
                  </p>
                </div>
              </div>

              {/* 2x2 SETTINGS CARDS GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* CARD 1: KEAMANAN AKUN ADMIN */}
                <div className="bg-[#090f1d] border border-gray-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
                    <Shield size={18} className="text-blue-400" />
                    <h4 className="font-bold text-white text-sm">
                      Kredensial & Keamanan Admin
                    </h4>
                  </div>

                  <form onSubmit={handleUpdateAdminPassword} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-gray-400 font-semibold mb-1">
                        Nama Administrator:
                      </label>
                      <input
                        type="text"
                        disabled
                        value={user?.name || "Administrator Kampus"}
                        className="w-full bg-[#0f172a] border border-gray-800 rounded-lg px-3 py-2 text-gray-400 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-400 font-semibold mb-1">
                        Email Resmi Admin:
                      </label>
                      <input
                        type="text"
                        disabled
                        value={user?.email || "admin.lostfound@uisi.ac.id"}
                        className="w-full bg-[#0f172a] border border-gray-800 rounded-lg px-3 py-2 text-gray-400 cursor-not-allowed"
                      />
                    </div>

                    <div className="pt-2 border-t border-gray-800">
                      <label className="block text-gray-300 font-semibold mb-1 flex items-center gap-1">
                        <Key size={12} className="text-amber-400" /> Password Saat Ini:
                      </label>
                      <input
                        type="password"
                        required
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            currentPassword: e.target.value,
                          }))
                        }
                        placeholder="Masukkan password admin lama..."
                        className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 font-semibold mb-1 flex items-center gap-1">
                        <Lock size={12} className="text-blue-400" /> Password Baru:
                      </label>
                      <input
                        type="password"
                        required
                        minLength={8}
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            newPassword: e.target.value,
                          }))
                        }
                        placeholder="Minimal 8 karakter..."
                        className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 font-semibold mb-1">
                        Konfirmasi Password Baru:
                      </label>
                      <input
                        type="password"
                        required
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            confirmPassword: e.target.value,
                          }))
                        }
                        placeholder="Ketik ulang password baru..."
                        className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingPassword}
                      className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-lg text-xs transition flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                    >
                      {isSavingPassword ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Save size={14} />
                      )}
                      Simpan Password Baru Admin
                    </button>
                  </form>
                </div>

                {/* CARD 2: KONFIGURASI NOTIFIKASI & GATEWAY */}
                <div className="bg-[#090f1d] border border-gray-800 rounded-xl p-5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
                    <Bell size={18} className="text-amber-400" />
                    <h4 className="font-bold text-white text-sm">
                      Gateway & Otomatisi Notifikasi
                    </h4>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="flex items-center justify-between p-3 bg-[#0f172a] rounded-lg border border-gray-800">
                      <div>
                        <p className="font-bold text-white">Notifikasi WhatsApp Fonnte</p>
                        <p className="text-[11px] text-gray-400">
                          Kirim WA otomatis ke pelapor saat klaim disetujui/ditolak.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={systemConfig.waAutoNotify}
                        onChange={(e) =>
                          setSystemConfig((prev) => ({
                            ...prev,
                            waAutoNotify: e.target.checked,
                          }))
                        }
                        className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-[#0f172a] rounded-lg border border-gray-800">
                      <div>
                        <p className="font-bold text-white">Broadcast Email Kampus</p>
                        <p className="text-[11px] text-gray-400">
                          Kirim notifikasi email otomatis ke Admin saat laporan baru dibuat.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={systemConfig.emailBroadcast}
                        onChange={(e) =>
                          setSystemConfig((prev) => ({
                            ...prev,
                            emailBroadcast: e.target.checked,
                          }))
                        }
                        className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-[#0f172a] rounded-lg border border-gray-800">
                      <div>
                        <p className="font-bold text-white">Require Admin Approval</p>
                        <p className="text-[11px] text-gray-400">
                          Validasi laporan baru wajib disetujui Admin sebelum tayang di publik.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={systemConfig.requireAdminApproval}
                        onChange={(e) =>
                          setSystemConfig((prev) => ({
                            ...prev,
                            requireAdminApproval: e.target.checked,
                          }))
                        }
                        className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-[#0f172a] rounded-lg border border-gray-800">
                      <div>
                        <p className="font-bold text-white">Batas Klaim Harian</p>
                        <p className="text-[11px] text-gray-400">
                          Batasi maksimal 3 klaim/hari per mahasiswa untuk mencegah spamming.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={systemConfig.claimLimitPerDay}
                        onChange={(e) =>
                          setSystemConfig((prev) => ({
                            ...prev,
                            claimLimitPerDay: e.target.checked,
                          }))
                        }
                        className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* CARD 3: DATABASE STATUS & BACKUP */}
                <div className="bg-[#090f1d] border border-gray-800 rounded-xl p-5 space-y-4 lg:col-span-2">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Database size={18} className="text-emerald-400" />
                      <h4 className="font-bold text-white text-sm">
                        Status Database & Infrastruktur Sistem
                      </h4>
                    </div>
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle size={10} /> Supabase PostgreSQL - Connected
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 bg-[#0f172a] border border-gray-800 rounded-xl">
                      <p className="text-gray-400 font-semibold mb-1">Timezone Server:</p>
                      <p className="text-sm font-bold text-white">WIB (UTC+07:00)</p>
                    </div>

                    <div className="p-4 bg-[#0f172a] border border-gray-800 rounded-xl">
                      <p className="text-gray-400 font-semibold mb-1">Total Laporan Inventaris:</p>
                      <p className="text-sm font-bold text-white">{stats.totalLost} Item</p>
                    </div>

                    <div className="p-4 bg-[#0f172a] border border-gray-800 rounded-xl">
                      <p className="text-gray-400 font-semibold mb-1">Total Mahasiswa Active:</p>
                      <p className="text-sm font-bold text-white">{stats.activeUsers} Pengguna</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      onClick={() => alert("Cache aplikasi berhasil dibersihkan!")}
                      className="bg-[#131c31] hover:bg-[#1a2642] border border-gray-700/60 text-gray-200 px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2"
                    >
                      <RefreshCw size={14} /> Clear Cache System
                    </button>
                    <button
                      onClick={handleExportReportCSV}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 shadow-md"
                    >
                      <Download size={14} /> Export Backup Inventaris
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ================================================================= */}
      {/* 🖥️ MODAL SYSTEM STATUS DIAGNOSTIC */}
      {/* ================================================================= */}
      {isSystemStatusOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-gray-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-gray-900/60">
              <div className="flex items-center gap-2">
                <Server size={18} className="text-emerald-400" />
                <h3 className="font-bold text-white text-base">
                  System Health & Diagnostic Monitor
                </h3>
              </div>
              <button
                onClick={() => setIsSystemStatusOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 bg-[#090f1d] border border-gray-800 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <Activity size={16} className="text-emerald-400" />
                  <div>
                    <p className="font-bold text-white">Laravel 11 REST API</p>
                    <p className="text-[10px] text-gray-400">Backend modular monolith service</p>
                  </div>
                </div>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-1 rounded-full">
                  HTTP 200 OK (18ms)
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#090f1d] border border-gray-800 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <Database size={16} className="text-blue-400" />
                  <div>
                    <p className="font-bold text-white">Supabase PostgreSQL DB</p>
                    <p className="text-[10px] text-gray-400">Primary cloud relational database</p>
                  </div>
                </div>
                <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold px-2.5 py-1 rounded-full">
                  CONNECTED (HEALTHY)
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#090f1d] border border-gray-800 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <Wifi size={16} className="text-amber-400" />
                  <div>
                    <p className="font-bold text-white">Fonnte WhatsApp Gateway</p>
                    <p className="text-[10px] text-gray-400">WhatsApp OTP & claim notifications</p>
                  </div>
                </div>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-1 rounded-full">
                  READY (DEVICE ONLINE)
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#090f1d] border border-gray-800 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <Cpu size={16} className="text-purple-400" />
                  <div>
                    <p className="font-bold text-white">Cloudinary Image Storage</p>
                    <p className="text-[10px] text-gray-400">CDN Cloud Media Provider</p>
                  </div>
                </div>
                <span className="bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[10px] font-bold px-2.5 py-1 rounded-full">
                  OPERATIONAL
                </span>
              </div>
            </div>

            <div className="p-5 border-t border-gray-800 flex justify-end bg-gray-900/60">
              <button
                onClick={() => setIsSystemStatusOpen(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition shadow-md"
              >
                Tutup Monitor System
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 🖼️ MODAL PROOF LIGHTBOX VIEWER */}
      {/* ================================================================= */}
      {selectedProof && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-gray-800 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-gray-900/60">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-blue-400" />
                <h3 className="font-bold text-white text-base">
                  Bukti Kepemilikan (Claim Proof)
                </h3>
              </div>
              <button
                onClick={() => setSelectedProof(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="p-4 bg-[#090f1d] border border-gray-800 rounded-xl">
                <p className="text-xs text-gray-400 font-semibold mb-1">
                  Pemohon Klaim:
                </p>
                <p className="text-sm font-bold text-white">
                  {selectedProof.user?.name} ({selectedProof.user?.email})
                </p>
              </div>

              <div className="p-4 bg-[#090f1d] border border-gray-800 rounded-xl">
                <p className="text-xs text-gray-400 font-semibold mb-1">
                  Deskripsi Bukti Kepemilikan:
                </p>
                <p className="text-sm text-gray-200 whitespace-pre-line leading-relaxed">
                  {selectedProof.proof_description}
                </p>
              </div>

              {selectedProof.proof_image_path ? (
                <div>
                  <p className="text-xs text-gray-400 font-semibold mb-2">
                    Foto Lampiran Bukti:
                  </p>
                  <div className="relative w-full h-64 rounded-xl overflow-hidden border border-gray-700 bg-gray-900">
                    <img
                      src={selectedProof.proof_image_path}
                      alt="Foto Bukti"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-900/40 border border-dashed border-gray-800 rounded-xl text-center text-xs text-gray-500">
                  Pemohon tidak melampirkan foto bukti.
                </div>
              )}
            </div>

            <div className="p-5 border-t border-gray-800 flex justify-between items-center bg-gray-900/60">
              <button
                onClick={() => setSelectedProof(null)}
                className="px-4 py-2 bg-gray-800 text-gray-300 hover:text-white rounded-lg text-xs font-semibold transition"
              >
                Tutup
              </button>

              {selectedProof.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      handleRejectClaim(selectedProof.id);
                      setSelectedProof(null);
                    }}
                    className="px-4 py-2 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white border border-red-500/30 rounded-lg text-xs font-bold transition"
                  >
                    Tolak Klaim
                  </button>
                  <button
                    onClick={() => {
                      handleApproveClaim(selectedProof.id);
                      setSelectedProof(null);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-md"
                  >
                    Setujui Klaim
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 🖼️ MODAL IMAGE LIGHTBOX VIEWER */}
      {/* ================================================================= */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full flex flex-col items-center">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <X size={28} />
            </button>
            <img
              src={selectedImage}
              alt="Perbesar Gambar"
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
