"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, HelpCircle, User, Settings, Shield, LogOut } from "lucide-react";
import clsx from "clsx";

export default function TopNav() {
  const pathname = usePathname();

  const navLinks = [
    { name: "Dasbor", href: "/" },
    { name: "Barang", href: "/items" },
    { name: "Aktivitas", href: "/activity" },
    { name: "Laporan", href: "/reports" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-surface dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-xl font-bold text-primary dark:text-blue-400"
          >
            TraceBack
          </Link>

          {/* Menu Desktop */}
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
                    "py-5 transition-colors border-b-2",
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

        <div className="flex items-center gap-5">
          <Link
            href="/report"
            className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-800 transition hidden sm:block shadow-sm"
          >
            Lapor Barang
          </Link>
          <button className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            <Bell size={20} />
          </button>
          <button className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hidden sm:block transition-colors">
            <HelpCircle size={20} />
          </button>

          {/* Wrapper Group untuk Trigger Hover Dropdown */}
          <div className="relative group">
            {/* Avatar Button */}
            <Link
              href="/profile"
              className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden cursor-pointer shadow-sm border border-gray-300 dark:border-gray-600 transition group-hover:ring-2 group-hover:ring-primary/50 relative z-10"
            >
              <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                AZ
              </span>
            </Link>

            {/* Dropdown Menu (Slide Down on Hover) */}
            {/* 'pt-2' berfungsi sebagai jembatan agar kursor tidak kehilangan fokus saat bergerak turun */}
            <div className="absolute right-0 top-full pt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 translate-y-2 group-hover:translate-y-0">
              <div className="bg-surface dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col overflow-hidden">
                {/* Header Dropdown: Informasi Utama */}
                <div className="p-5 flex flex-col items-center border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20">
                  <div className="w-14 h-14 bg-primary/10 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3 border border-primary/20 dark:border-blue-500/30">
                    <span className="text-lg font-bold text-primary dark:text-blue-400">
                      AZ
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">
                    Achmad Zacky
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Ilmu Komputer
                  </p>
                  <span className="bg-blue-50 dark:bg-blue-900/20 text-primary dark:text-blue-400 border border-blue-100 dark:border-blue-800 text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                    Mahasiswa
                  </span>
                </div>

                {/* List Menu Links */}
                <div className="flex flex-col py-2">
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
                  <button className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-danger dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors w-full text-left">
                    <LogOut size={16} /> Keluar (Logout)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
