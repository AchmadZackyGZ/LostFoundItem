import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // Mengaktifkan Dark Mode berbasis class
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Palet Warna TraceBack dari Google Stitch
        primary: {
          DEFAULT: "#1E3A8A", // Navy Blue (Sesuai desain)
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#F3F4F6", // Abu-abu terang (Card Light Mode)
          foreground: "#1F2937",
        },
        background: {
          DEFAULT: "#F9FAFB", // Light mode background
          dark: "#0F172A", // Dark Slate (Dark mode background)
        },
        surface: {
          DEFAULT: "#FFFFFF", // Card background
          dark: "#1E293B", // Dark card background
        },
        danger: {
          DEFAULT: "#DC2626", // Merah Crimson untuk Urgent / Lost
          foreground: "#FFFFFF",
        },
        success: {
          DEFAULT: "#10B981", // Hijau untuk Found / Selesai
          foreground: "#FFFFFF",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)"], // Kita akan setup Inter font bawaan Next.js
      },
    },
  },
  plugins: [],
};
export default config;
