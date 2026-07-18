import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import TopNav from "@/components/layout/TopNav";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

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
        className={`${inter.variable} antialiased font-sans bg-background dark:bg-background-dark text-gray-900 dark:text-gray-100`}
        suppressHydrationWarning
      >
        <TopNav />
        {/* HAPUS max-w-md, biarkan main mengalir bebas (Full Width) */}
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
