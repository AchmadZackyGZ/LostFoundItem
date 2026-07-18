import { Search, PlusCircle } from "lucide-react";
import ItemCard from "@/components/ui/ItemCard";

export default function Home() {
  return (
    <div className="container mx-auto px-4 lg:px-8 py-12">
      {/* Hero Section (Center) */}
      <section className="text-center max-w-3xl mx-auto mb-16 mt-8">
        <h1 className="text-4xl font-bold text-primary dark:text-blue-400 mb-6 tracking-tight">
          Temukan Barangmu yang Hilang
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
          Sistem informasi Lost & Found cerdas untuk lingkungan kampus. Laporkan
          barang hilang atau temuan Anda dengan cepat dan mudah.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="bg-primary text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-blue-800 transition shadow-sm">
            <Search size={20} />
            Lapor Kehilangan
          </button>
          <button className="bg-surface dark:bg-surface-dark text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition shadow-sm">
            <PlusCircle size={20} />
            Lapor Temuan
          </button>
        </div>
      </section>

      {/* Konten Utama */}
      <div className="space-y-6">
        {/* ROW 1: Card Horizontal & Status Sistem */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* INI YANG TADI HILANG: Memanggil ItemCard Horizontal */}
            <ItemCard
              variant="horizontal"
              title="Kunci Mobil Honda HRV"
              location="Area Parkir Gedung A"
              time="30 menit yang lalu"
              description="Kunci mobil Honda dengan gantungan berwarna merah dan hitam. Dilaporkan hilang oleh Bapak Dosen. Harap segera melapor jika menemukan."
              status="Hilang"
              isUrgent={true}
              imageUrl="https://images.unsplash.com/photo-1710006548781-eff5670376fa?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            />
          </div>

          <div className="bg-primary dark:bg-[#15234b] text-white rounded-xl p-6 h-full flex flex-col shadow-md border border-blue-800/30">
            <h3 className="font-semibold text-lg mb-6 text-blue-50">
              Status Sistem Hari Ini
            </h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-blue-700/50 pb-3">
                <span className="text-blue-100/80 text-sm">
                  Barang Dilaporkan
                </span>
                <span className="font-bold text-2xl">12</span>
              </div>
              <div className="flex justify-between items-center border-b border-blue-700/50 pb-3">
                <span className="text-blue-100/80 text-sm">
                  Barang Ditemukan
                </span>
                <span className="font-bold text-2xl">5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-100/80 text-sm">
                  Selesai Dikembalikan
                </span>
                <span className="font-bold text-2xl">3</span>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 2: Grid 3 Kolom Vertical */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ItemCard
            title="Tumblr Corkcicle Hitam"
            location="Gedung 1 Lantai 2, Ruang 104"
            time="2 jam yang lalu"
            status="Menunggu Validasi"
            imageUrl="https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=400&auto=format&fit=crop"
          />
          <ItemCard
            title="iPad Pro 11-inch"
            location="Perpustakaan, Area Diskusi"
            time="4 jam yang lalu"
            status="Hilang"
            imageUrl="https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=400&auto=format&fit=crop"
          />
          <ItemCard
            title="Tas Ransel Navy Eiger"
            location="Kantin Utama"
            time="Kemarin"
            status="Selesai"
            imageUrl="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=400&auto=format&fit=crop"
          />
        </div>

        {/* Tombol Lihat Semua */}
        <div className="pt-8 flex justify-center pb-12">
          <button className="px-6 py-2.5 rounded-md text-sm font-medium border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
            Lihat Semua Laporan
          </button>
        </div>
      </div>
    </div>
  );
}
