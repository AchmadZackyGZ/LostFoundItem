"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, HelpCircle } from "lucide-react";
import clsx from "clsx";

export default function TopNav() {
  const pathname = usePathname();

  // Daftar menu yang sudah di-Indonesiakan
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
              // Logika cerdas penentu halaman aktif
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
          <button className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-800 transition hidden sm:block shadow-sm">
            Lapor Barang
          </button>
          <button className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <Bell size={20} />
          </button>
          <button className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hidden sm:block">
            <HelpCircle size={20} />
          </button>
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden cursor-pointer shadow-sm border border-gray-300 dark:border-gray-600">
            <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
              AZ
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
