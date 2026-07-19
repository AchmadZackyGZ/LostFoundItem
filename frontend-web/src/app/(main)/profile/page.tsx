import {
  User,
  Settings,
  Shield,
  LogOut,
  Mail,
  Phone,
  Package,
  CheckCircle2,
  Edit3,
} from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  // Dummy data pengguna
  const user = {
    name: "Achmad Zacky",
    email: "zacky.achmad@student.uisi.ac.id",
    phone: "+62 812-3456-7890",
    role: "Mahasiswa",
    department: "Ilmu Komputer",
    reportsCount: 4,
    claimsCount: 2,
  };

  return (
    <div className="container mx-auto px-4 lg:px-8 py-10 max-w-6xl">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Profil Saya
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kolom Kiri: Card Profil & Navigasi */}
        <div className="lg:col-span-1 space-y-6">
          {/* Main Profile Card */}
          <div className="bg-surface dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-2xl p-6 text-center shadow-sm">
            <div className="w-24 h-24 bg-primary/10 dark:bg-blue-900/30 rounded-full mx-auto flex items-center justify-center mb-4 relative border-2 border-primary/20 dark:border-blue-500/30">
              <span className="text-3xl font-bold text-primary dark:text-blue-400">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
              <button className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full shadow-md hover:bg-blue-800 transition">
                <Edit3 size={14} />
              </button>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              {user.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {user.department}
            </p>
            <span className="bg-blue-50 dark:bg-blue-900/20 text-primary dark:text-blue-400 border border-blue-100 dark:border-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
              {user.role}
            </span>
          </div>

          {/* Sidebar Menu */}
          <div className="bg-surface dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="flex flex-col">
              <Link
                href="#"
                className="flex items-center gap-3 px-6 py-4 text-sm font-medium text-primary dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10 border-l-2 border-primary dark:border-blue-400"
              >
                <User size={18} /> Informasi Pribadi
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition"
              >
                <Shield size={18} /> Keamanan & Password
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 px-6 py-4 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition"
              >
                <Settings size={18} /> Pengaturan Notifikasi
              </Link>
              <div className="h-px bg-gray-100 dark:bg-gray-800 w-full"></div>
              <button className="flex items-center gap-3 px-6 py-4 text-sm font-medium text-danger dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition w-full text-left">
                <LogOut size={18} /> Keluar (Logout)
              </button>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Detail Informasi & Statistik */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Grid */}
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
                  {user.reportsCount}
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
                  {user.claimsCount}
                </p>
              </div>
            </div>
          </div>

          {/* Form Informasi Pribadi */}
          <div className="bg-surface dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Informasi Pribadi
              </h3>
              <button className="text-sm font-medium text-primary dark:text-blue-400 hover:underline">
                Edit Data
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Nama Lengkap
                  </label>
                  <div className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white">
                    {user.name}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Program Studi
                  </label>
                  <div className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white">
                    {user.department}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Alamat Email
                </label>
                <div className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white flex items-center gap-2">
                  <Mail size={16} className="text-gray-400" />
                  {user.email}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Nomor Telepon
                </label>
                <div className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white flex items-center gap-2">
                  <Phone size={16} className="text-gray-400" />
                  {user.phone}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
