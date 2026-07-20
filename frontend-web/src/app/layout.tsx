import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TraceBack - Lost & Found UISI",
  description:
    "Sistem Informasi Lost & Found Universitas Internasional Semen Indonesia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${inter.className} bg-gray-50 dark:bg-background-dark min-h-screen text-gray-900 dark:text-gray-100`}
        suppressHydrationWarning
      >
        {/* Tidak ada lagi TopNav di sini, jadi halaman auth aman! */}
        {children}
      </body>
    </html>
  );
}
