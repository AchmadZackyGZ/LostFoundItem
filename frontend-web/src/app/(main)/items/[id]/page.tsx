import {
  ArrowLeft,
  Hand,
  Send,
  CheckCircle2,
  CircleDashed,
  Clock,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ItemDetail() {
  // Dummy data untuk desain UI
  const item = {
    title: "Black Smartwatch",
    status: "Found",
    reportedAt: "Reported 2 days ago",
    location: "Library Fl. 2",
    category: "Electronics",
    refId: "TRK-8492",
    imageUrl:
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=800&auto=format&fit=crop",
    description:
      "Black smartwatch found near the reference section on the second floor of the main library. The screen has a noticeable scratch on the bottom right corner. It has a black silicone strap that shows minor signs of wear.\n\nWhen found, the battery was dead. It has been charged to verify the device powers on, but is currently locked with a passcode. The wallpaper appears to be a landscape photo.",
    features: ["Black Silicone Strap", "Scratched Screen", "Passcode Locked"],
  };

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      {/* Tombol Back */}
      <Link
        href="/"
        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={16} className="mr-2" /> Back to Items
      </Link>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ================= KOLOM KIRI (Gambar & Detail) ================= */}
        <div className="w-full lg:w-3/5 space-y-6">
          {/* Main Image Card */}
          <div className="bg-surface dark:bg-surface-dark rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="relative h-80 md:h-[400px] w-full bg-gray-100 dark:bg-gray-900">
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                priority
                className="object-cover"
              />
              <div className="absolute top-4 right-4">
                <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 text-sm font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm backdrop-blur-md border border-blue-200 dark:border-blue-800">
                  <CheckCircle2 size={16} /> {item.status}
                </span>
              </div>
            </div>

            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-gray-800">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  Category
                </p>
                <p className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  📱 {item.category}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  Location Found
                </p>
                <p className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  📍 {item.location}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                  Reference ID
                </p>
                <p className="font-semibold text-gray-900 dark:text-gray-100 font-mono text-sm">
                  {item.refId}
                </p>
              </div>
            </div>
          </div>

          {/* Details Card */}
          <div className="bg-surface dark:bg-surface-dark rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-800 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Item Details
            </h3>
            <div className="text-gray-600 dark:text-gray-300 leading-relaxed space-y-4 text-sm md:text-base whitespace-pre-line">
              {item.description}
            </div>

            <hr className="my-6 border-gray-100 dark:border-gray-800" />

            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
              Distinguishing Features
            </h4>
            <div className="flex flex-wrap gap-2">
              {item.features.map((feature, idx) => (
                <span
                  key={idx}
                  className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 text-xs px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ================= KOLOM KANAN (Timeline & Diskusi) ================= */}
        <div className="w-full lg:w-2/5 space-y-6">
          {/* Status & Claim Card */}
          <div className="bg-surface dark:bg-surface-dark rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {item.title}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 flex items-center gap-1">
              <Clock size={14} /> {item.reportedAt}
            </p>

            {/* Timeline UI (Slicing) */}
            <div className="flex items-start justify-between mb-10 relative mt-2">
              {/* Garis Background (Abu-abu) - z-0 agar ada di atas background card */}
              <div className="absolute top-[14px] left-4 right-4 h-[2px] bg-gray-200 dark:bg-gray-700/80 z-0"></div>

              {/* Garis Progress (Biru) */}
              <div className="absolute top-[14px] left-4 w-[60%] h-[2px] bg-primary dark:bg-blue-500 z-0 transition-all"></div>

              <div className="flex flex-col items-center gap-2 relative z-10">
                <div className="w-7 h-7 rounded-full bg-primary dark:bg-blue-500 text-white flex items-center justify-center shadow-md">
                  <CheckCircle2 size={16} strokeWidth={3} />
                </div>
                <span className="text-xs font-bold text-gray-900 dark:text-gray-200">
                  Reported
                </span>
              </div>

              <div className="flex flex-col items-center gap-2 relative z-10">
                <div className="w-7 h-7 rounded-full bg-primary dark:bg-blue-500 text-white flex items-center justify-center shadow-md">
                  <CheckCircle2 size={16} strokeWidth={3} />
                </div>
                <span className="text-xs font-bold text-gray-900 dark:text-gray-200">
                  Verified
                </span>
              </div>

              <div className="flex flex-col items-center gap-2 relative z-10">
                {/* Desain khusus untuk status aktif (Found): Lingkaran dengan titik di tengah */}
                <div className="w-7 h-7 rounded-full bg-surface dark:bg-surface-dark border-[3px] border-primary dark:border-blue-500 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 bg-primary dark:bg-blue-500 rounded-full"></div>
                </div>
                <span className="text-xs font-bold text-primary dark:text-blue-400">
                  Found
                </span>
              </div>

              <div className="flex flex-col items-center gap-2 relative z-10">
                <div className="w-7 h-7 rounded-full bg-surface dark:bg-surface-dark border-[3px] border-gray-200 dark:border-gray-700 flex items-center justify-center"></div>
                <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                  Claimed
                </span>
              </div>
            </div>

            <button className="w-full bg-primary text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-800 transition-colors shadow-md">
              <Hand size={18} /> Ini Barang Saya (Klaim)
            </button>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4 px-4 leading-relaxed">
              You will be required to provide proof of ownership upon claiming.
            </p>
          </div>

          {/* Discussion / Chat Modul */}
          <div className="bg-surface dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col h-[400px]">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/20 rounded-t-2xl">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                💬 Discussion
              </h3>
              <span className="text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md">
                2 Messages
              </span>
            </div>

            {/* Area Chat */}
            <div className="flex-grow p-4 overflow-y-auto space-y-4 no-scrollbar">
              {/* Pesan Mahasiswa */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 text-xs font-bold text-gray-600 dark:text-gray-300">
                  JS
                </div>
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-bold text-sm text-gray-900 dark:text-white">
                      Joko S.
                    </span>
                    <span className="text-xs text-gray-500">Yesterday</span>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-2xl rounded-tl-none text-sm text-gray-700 dark:text-gray-300">
                    Does it have a small dent near the crown button? Mine went
                    missing around there on Tuesday.
                  </div>
                </div>
              </div>

              {/* Balasan Admin/Finder */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-xs font-bold text-white shadow-sm">
                  A
                </div>
                <div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-bold text-sm text-gray-900 dark:text-white">
                      Admin (Finder)
                    </span>
                    <span className="text-xs text-gray-500">Today</span>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-3 rounded-2xl rounded-tl-none text-sm text-gray-700 dark:text-gray-300">
                    Hi Joko. I dont see a dent near the crown, only the scratch
                    on the screen mentioned in the description. You are welcome
                    to come to the security desk to inspect it if you think it
                    might be yours.
                  </div>
                </div>
              </div>
            </div>

            {/* Input Chat */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ask a question about this item..."
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-primary dark:focus:border-blue-500 text-gray-900 dark:text-white transition-colors"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-blue-700 p-2 transition-colors">
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
