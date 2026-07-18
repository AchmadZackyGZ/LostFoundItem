import Link from "next/link";
import { Bell, HelpCircle } from "lucide-react";

export default function TopNav() {
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
            <Link
              href="/"
              className="text-primary dark:text-blue-400 border-b-2 border-primary dark:border-blue-400 py-5"
            >
              Dashboard
            </Link>
            <Link
              href="/items"
              className="hover:text-primary transition-colors"
            >
              Items
            </Link>
            <Link
              href="/activity"
              className="hover:text-primary transition-colors"
            >
              Activity
            </Link>
            <Link
              href="/reports"
              className="hover:text-primary transition-colors"
            >
              Reports
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-5">
          <button className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-800 transition hidden sm:block">
            Report Item
          </button>
          <button className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <Bell size={20} />
          </button>
          <button className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hidden sm:block">
            <HelpCircle size={20} />
          </button>
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden cursor-pointer">
            <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
              AZ
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
