<?php

namespace Modules\Item\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Item\Http\Requests\StoreItemRequest;
use Modules\Item\Models\Item;
use Modules\Auth\Contracts\AuthClientInterface; // <-- Import Interface dari Modul Auth
use Modules\Notification\Contracts\NotificationServiceInterface; // <-- Import Interface dari Modul Notification

class ItemController extends Controller
{

    private AuthClientInterface $authClient;
    private NotificationServiceInterface $notificationService;

    // Suntikkan Interface via Constructor (Dependency Injection)
    public function __construct(
        AuthClientInterface $authClient,
        NotificationServiceInterface $notificationService
    ) {
        $this->authClient = $authClient;
        $this->notificationService = $notificationService;
    }

    private function parseImageUrls(?string $imagePath): array
    {
        if (empty($imagePath)) {
            return [];
        }

        if (str_starts_with(trim($imagePath), '[')) {
            $decoded = json_decode($imagePath, true);
            if (is_array($decoded)) {
                return $decoded;
            }
        }

        return [$imagePath];
    }

    private function getPrimaryImageUrl(?string $imagePath): ?string
    {
        $urls = $this->parseImageUrls($imagePath);
        return $urls[0] ?? null;
    }

    // get all seluruh daftar laporan barang
    public function index(Request $request): JsonResponse
    {
        // 🔥 TAMBAHKAN FILTER: Hanya ambil yang BUKAN pending
        $query = Item::with('category')->where('status', '!=', 'pending');

        // Filter Pencarian (Nama, Lokasi, Deskripsi, ID)
        if ($request->filled('search')) {
            $search = strtolower($request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(title) LIKE ?', ["%{$search}%"])
                  ->orWhereRaw('LOWER(location) LIKE ?', ["%{$search}%"])
                  ->orWhereRaw('LOWER(description) LIKE ?', ["%{$search}%"])
                  ->orWhere('id', 'like', "%{$search}%");
            });
        }

        // Filter Kategori
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->input('category_id'));
        }

        // Filter Status (active, is_pending, completed)
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        // Filter Tipe (lost / found atau kehilangan / temuan)
        if ($request->filled('type')) {
            $type = strtolower($request->input('type'));
            if ($type === 'kehilangan') $type = 'lost';
            if ($type === 'temuan') $type = 'found';
            $query->where('type', $type);
        }

        $items = $query->latest()->get();

        // Mapping data untuk menggabungkan dengan data User (Pelapor)
        $mappedItems = $items->map(function ($item) {
            // Panggil Modul Auth lewat Contract (aturan yang harus diterapkan disini Modular terjaga!)
            $user = $this->authClient->getUserById($item->user_id);

            return [
                'id' => $item->id,
                'type' => $item->type,
                'title' => $item->title,
                'category' => $item->category->name ?? 'Tanpa Kategori',
                'category_id' => $item->category_id,
                'description' => $item->description,
                'location' => $item->location,
                'date' => $item->date,
                'image_path' => $this->getPrimaryImageUrl($item->image_path),
                'images' => $this->parseImageUrls($item->image_path),
                'status' => $item->status,
                'is_urgent' => $item->is_urgent,
                'created_at' => $item->created_at,
                'time' => $item->created_at ? $item->created_at->diffForHumans() : '',
                // Gabungkan data user ke dalam respons
                'reporter' => [
                    'id' => $user['id'] ?? null,
                    'name' => $user['name'] ?? 'Anonim',
                    'email' => $user['email'] ?? '-'
                ]
            ];
        });

        return response()->json([
            'message' => 'Berhasil mengambil data laporan',
            'data' => $mappedItems
        ], 200);
    }

    /**
     * Menampilkan detail 1 barang beserta diskusinya
     */
    public function show(string $id): JsonResponse
    {
        // Ambil barang beserta relasi kategori dan diskusi (diurutkan dari komentar terlama ke terbaru)
        $item = Item::with(['category', 'discussions' => function ($query) {
            $query->oldest();
        }])->find($id);

        if (!$item) {
            return response()->json(['message' => 'Barang tidak ditemukan'], 404);
        }

        // Cache user lookups in memory to avoid repeated DB/API calls
        $userCache = [];
        $getUser = function ($userId) use (&$userCache) {
            if (!isset($userCache[$userId])) {
                $userCache[$userId] = $this->authClient->getUserById($userId);
            }
            return $userCache[$userId];
        };

        // Panggil Modul Auth untuk data Pelapor
        $reporter = $getUser($item->user_id);

        // Mapping data komentar untuk menyisipkan nama pembuat komentar
        $discussions = $item->discussions->map(function ($discussion) use ($getUser) {
            $commenter = $getUser($discussion->user_id);
            return [
                'id' => $discussion->id,
                'message' => $discussion->message,
                'created_at' => $discussion->created_at,
                'user' => [
                    'id' => $commenter['id'] ?? null,
                    'name' => $commenter['name'] ?? 'Anonim',
                    'avatar_url' => $commenter['avatar_url'] ?? null,
                ]
            ];
        });

        return response()->json([
            'message' => 'Berhasil mengambil detail laporan',
            'data' => [
                'id' => $item->id,
                'type' => $item->type,
                'title' => $item->title,
                'category' => $item->category->name ?? 'Tanpa Kategori',
                'description' => $item->description,
                'location' => $item->location,
                'date' => $item->date,
                'image_path' => $this->getPrimaryImageUrl($item->image_path),
                'images' => $this->parseImageUrls($item->image_path),
                'status' => $item->status,
                'reporter' => [
                    'name' => $reporter['name'] ?? 'Anonim',
                    'email' => $reporter['email'] ?? '-',
                    'avatar_url' => $reporter['avatar_url'] ?? null,
                ],
                'discussions' => $discussions // Masukkan array komentar yang sudah di-mapping
            ]
        ], 200);
    }

    // --- FUNGSI BARU UNTCH DASHBOARD STATS ---
    public function getDashboardStats(): JsonResponse
    {
        // Hitung total laporan aktif yang belum selesai/dikembalikan (Hilang & Ditemukan)
        $reported = Item::whereIn('status', ['active'])->count();

        // Misalkan Anda memiliki cara khusus melacak 'found', namun dari struktur Anda sepertinya
        // bisa diambil dari tipe (type) laporan yang dilaporkan sebagai 'temuan'
        $found = Item::where('type', 'temuan')->where('status', 'active')->count();

        // Hitung total laporan yang sudah berstatus 'completed' (Selesai/Dikembalikan)
        $returned = Item::where('status', 'completed')->count();

        return response()->json([
            'reported' => $reported,
            'found' => $found,
            'returned' => $returned
        ], 200);
    }

    // --- FUNGSI AMBIL KATEGORI DINAMIS ---
    public function getCategories(): \Illuminate\Http\JsonResponse
    {
        // Ambil semua kategori, urutkan berdasarkan abjad nama
        $categories = \Modules\Item\Models\Category::select('id', 'name')
            ->orderBy('name', 'asc')
            ->get();

        return response()->json($categories, 200);
    }

    // --- FUNGSI AMBIL BARANG UNTUK DASHBOARD PUBLIK (HERO BANNER = BARANG TERLAMA) ---
    public function getRecentItems(Request $request): JsonResponse
    {
        $limit = (int) $request->input('limit', 7); // Default 7 items (1 hero + 6 vertical cards)

        // 1. Ambil 1 barang tayang (active) dengan waktu terlama (oldest) untuk Featured Banner Utama
        $oldestItem = Item::with('category')
            ->where('status', 'active')
            ->oldest()
            ->first();

        if (!$oldestItem) {
            return response()->json([], 200);
        }

        // 2. Ambil sisanya dari laporan terbaru (latest)
        $latestItems = Item::with('category')
            ->where('status', 'active')
            ->where('id', '!=', $oldestItem->id)
            ->latest()
            ->take(max(1, $limit - 1))
            ->get();

        // 3. Gabungkan: Paling depan [0] adalah barang waktu TERLAMA
        $allFeaturedItems = collect([$oldestItem])->merge($latestItems);

        $mappedItems = $allFeaturedItems->map(function ($item) {
            return [
                'id' => $item->id,
                'title' => $item->title,
                'category' => $item->category->name ?? 'Tanpa Kategori',
                'location' => $item->location,
                'time' => $item->created_at ? $item->created_at->diffForHumans() : 'Baru saja',
                'created_at' => $item->created_at,
                'description' => $item->description,
                'status' => $item->type === 'lost' ? 'Hilang' : 'Temuan',
                'type' => $item->type,
                'isUrgent' => (bool) $item->is_urgent,
                'imageUrl' => $this->getPrimaryImageUrl($item->image_path) ?? 'https://via.placeholder.com/400'
            ];
        });

        return response()->json($mappedItems, 200);
    }

    public function myItems(Request $request): JsonResponse
    {
        // Ambil ID user yang sedang login dari token
        $userId = $request->user()->id;

        // Tarik data barang yang HANYA milik user ini
        $items = Item::where('user_id', $userId)
            ->with('category') // Eager load kategori agar tidak N+1 problem
            ->latest()
            ->get();

        // Rapikan struktur JSON (Mapping)
        $mappedItems = $items->map(function ($item) {
            return [
                'id' => $item->id,
                'type' => $item->type,
                'title' => $item->title,
                'image_path' => $this->getPrimaryImageUrl($item->image_path),
                'images' => $this->parseImageUrls($item->image_path),
                'category' => $item->category->name ?? 'Tanpa Kategori',
                'status' => $item->status,
                'date' => $item->date,
                'created_at' => $item->created_at,
            ];
        });

        return response()->json([
            'message' => 'Berhasil mengambil riwayat laporan barang Anda',
            'data' => $mappedItems
        ], 200);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $item = Item::find($id);

        if (!$item) {
            return response()->json(['message' => 'Barang tidak ditemukan'], 404);
        }

        // 🚨 GEMBOK KEPEMILIKAN
        if ($item->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Akses ditolak: Ini bukan laporan barang Anda.'
            ], 403);
        }

        // 🔥 TAMBAHAN: GEMBOK STATUS (Tidak boleh edit barang yang sedang diproses/selesai)
        if (in_array($item->status, ['is_pending', 'completed'])) {
            return response()->json([
                'message' => 'Laporan tidak bisa diubah karena sedang dalam proses klaim atau sudah selesai.'
            ], 400);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'location' => 'sometimes|string',
            'category_id' => 'sometimes|exists:categories,id',
            'image' => 'sometimes|image|mimes:jpeg,png,jpg,webp|max:5120'
        ]);

        // ☁️ LOGIKA PENGGANTIAN GAMBAR CLOUDINARY
        if ($request->hasFile('image')) {
            // --- AWAL FITUR HAPUS GAMBAR LAMA ---
            if ($item->image_path) {
                // Ekstrak Public ID dari URL panjang menggunakan Regex
                if (preg_match('/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/', $item->image_path, $matches)) {
                    $publicId = $matches[1];
                    cloudinary()->destroy($publicId); // Tembak API hapus ke Cloudinary
                }
            }
            // --- AKHIR FITUR HAPUS GAMBAR LAMA ---

            // Upload gambar baru
            $uploadedFileUrl = cloudinary()->upload($request->file('image')->getRealPath(), [
                'folder' => 'lost_found_uisi/items'
            ])->getSecurePath();

            $validated['image_path'] = $uploadedFileUrl;
        }

        $item->update($validated);

        return response()->json([
            'message' => 'Laporan barang berhasil diperbarui',
            'data' => $item
        ], 200);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $item = Item::find($id);

        if (!$item) {
            return response()->json(['message' => 'Barang tidak ditemukan'], 404);
        }

        // 🚨 GEMBOK KEPEMILIKAN
        if ($item->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Akses ditolak: Anda tidak berhak menghapus laporan ini.'
            ], 403);
        }

        // 🔥 PERBAIKAN: Hanya blokir jika statusnya sedang diklaim atau sudah selesai
        if (in_array($item->status, ['is_pending', 'completed'])) {
            return response()->json([
                'message' => 'Laporan tidak bisa dihapus karena sedang dalam proses klaim atau sudah diselesaikan.'
            ], 400);
        }

        // // 🚨 CEGAH HAPUS SAAT PROSES KLAIM
        // if ($item->status !== 'active') {
        //     return response()->json([
        //         'message' => 'Laporan tidak bisa dihapus karena sedang dalam proses klaim oleh orang lain.'
        //     ], 400);
        // }

        // ☁️ HAPUS GAMBAR DARI CLOUDINARY SEBELUM DATA DIHAPUS
        if ($item->image_path) {
            if (preg_match('/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/', $item->image_path, $matches)) {
                $publicId = $matches[1];
                cloudinary()->destroy($publicId);
            }
        }

        // Eksekusi Delete dari Database
        $item->delete();

        return response()->json([
            'message' => 'Laporan barang dan gambar terkait berhasil dihapus dari sistem.'
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreItemRequest $request): JsonResponse
    {
        // 🚨 GEMBOK AKUN ROLE ADMIN: Admin tidak diperbolehkan membuat laporan barang
        if ($request->user()->role === 'admin') {
            error_log("admin tidak bisa membuat laporan barang kehilangan dan laporan menemukan barang");
            \Illuminate\Support\Facades\Log::warning("admin tidak bisa membuat laporan barang kehilangan dan laporan menemukan barang");

            return response()->json([
                'message' => 'admin tidak bisa membuat laporan barang kehilangan dan laporan menemukan barang'
            ], 403);
        }

        $uploadedUrls = [];

        // Upload multiple images if 'images' array is sent
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $uploadedUrls[] = cloudinary()->upload(
                    $file->getRealPath(),
                    [
                        'folder' => 'lost_found_uisi'
                    ]
                )->getSecurePath();
            }
        } elseif ($request->hasFile('image')) {
            // Fallback jika dikirim via field single 'image'
            $uploadedUrls[] = cloudinary()->upload(
                $request->file('image')->getRealPath(),
                [
                    'folder' => 'lost_found_uisi'
                ]
            )->getSecurePath();
        }

        // Jika lebih dari 1 gambar, simpan sebagai JSON String. Jika 1 gambar, simpan URL langsung.
        $imageUrl = count($uploadedUrls) > 1
            ? json_encode($uploadedUrls)
            : ($uploadedUrls[0] ?? null);

        // 2. Simpan Data ke Database
        $item = Item::create([
            'user_id' => $request->user()->id, // Ambil UUID langsung dari token Sanctum (aman!)
            'category_id' => $request->category_id,
            'type' => $request->type,
            'title' => $request->title,
            'description' => $request->description,
            'location' => $request->location,
            'date' => $request->date,
            'image_path' => $imageUrl,
            'status' => 'pending',
            'is_urgent' => false,
        ]);

        // 3. Kirim Notifikasi via Contract (Modular Monolith)
        $this->notificationService->send(
            $request->user()->id,
            $item->type === 'lost' ? 'Laporan Barang Hilang Dibuat' : 'Laporan Barang Temuan Dibuat',
            "Anda melaporkan " . ($item->type === 'lost' ? 'kehilangan' : 'penemuan') . " {$item->title} di area {$item->location}.",
            'report',
            "/items/{$item->id}"
        );

        return response()->json([
            'message' => 'Laporan berhasil dibuat.',
            'data' => $item
        ], 201);
    }

    // =========================================================================
    // FUNGSI KHUSUS ADMIN (PRD: VALIDASI LAPORAN BARU)
    // =========================================================================

    /**
     * Admin: Melihat daftar laporan yang masih pending
     */
    public function getPendingItems(): JsonResponse
    {
        $items = Item::with('category')->where('status', 'pending')->latest()->get();

        $mappedItems = $items->map(function ($item) {
            $user = $this->authClient->getUserById($item->user_id);
            return [
                'id' => $item->id,
                'type' => $item->type,
                'title' => $item->title,
                'category' => $item->category->name ?? 'Tanpa Kategori',
                'date' => $item->date,
                'reporter' => $user['name'] ?? 'Anonim'
            ];
        });

        return response()->json([
            'message' => 'Berhasil mengambil daftar antrean laporan baru',
            'data' => $mappedItems
        ], 200);
    }

    /**
     * Admin: Menyetujui laporan agar tayang di publik
     */
    public function approvePendingItem(string $id): JsonResponse
    {
        $item = Item::find($id);

        if (!$item) {
            return response()->json(['message' => 'Laporan barang tidak ditemukan'], 404);
        }

        if ($item->status !== 'pending') {
            return response()->json(['message' => 'Laporan ini tidak dalam status pending'], 400);
        }

        // Ubah status menjadi active agar tayang di dasbor publik
        $item->update(['status' => 'active']);

        // Kirim Notifikasi via Contract (Modular Monolith)
        $this->notificationService->send(
            $item->user_id,
            'Laporan Barang Disetujui',
            "Laporan anda untuk {$item->title} telah diverifikasi dan disetujui oleh admin.",
            'report',
            "/items/{$item->id}"
        );

        return response()->json([
            'message' => 'Laporan barang berhasil disetujui dan tayang di publik.',
            'data' => $item
        ], 200);
    }

    /**
     * Admin: Melihat seluruh inventaris barang (Semua Status)
     */
    public function getAdminInventory(Request $request): JsonResponse
    {
        $query = Item::with('category')->latest();

        if ($request->has('type') && in_array($request->type, ['lost', 'found'])) {
            $query->where('type', $request->type);
        }

        if ($request->has('status') && in_array($request->status, ['pending', 'active', 'is_pending', 'completed'])) {
            $query->where('status', $request->status);
        }

        $items = $query->get();

        $mappedItems = $items->map(function ($item) {
            $user = $this->authClient->getUserById($item->user_id);
            return [
                'id' => $item->id,
                'type' => $item->type,
                'title' => $item->title,
                'category' => $item->category->name ?? 'Tanpa Kategori',
                'location' => $item->location,
                'description' => $item->description,
                'date' => $item->date,
                'image_path' => $this->getPrimaryImageUrl($item->image_path),
                'images' => $this->parseImageUrls($item->image_path),
                'status' => $item->status,
                'created_at' => $item->created_at,
                'reporter' => [
                    'id' => $user['id'] ?? $item->user_id,
                    'name' => $user['name'] ?? 'Anonim',
                    'email' => $user['email'] ?? '-',
                    'avatar_url' => $user['avatar_url'] ?? null,
                ]
            ];
        });

        return response()->json([
            'message' => 'Berhasil mengambil seluruh data inventaris admin',
            'data' => $mappedItems
        ], 200);
    }

    /**
     * Admin: Statistik Lengkap Dashboard Admin (Real Database Analytics)
     */
    public function getAdminStats(): JsonResponse
    {
        $totalItems = Item::count();
        $completedItems = Item::where('status', 'completed')->count();
        $successRate = $totalItems > 0 ? round(($completedItems / $totalItems) * 100, 1) : 0;
        $pendingClaims = \Modules\Item\Models\Claim::where('status', 'pending')->count();
        $activeUsers = \App\Models\User::count();

        return response()->json([
            'total_items' => $totalItems,
            'completed_items' => $completedItems,
            'success_rate' => $successRate,
            'pending_claims' => $pendingClaims,
            'active_users' => $activeUsers,
        ], 200);
    }

    /**
     * Admin: Menghapus laporan barang secara paksa dari inventaris
     */
    public function adminDestroyItem(string $id): JsonResponse
    {
        $item = Item::find($id);

        if (!$item) {
            return response()->json(['message' => 'Barang tidak ditemukan'], 404);
        }

        if ($item->image_path) {
            if (preg_match('/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/', $item->image_path, $matches)) {
                $publicId = $matches[1];
                cloudinary()->destroy($publicId);
            }
        }

        $item->delete();

        return response()->json([
            'message' => 'Laporan barang berhasil dihapus dari inventaris oleh Admin.'
        ], 200);
    }
}
