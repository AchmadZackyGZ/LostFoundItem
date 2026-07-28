"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  UploadCloud,
  MapPin,
  X,
  Info,
  FileText,
  Send,
  Loader2,
  Compass,
  Navigation,
  Check,
  Building2,
  Maximize2,
  Crosshair,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Move,
  Plus,
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import api from "@/lib/axios";
import axios from "axios";

import { useAuthStore } from "@/store/useAuthStore";

function ReportFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const tabQuery = searchParams.get("tab");
  const reportType = tabQuery === "temuan" ? "temuan" : "kehilangan";

  // --- GLOBAL STATE UNTUK FORM ---
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🚨 PROTEKSI AKUN ADMIN: Admin tidak boleh membuat laporan barang
  useEffect(() => {
    if (user && user.role === "admin") {
      const msg = "admin tidak bisa membuat laporan barang kehilangan dan laporan menemukan barang";
      setErrorMsg(msg);
      alert(msg);
      router.push("/admin");
    }
  }, [user, router]);

  const [formData, setFormData] = useState({
    title: "",
    category_id: "",
    date: "",
    location: "",
    description: "",
  });

  // State Keterangan Lanjutan Lokasi & Peta
  const [locationDetail, setLocationDetail] = useState("");
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isFetchingGps, setIsFetchingGps] = useState(false);

  // Leaflet Map Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapInstance = useRef<unknown>(null);
  const leafletMarkerInstance = useRef<unknown>(null);

  // Default Koordinat Kampus UISI Gresik
  const [selectedCoords, setSelectedCoords] = useState<{
    lat: number;
    lng: number;
  }>({ lat: -7.1584, lng: 112.6555 });

  const [mapAddressPreview, setMapAddressPreview] = useState(
    "Kampus A UISI, Gresik, Jawa Timur",
  );

  // Preset Lokasi Kampus UISI
  const campusPresets = [
    { label: "📍 Kampus A UISI", value: "Kampus A UISI (Gedung Utama), Gresik" },
    { label: "🏬 Kantin Utama", value: "Kantin Utama UISI, Lantai 1" },
    { label: "📚 Perpustakaan", value: "Perpustakaan Kampus A UISI" },
    { label: "💻 Lab Komputer B", value: "Lab Komputer B - Gedung A" },
    { label: "🅿️ Parkiran Utama", value: "Area Parkir Sepeda Motor Kampus A" },
    { label: "🏛️ Lobby Rektorat", value: "Lobby Rektorat UISI" },
    { label: "🎭 Auditorium", value: "Auditorium Kampus UISI" },
  ];

  // STATE KATEGORI DINAMIS
  interface Category {
    id: string;
    name: string;
  }

  const [categories, setCategories] = useState<Category[]>([]);

  // State Ciri-ciri Khusus (Tag Input)
  const [features, setFeatures] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState("");

  // State Multi-Gambar (Wajib minimal 1, Maksimal 5)
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // --- HANDLER INPUT ---
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- HANDLER CIRI-CIRI KHUSUS (TAGS) ---
  const handleAddFeature = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && featureInput.trim() !== "") {
      e.preventDefault();
      if (!features.includes(featureInput.trim())) {
        setFeatures([...features, featureInput.trim()]);
      }
      setFeatureInput("");
    }
  };

  const removeFeature = (tagToRemove: string) => {
    setFeatures(features.filter((tag) => tag !== tagToRemove));
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/api/v1/categories");
        setCategories(response.data);
      } catch (error) {
        console.error("Gagal memuat kategori:", error);
      }
    };
    fetchCategories();
  }, []);

  // --- HANDLER REVERSE GEOCODING ---
  const updateAddressByCoords = async (lat: number, lng: number) => {
    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      );

      const road = res.data?.address?.road || res.data?.address?.suburb || "";
      const city = res.data?.address?.city || res.data?.address?.county || "Gresik";
      const displayName = road
        ? `${road}, ${city} (Kampus UISI)`
        : res.data?.display_name || `Area Kampus UISI (${lat.toFixed(4)}, ${lng.toFixed(4)})`;

      setMapAddressPreview(displayName);
    } catch {
      const fallback = `Area Kampus UISI (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
      setMapAddressPreview(fallback);
    }
  };

  // --- INITIALIZE REAL-TIME LEAFLET DRAGGABLE MAP ---
  useEffect(() => {
    if (!isMapModalOpen) return;

    const loadLeaflet = () => {
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      if ((window as unknown as { L?: unknown }).L) {
        setupLeafletMap();
      } else {
        const script = document.createElement("script");
        script.id = "leaflet-js";
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = () => setupLeafletMap();
        document.body.appendChild(script);
      }
    };

    const setupLeafletMap = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const L = (window as any).L;
      if (!L || !mapContainerRef.current) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (leafletMapInstance.current && (leafletMapInstance.current as any).remove) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (leafletMapInstance.current as any).remove();
      }

      const map = L.map(mapContainerRef.current).setView(
        [selectedCoords.lat, selectedCoords.lng],
        16,
      );
      leafletMapInstance.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      const greenIcon = L.icon({
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      const marker = L.marker([selectedCoords.lat, selectedCoords.lng], {
        draggable: true,
        icon: greenIcon,
      }).addTo(map);
      leafletMarkerInstance.current = marker;

      marker.on("dragend", async () => {
        const pos = marker.getLatLng();
        setSelectedCoords({ lat: pos.lat, lng: pos.lng });
        await updateAddressByCoords(pos.lat, pos.lng);
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map.on("click", async (e: any) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        setSelectedCoords({ lat, lng });
        await updateAddressByCoords(lat, lng);
      });
    };

    const timer = setTimeout(loadLeaflet, 100);
    return () => clearTimeout(timer);
  }, [isMapModalOpen]);

  // --- HANDLER GESER TITIK LOKASI D-PAD & RECENTER ---
  const shiftLocation = async (deltaLat: number, deltaLng: number) => {
    const newLat = selectedCoords.lat + deltaLat;
    const newLng = selectedCoords.lng + deltaLng;
    setSelectedCoords({ lat: newLat, lng: newLng });

    if (leafletMarkerInstance.current && leafletMapInstance.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (leafletMarkerInstance.current as any).setLatLng([newLat, newLng]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (leafletMapInstance.current as any).panTo([newLat, newLng]);
    }

    await updateAddressByCoords(newLat, newLng);
  };

  // --- HANDLER GPS LOCATION DETECTOR ---
  const handleGetCurrentLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      alert("Browser Anda tidak mendukung fungsi deteksi lokasi GPS.");
      return;
    }

    setIsFetchingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setSelectedCoords({ lat, lng });

        if (leafletMarkerInstance.current && leafletMapInstance.current) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (leafletMarkerInstance.current as any).setLatLng([lat, lng]);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (leafletMapInstance.current as any).setView([lat, lng], 17);
        }

        await updateAddressByCoords(lat, lng);
        setFormData((prev) => ({ ...prev, location: mapAddressPreview }));
        setIsFetchingGps(false);
      },
      (err) => {
        console.error("GPS Error:", err);
        alert(
          "Gagal mengakses GPS. Pastikan Anda mengizinkan akses lokasi pada browser.",
        );
        setIsFetchingGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  // --- HANDLER PRESET LOKASI CHIP ---
  const handleSelectPreset = (value: string) => {
    setFormData((prev) => ({ ...prev, location: value }));
    setMapAddressPreview(value);
  };

  // --- HANDLER MULTI-GAMBAR ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    const validFiles: File[] = [];
    const validPreviews: string[] = [];

    for (const file of selectedFiles) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg(`Ukuran foto '${file.name}' melebihi batas maksimal 5MB.`);
        return;
      }
      validFiles.push(file);
      validPreviews.push(URL.createObjectURL(file));
    }

    const updatedImages = [...images, ...validFiles].slice(0, 5);
    const updatedPreviews = [...imagePreviews, ...validPreviews].slice(0, 5);

    setImages(updatedImages);
    setImagePreviews(updatedPreviews);
    setErrorMsg("");

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImageAt = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // --- SUBMIT HANDLER KESELURUHAN ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const todayString = new Date().toISOString().split("T")[0];

    // Validasi Field Wajib
    if (
      !formData.title ||
      !formData.category_id ||
      !formData.date ||
      !formData.location
    ) {
      setErrorMsg("Mohon lengkapi semua field yang wajib diisi (*).");
      return;
    }

    // Validasi Tanggal Tidak Boleh di Masa Depan
    if (formData.date > todayString) {
      setErrorMsg(
        "Tanggal tidak valid. Anda tidak dapat membuat laporan dengan tanggal di masa depan (lebih dari hari ini).",
      );
      return;
    }

    // Validasi WAJIB Mengunggah Minimal 1 Gambar
    if (images.length === 0) {
      setErrorMsg("Mohon unggah minimal 1 foto barang yang dilaporkan (*).");
      return;
    }

    setIsLoading(true);

    try {
      const fullLocation = locationDetail.trim()
        ? `${formData.location} (Detail: ${locationDetail.trim()})`
        : formData.location;

      const finalDescription =
        features.length > 0
          ? `${formData.description}\n\nCiri-ciri khusus: ${features.join(", ")}`
          : formData.description;

      const submitData = new FormData();

      const backendType = reportType === "kehilangan" ? "lost" : "found";
      submitData.append("type", backendType);

      submitData.append("title", formData.title);
      submitData.append("category_id", formData.category_id);
      submitData.append("date", formData.date);
      submitData.append("location", fullLocation);
      submitData.append("description", finalDescription);

      // Append Multi-Images Array
      images.forEach((imgFile) => {
        submitData.append("images[]", imgFile);
      });

      // Fallback single image field
      if (images[0]) {
        submitData.append("image", images[0]);
      }

      await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/sanctum/csrf-cookie`,
        { withCredentials: true },
      );

      await api.post("/api/v1/items", submitData, {
        headers: {
          "Content-Type": undefined,
        },
      });

      window.alert(
        "Laporan berhasil dikirim! Laporan Anda sedang dalam antrean validasi Admin sebelum ditampilkan di dasbor publik.",
      );

      router.push("/");
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message ??
          "Terjadi kesalahan saat mengirim laporan.")
        : "Terjadi kesalahan tidak terduga.";
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 lg:px-8 py-10 max-w-4xl">
      {/* Tab Switcher */}
      <div className="flex justify-center mb-8">
        <div className="bg-surface dark:bg-surface-dark border border-gray-200 dark:border-gray-800 p-1.5 rounded-xl inline-flex shadow-sm">
          <Link
            href="/report?tab=kehilangan"
            className={clsx(
              "px-8 py-2.5 rounded-lg text-sm font-bold transition-all text-center",
              reportType === "kehilangan"
                ? "bg-primary text-white shadow-md"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white",
            )}
          >
            Lapor Kehilangan
          </Link>
          <Link
            href="/report?tab=temuan"
            className={clsx(
              "px-8 py-2.5 rounded-lg text-sm font-bold transition-all text-center",
              reportType === "temuan"
                ? "bg-primary text-white shadow-md"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white",
            )}
          >
            Lapor Temuan
          </Link>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg text-sm font-medium text-center">
          {errorMsg}
        </div>
      )}

      {/* ===================================================================== */}
      {/* FORM 1: LAPOR KEHILANGAN */}
      {/* ===================================================================== */}
      {reportType === "kehilangan" && (
        <div className="bg-surface dark:bg-[#151c2c] border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-orange-400 opacity-80"></div>

          <div className="p-8 md:p-10">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Lapor Kehilangan
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-8">
              Mohon isi detail barang yang hilang seakurat mungkin untuk
              mempermudah proses pencarian.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nama Barang *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full bg-white dark:bg-[#0b1120] border border-gray-300 dark:border-gray-700/60 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all text-gray-900 dark:text-gray-200"
                    placeholder="Misal: Dompet Kulit Hitam"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Kategori *
                  </label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    className="w-full bg-white dark:bg-[#0b1120] border border-gray-300 dark:border-gray-700/60 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all text-gray-900 dark:text-gray-200 appearance-none"
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tanggal Kehilangan *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      max={new Date().toISOString().split("T")[0]}
                      onChange={handleChange}
                      className="w-full bg-white dark:bg-[#0b1120] border border-gray-300 dark:border-gray-700/60 rounded-lg pl-4 pr-10 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all text-gray-900 dark:text-gray-200"
                    />
                  </div>
                </div>

                {/* FEATURE LOKASI TERAKHIR TERLIHAT & PETA PICKER */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Lokasi Terakhir Terlihat *
                    </label>
                    <button
                      type="button"
                      onClick={handleGetCurrentLocation}
                      disabled={isFetchingGps}
                      className="text-xs text-primary dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
                    >
                      {isFetchingGps ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Compass size={13} />
                      )}
                      <span>Gunakan Lokasi Saat Ini (GPS)</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full bg-[#0b1120] border border-gray-700/60 rounded-lg pl-10 pr-28 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all text-gray-200"
                      placeholder="Gedung, Ruangan, atau Area Kampus"
                    />
                    <MapPin
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <button
                      type="button"
                      onClick={() => setIsMapModalOpen(true)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary/10 dark:bg-blue-900/30 text-primary dark:text-blue-400 hover:bg-primary/20 text-xs font-bold px-2.5 py-1.5 rounded-md transition flex items-center gap-1 border border-primary/20"
                    >
                      <Maximize2 size={12} /> Peta
                    </button>
                  </div>
                </div>
              </div>

              {/* CHIPS PRESET LOKASI KAMPUS UISI */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Pilih Cepat Area Kampus UISI:
                </label>
                <div className="flex flex-wrap gap-2">
                  {campusPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPreset(preset.value)}
                      className={clsx(
                        "text-xs px-3 py-1.5 rounded-full border transition font-medium",
                        formData.location === preset.value
                          ? "bg-primary text-white border-primary shadow-sm font-bold"
                          : "bg-gray-50 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary/50",
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* FORM KETERANGAN LANJUTAN LOKASI */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
                  <Building2 size={16} className="text-primary dark:text-blue-400" />
                  Keterangan Lanjutan Lokasi (Detail Spesifik)
                </label>
                <input
                  type="text"
                  value={locationDetail}
                  onChange={(e) => setLocationDetail(e.target.value)}
                  className="w-full bg-white dark:bg-[#0b1120] border border-gray-300 dark:border-gray-700/60 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all text-gray-900 dark:text-gray-200"
                  placeholder="Contoh: Di dekat meja kasir kantin lantai 2 / di bawah bangku baris 3 Lab B / dekat tiang bendera parkiran"
                />
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                  Bantu penemu/pemilik mengenali posisi spesifik barang di dalam ruangan atau area kampus.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Deskripsi Detail Barang
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-white dark:bg-[#0b1120] border border-gray-300 dark:border-gray-700/60 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all text-gray-900 dark:text-gray-200 resize-none"
                  placeholder="Jelaskan secara detail mengenai barang yang hilang..."
                ></textarea>
              </div>

              {/* Fitur Ciri Khusus Dinamis */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Ciri-ciri Khusus
                  </label>
                  <span className="text-[10px] text-gray-500 font-mono tracking-wider">
                    Tekan Enter untuk menambah
                  </span>
                </div>
                <div className="w-full min-h-[50px] bg-white dark:bg-[#0b1120] border border-gray-300 dark:border-gray-700/60 rounded-lg px-3 py-2 flex flex-wrap gap-2 items-center focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                  {features.map((feature, idx) => (
                    <span
                      key={idx}
                      className="bg-primary/10 dark:bg-blue-900/40 border border-primary/20 dark:border-blue-700/50 text-primary dark:text-blue-300 text-xs font-medium px-2.5 py-1.5 rounded-md flex items-center gap-1.5"
                    >
                      {feature}
                      <X
                        size={12}
                        className="cursor-pointer hover:text-red-400"
                        onClick={() => removeFeature(feature)}
                      />
                    </span>
                  ))}
                  <input
                    type="text"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={handleAddFeature}
                    className="flex-grow bg-transparent border-none outline-none text-sm text-gray-900 dark:text-gray-200 placeholder-gray-400 min-w-[150px]"
                    placeholder="Tambah ciri khusus..."
                  />
                </div>
              </div>

              {/* UNGGAH MULTI FOTO BARANG (WAJIB MINIMAL 1, MAKSIMAL 5) */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Unggah Foto Barang *{" "}
                    <span className="text-xs text-primary dark:text-blue-400 font-normal">
                      (Wajib Minimal 1 Foto, Maksimal 5)
                    </span>
                  </label>
                  <span className="text-xs font-mono text-gray-400">
                    {images.length}/5 Foto Dipilih
                  </span>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                />

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-2">
                  {imagePreviews.map((previewUrl, idx) => (
                    <div
                      key={idx}
                      className="relative group border border-gray-300 dark:border-gray-700 rounded-xl overflow-hidden aspect-square bg-gray-100 dark:bg-gray-900 shadow-sm"
                    >
                      <img
                        src={previewUrl}
                        alt={`Preview ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-1 left-1 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        {idx === 0 ? "Utama" : `#${idx + 1}`}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImageAt(idx)}
                        className="absolute top-1 right-1 bg-red-600/90 text-white p-1 rounded-full opacity-90 hover:opacity-100 transition hover:scale-110"
                        title="Hapus foto ini"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}

                  {images.length < 5 && (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={clsx(
                        "flex flex-col justify-center items-center border-2 border-dashed rounded-xl cursor-pointer transition-all aspect-square p-3 text-center group",
                        images.length === 0
                          ? "col-span-full py-8 bg-gray-50 dark:bg-[#0b1120]/50 border-gray-300 dark:border-gray-700 hover:border-primary"
                          : "bg-gray-50 dark:bg-[#0b1120]/50 border-gray-300 dark:border-gray-700 hover:border-primary",
                      )}
                    >
                      <UploadCloud className="h-6 w-6 text-gray-400 group-hover:scale-110 transition-transform group-hover:text-primary mb-1" />
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        {images.length === 0
                          ? "Klik untuk mengunggah foto *"
                          : "+ Tambah Foto"}
                      </p>
                      {images.length === 0 && (
                        <p className="text-[11px] text-gray-400 mt-1">
                          JPG, PNG atau WEBP (Maks 5MB per foto)
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-8 border-t border-gray-100 dark:border-gray-800/80 flex justify-end gap-4">
                <Link
                  href="/"
                  className="px-6 py-2.5 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-transparent dark:border-gray-700"
                >
                  Batal
                </Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2.5 rounded-lg text-sm font-semibold text-blue-900 bg-blue-100 dark:text-blue-900 dark:bg-blue-200 hover:bg-blue-200 dark:hover:bg-blue-300 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                  {isLoading ? "Memproses..." : "Kirim Laporan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* FORM 2: LAPOR TEMUAN */}
      {/* ===================================================================== */}
      {reportType === "temuan" && (
        <div className="bg-surface dark:bg-[#151c2c] border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg overflow-hidden p-8 md:p-10">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Lapor Temuan Barang
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              Bantu kembalikan barang hilang kepada pemiliknya. Isi detail
              barang yang Anda temukan seakurat mungkin.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-8 bg-gray-50/50 dark:bg-[#1a2336] p-6 md:p-8 rounded-2xl border border-gray-100 dark:border-gray-700/50"
          >
            <div>
              <div className="flex items-center gap-2 text-primary dark:text-blue-400 mb-4">
                <Info size={18} />
                <h3 className="font-semibold text-sm">Informasi Dasar</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Nama Barang <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full bg-white dark:bg-[#0b1120] border border-gray-300 dark:border-gray-700/60 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none text-gray-900 dark:text-gray-200"
                    placeholder="Contoh: Dompet Hitam Kulit"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Kategori <span className="text-danger">*</span>
                  </label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    className="w-full bg-white dark:bg-[#0b1120] border border-gray-300 dark:border-gray-700/60 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all text-gray-900 dark:text-gray-200 appearance-none"
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-primary dark:text-blue-400 mb-4">
                <MapPin size={18} />
                <h3 className="font-semibold text-sm">
                  Waktu & Lokasi Penemuan
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Tanggal Ditemukan <span className="text-danger">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      max={new Date().toISOString().split("T")[0]}
                      onChange={handleChange}
                      className="w-full bg-white dark:bg-[#0b1120] border border-gray-300 dark:border-gray-700/60 rounded-lg pl-4 pr-10 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none text-gray-900 dark:text-gray-200"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                      Lokasi (Gedung/Ruangan) <span className="text-danger">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleGetCurrentLocation}
                      disabled={isFetchingGps}
                      className="text-xs text-primary dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
                    >
                      {isFetchingGps ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Compass size={13} />
                      )}
                      <span>Lokasi Saya (GPS)</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full bg-white dark:bg-[#0b1120] border border-gray-300 dark:border-gray-700/60 rounded-lg pl-10 pr-24 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none text-gray-900 dark:text-gray-200"
                      placeholder="Contoh: Gedung A, Lantai 2, R. A201"
                    />
                    <MapPin
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <button
                      type="button"
                      onClick={() => setIsMapModalOpen(true)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary/10 dark:bg-blue-900/30 text-primary dark:text-blue-400 hover:bg-primary/20 text-xs font-bold px-2.5 py-1.5 rounded-md transition flex items-center gap-1 border border-primary/20"
                    >
                      <Maximize2 size={12} /> Peta
                    </button>
                  </div>
                </div>
              </div>

              {/* CHIPS PRESET LOKASI TEMUAN */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Pilih Cepat Area Kampus UISI:
                </label>
                <div className="flex flex-wrap gap-2">
                  {campusPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPreset(preset.value)}
                      className={clsx(
                        "text-xs px-3 py-1.5 rounded-full border transition font-medium",
                        formData.location === preset.value
                          ? "bg-primary text-white border-primary shadow-sm font-bold"
                          : "bg-gray-50 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary/50",
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* KETERANGAN LANJUTAN LOKASI TEMUAN */}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1.5">
                  <Building2 size={15} className="text-primary dark:text-blue-400" />
                  Keterangan Lanjutan Lokasi (Detail Spesifik Posisi Barang)
                </label>
                <input
                  type="text"
                  value={locationDetail}
                  onChange={(e) => setLocationDetail(e.target.value)}
                  className="w-full bg-white dark:bg-[#0b1120] border border-gray-300 dark:border-gray-700/60 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none text-gray-900 dark:text-gray-200"
                  placeholder="Contoh: Diserahkan ke Petugas Pos Satpam Utama / ditaruh di Meja Dosen Ruang A201"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-primary dark:text-blue-400 mb-4">
                <FileText size={18} />
                <h3 className="font-semibold text-sm">Detail Tambahan</h3>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Deskripsi Tambahan
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full bg-white dark:bg-[#0b1120] border border-gray-300 dark:border-gray-700/60 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none text-gray-900 dark:text-gray-200 resize-none"
                    placeholder="Sebutkan ciri-ciri khusus barang..."
                  ></textarea>
                </div>

                {/* UNGGAH MULTI FOTO BARANG (TEMUAN) */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                      Unggah Foto Barang <span className="text-danger">*</span>{" "}
                      <span className="text-[11px] text-primary dark:text-blue-400 font-normal">
                        (Wajib Minimal 1 Foto, Maksimal 5)
                      </span>
                    </label>
                    <span className="text-xs font-mono text-gray-400">
                      {images.length}/5 Foto Dipilih
                    </span>
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                  />

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-2">
                    {imagePreviews.map((previewUrl, idx) => (
                      <div
                        key={idx}
                        className="relative group border border-gray-300 dark:border-gray-700 rounded-xl overflow-hidden aspect-square bg-gray-100 dark:bg-gray-900 shadow-sm"
                      >
                        <img
                          src={previewUrl}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-1 left-1 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                          {idx === 0 ? "Utama" : `#${idx + 1}`}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImageAt(idx)}
                          className="absolute top-1 right-1 bg-red-600/90 text-white p-1 rounded-full opacity-90 hover:opacity-100 transition hover:scale-110"
                          title="Hapus foto ini"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}

                    {images.length < 5 && (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className={clsx(
                          "flex flex-col justify-center items-center border-2 border-dashed rounded-xl cursor-pointer transition-all aspect-square p-3 text-center group",
                          images.length === 0
                            ? "col-span-full py-8 bg-white dark:bg-[#0b1120]/50 border-gray-300 dark:border-gray-700 hover:border-primary"
                            : "bg-white dark:bg-[#0b1120]/50 border-gray-300 dark:border-gray-700 hover:border-primary",
                        )}
                      >
                        <UploadCloud className="h-6 w-6 text-gray-400 group-hover:scale-110 transition-transform group-hover:text-primary mb-1" />
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          {images.length === 0
                            ? "Klik untuk memilih file gambar *"
                            : "+ Tambah Foto"}
                        </p>
                        {images.length === 0 && (
                          <p className="text-[11px] text-gray-400 mt-1">
                            Format: JPG, PNG (Maks. 5MB per foto)
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 flex justify-end gap-4">
              <Link
                href="/"
                className="px-6 py-2.5 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors border border-transparent dark:border-gray-700"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-2.5 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20 flex items-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : null}
                {isLoading ? "Mengirim..." : "Kirim Laporan"}{" "}
                {!isLoading && <Send size={14} className="ml-1" />}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL INTERAKTIF MAP PICKER (REAL-TIME LEAFLET DRAGGABLE PIN MARKER) */}
      {/* ===================================================================== */}
      {isMapModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface dark:bg-[#151c2c] border border-gray-200 dark:border-gray-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
            {/* Header Modal */}
            <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-900/40">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary dark:text-blue-400 flex items-center justify-center font-bold">
                  <Navigation size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">
                    Geser & Tentukan Titik Lokasi Peta (Grab Style)
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Klik atau **seret (drag & drop)** pin hijau langsung di peta.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMapModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Map Canvas & Real-time Leaflet Container */}
            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="relative w-full h-80 rounded-xl overflow-hidden border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 shadow-inner">
                {/* Leaflet Dynamic Canvas Element */}
                <div ref={mapContainerRef} className="w-full h-full z-10" />

                {/* Overlay Grab-Style D-Pad Directional Navigators (Atas, Bawah, Kiri, Kanan) */}
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-20">
                  {/* Top Arrow */}
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => shiftLocation(0.0006, 0)}
                      className="pointer-events-auto bg-white/90 dark:bg-gray-900/90 text-gray-800 dark:text-white p-2 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-primary hover:text-white transition active:scale-90"
                      title="Geser Ke Utara (Atas)"
                    >
                      <ChevronUp size={20} />
                    </button>
                  </div>

                  {/* Middle Row (Left, Center Label, Right) */}
                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => shiftLocation(0, -0.0006)}
                      className="pointer-events-auto bg-white/90 dark:bg-gray-900/90 text-gray-800 dark:text-white p-2 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-primary hover:text-white transition active:scale-90"
                      title="Geser Ke Barat (Kiri)"
                    >
                      <ChevronLeft size={20} />
                    </button>

                    <div className="bg-primary/90 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg border border-white/20 backdrop-blur-md flex items-center gap-1.5 pointer-events-auto">
                      <Move size={13} className="animate-pulse" />
                      <span>Seret (Drag) Pin Hijau atau Klik Peta</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => shiftLocation(0, 0.0006)}
                      className="pointer-events-auto bg-white/90 dark:bg-gray-900/90 text-gray-800 dark:text-white p-2 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-primary hover:text-white transition active:scale-90"
                      title="Geser Ke Timur (Kanan)"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>

                  {/* Bottom Arrow */}
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => shiftLocation(-0.0006, 0)}
                      className="pointer-events-auto bg-white/90 dark:bg-gray-900/90 text-gray-800 dark:text-white p-2 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-primary hover:text-white transition active:scale-90"
                      title="Geser Ke Selatan (Bawah)"
                    >
                      <ChevronDown size={20} />
                    </button>
                  </div>
                </div>

                {/* Badge Overlay Coordinats */}
                <div className="absolute top-3 left-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-mono font-semibold text-gray-900 dark:text-gray-200 flex items-center gap-1.5 shadow-md z-20">
                  <Crosshair size={13} className="text-primary dark:text-blue-400" />
                  <span>
                    {selectedCoords.lat.toFixed(4)}, {selectedCoords.lng.toFixed(4)}
                  </span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50 dark:bg-gray-900/60 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={handleGetCurrentLocation}
                  disabled={isFetchingGps}
                  className="w-full sm:w-auto bg-white dark:bg-gray-800 hover:bg-gray-100 text-gray-800 dark:text-gray-200 text-xs font-semibold px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 transition flex items-center justify-center gap-2"
                >
                  {isFetchingGps ? (
                    <Loader2 size={14} className="animate-spin text-primary" />
                  ) : (
                    <Compass size={14} className="text-primary dark:text-blue-400" />
                  )}
                  Reset ke Lokasi GPS Saya
                </button>

                <div className="text-right text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {mapAddressPreview || "Kampus A UISI, Gresik"}
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-5 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900/40">
              <button
                type="button"
                onClick={() => setIsMapModalOpen(false)}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (mapAddressPreview) {
                    setFormData((prev) => ({
                      ...prev,
                      location: mapAddressPreview,
                    }));
                  }
                  setIsMapModalOpen(false);
                }}
                className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-blue-800 transition shadow-md flex items-center gap-2"
              >
                <Check size={16} /> Gunakan Lokasi Ini
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-20 text-center text-gray-500 font-medium flex justify-center items-center gap-2">
          <Loader2 className="animate-spin" size={20} /> Memuat formulir...
        </div>
      }
    >
      <ReportFormContent />
    </Suspense>
  );
}
