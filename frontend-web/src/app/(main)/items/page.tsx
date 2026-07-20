import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import ItemCard from "@/components/ui/ItemCard";

export default function ItemsPage() {
  // Dummy data untuk daftar seluruh barang
  const allItems = [
    {
      id: "1",
      title: "Kunci Mobil Honda HRV",
      location: "Area Parkir Gedung A",
      time: "30 menit yang lalu",
      status: "Hilang" as const,
      imageUrl:
        "https://images.unsplash.com/photo-1562234035-7798782a9314?q=80&w=600&auto=format&fit=crop",
    },
    {
      id: "2",
      title: "Tumblr Corkcicle Hitam",
      location: "Gedung 1 Lantai 2, Ruang 104",
      time: "2 jam yang lalu",
      status: "Menunggu Validasi" as const,
      imageUrl:
        "https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=400&auto=format&fit=crop",
    },
    {
      id: "3",
      title: "iPad Pro 11-inch",
      location: "Perpustakaan, Area Diskusi",
      time: "4 jam yang lalu",
      status: "Hilang" as const,
      imageUrl:
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=400&auto=format&fit=crop",
    },
    {
      id: "4",
      title: "Tas Ransel Navy Eiger",
      location: "Kantin Utama",
      time: "Kemarin",
      status: "Selesai" as const,
      imageUrl:
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=400&auto=format&fit=crop",
    },
    {
      id: "5",
      title: "Dompet Kulit Coklat",
      location: "Lobby Gedung Utama",
      time: "Kemarin",
      status: "Menunggu Validasi" as const,
      imageUrl:
        "https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=400&auto=format&fit=crop",
    },
    {
      id: "6",
      title: "Kacamata Frame Hitam",
      location: "Ruang Kelas B302",
      time: "2 Hari yang lalu",
      status: "Hilang" as const,
      imageUrl:
        "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=400&auto=format&fit=crop",
    },
    {
      id: "7",
      title: "Flashdisk SanDisk 64GB",
      location: "Laboratorium Komputer 1",
      time: "3 Hari yang lalu",
      status: "Selesai" as const,
      imageUrl:
        "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=400&auto=format&fit=crop",
    },
    {
      id: "8",
      title: "Buku Catatan Pemrograman",
      location: "Perpustakaan Lantai 1",
      time: "Minggu Lalu",
      status: "Menunggu Validasi" as const,
      imageUrl:
        "https://images.unsplash.com/photo-1531346878377-380d52b2f6dc?q=80&w=400&auto=format&fit=crop",
    },
  ];

  return (
    <div className="container mx-auto px-4 lg:px-8 py-10 max-w-7xl">
      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Eksplorasi Barang
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Cari dan temukan barang yang dilaporkan di lingkungan kampus.
          </p>
        </div>
      </div>

      {/* Baris Pencarian & Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-10">
        {/* Input Pencarian */}
        <div className="flex-grow relative">
          <input
            type="text"
            placeholder="Cari nama barang, lokasi, atau ID referensi..."
            className="w-full bg-surface dark:bg-surface-dark border border-gray-200 dark:border-gray-800 rounded-xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all text-gray-900 dark:text-white shadow-sm"
          />
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
        </div>

        {/* Tombol Filter */}
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-surface dark:bg-surface-dark border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 px-5 py-3.5 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors shadow-sm whitespace-nowrap">
            Kategori <ChevronDown size={16} />
          </button>
          <button className="flex items-center gap-2 bg-surface dark:bg-surface-dark border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 px-5 py-3.5 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors shadow-sm whitespace-nowrap">
            Status <ChevronDown size={16} />
          </button>
          <button className="flex items-center gap-2 bg-primary text-white px-5 py-3.5 rounded-xl text-sm font-medium hover:bg-blue-800 transition-colors shadow-sm whitespace-nowrap">
            <SlidersHorizontal size={16} />{" "}
            <span className="hidden sm:inline">Filter Lainnya</span>
          </button>
        </div>
      </div>

      {/* Grid Katalog Barang (Memanggil Komponen ItemCard) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {allItems.map((item) => (
          <ItemCard
            key={item.id}
            id={item.id}
            title={item.title}
            location={item.location}
            time={item.time}
            status={item.status}
            imageUrl={item.imageUrl}
          />
        ))}
      </div>

      {/* Tombol Muat Lebih Banyak */}
      <div className="mt-12 flex justify-center">
        <button className="px-8 py-3 rounded-xl text-sm font-semibold text-primary dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors border border-blue-100 dark:border-blue-800/50">
          Muat Lebih Banyak
        </button>
      </div>
    </div>
  );
}
