import { Search } from "lucide-react";

export default function Home() {
  return (
    <div className="p-6">
      {/* Header Section */}
      <header className="flex justify-between items-center mb-8 pt-4">
        <div>
          <h1 className="text-2xl font-bold text-primary dark:text-blue-400 tracking-tight">
            TraceBack
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Kampus UISI
          </p>
        </div>
        <div className="w-10 h-10 bg-secondary dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm">
          {/* Nanti diisi foto profil user */}
          <span className="font-semibold text-gray-600 dark:text-gray-300">
            AZ
          </span>
        </div>
      </header>

      {/* Hero / Quick Actions Placeholder */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Apa yang bisa kami bantu?
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <button className="bg-danger/10 border border-danger/20 text-danger rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-danger/20 transition">
            <Search size={28} />
            <span className="font-medium text-sm">Lapor Kehilangan</span>
          </button>
          <button className="bg-success/10 border border-success/20 text-success rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-success/20 transition">
            <Search size={28} />
            <span className="font-medium text-sm">Lapor Temuan</span>
          </button>
        </div>
      </section>

      {/* Spacer untuk memastikan scroll berjalan mulus */}
      <div className="h-40 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center text-gray-400">
        Area Daftar Barang (Coming Soon)
      </div>
    </div>
  );
}
