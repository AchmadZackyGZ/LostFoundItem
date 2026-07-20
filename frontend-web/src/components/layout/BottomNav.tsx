"use client";

import { Home, Search, History, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: "Dashboard", href: "/" },
    { icon: Search, label: "Items", href: "/items" },
    { icon: History, label: "Activity", href: "/activity" },
    { icon: User, label: "Profile", href: "/profile" },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50">
      <div className="bg-surface dark:bg-surface-dark shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-full px-6 py-3 flex justify-between items-center border border-gray-100 dark:border-gray-800 transition-colors duration-300">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex flex-col items-center justify-center p-2 rounded-full transition-all duration-300",
                isActive
                  ? "text-primary dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/30"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300",
              )}
            >
              <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
