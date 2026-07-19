import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4 py-12">
      {/* Card Register */}
      <div className="w-full max-w-md bg-surface dark:bg-[#0f1523] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Buat Akun Baru
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Bergabung dengan komunitas Lost & Found UISI
          </p>
        </div>

        <form className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
              Name
            </label>
            <input
              type="text"
              className="w-full bg-white dark:bg-[#0b1120] border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
              placeholder="Nama Lengkap"
            />
          </div>

          {/* NIM */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
              NIM
            </label>
            <input
              type="text"
              className="w-full bg-white dark:bg-[#0b1120] border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
              placeholder="Nomor Induk Mahasiswa"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              className="w-full bg-white dark:bg-[#0b1120] border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
              placeholder="email@student.uisi.ac.id"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              className="w-full bg-white dark:bg-[#0b1120] border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
              placeholder="********"
            />
          </div>

          {/* Password Confirmation */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
              Password Confirmation
            </label>
            <input
              type="password"
              className="w-full bg-white dark:bg-[#0b1120] border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600"
              placeholder="********"
            />
          </div>

          {/* Tombol Daftar */}
          <div className="pt-2">
            <button
              type="button"
              className="w-full bg-[#001d66] hover:bg-blue-800 text-white font-bold py-3 rounded-lg flex justify-center items-center transition-colors shadow-md"
            >
              Daftar
            </button>
          </div>
        </form>

        {/* Footer Link */}
        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="text-primary dark:text-blue-400 hover:underline"
          >
            Masuk di sini
          </Link>
        </div>
      </div>
    </div>
  );
}
