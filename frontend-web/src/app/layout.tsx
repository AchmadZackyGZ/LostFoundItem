import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/layout/BottomNav";

// 2. Kita inisialisasi font Inter sesuai desain AI Google Stitch
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter", // Variable ini nyambung ke Tailwind v4 kita nanti
});

export const metadata: Metadata = {
  title: "TraceBack | Lost & Found UISI",
  description: "Sistem cerdas pelaporan barang hilang dan temuan kampus UISI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${inter.variable} antialiased font-sans`}
        suppressHydrationWarning
      >
        {/* Main Wrapper: Max-width untuk meniru tampilan Mobile di layar desktop */}
        <main className="max-w-md mx-auto min-h-screen bg-background dark:bg-background-dark relative shadow-2xl overflow-x-hidden pb-24">
          {children}
          <BottomNav />
        </main>
      </body>
    </html>
  );
}
