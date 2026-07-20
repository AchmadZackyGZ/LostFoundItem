<?php

namespace Modules\Item\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Item\Http\Requests\StoreItemRequest;
use Modules\Item\Models\Item;
use Modules\Auth\Contracts\AuthClientInterface; // <-- Import Interface dari Modul Auth

class ItemController extends Controller
{

    private AuthClientInterface $authClient;

    // Suntikkan Interface via Constructor (Dependency Injection)
    public function __construct(AuthClientInterface $authClient)
    {
        $this->authClient = $authClient;
    }

    // get all seluruh daftar laporan barang
    public function index(): JsonResponse
    {
        // 🔥 TAMBAHKAN FILTER: Hanya ambil yang BUKAN pending
        $items = Item::with('category')->where('status', '!=', 'pending')->latest()->get();

        // Mapping data untuk menggabungkan dengan data User (Pelapor)
        $mappedItems = $items->map(function ($item) {
            // Panggil Modul Auth lewat Contract (aturan yang harus diterapkan disini Modular terjaga!)
            $user = $this->authClient->getUserById($item->user_id);

            return [
                'id' => $item->id,
                'type' => $item->type,
                'title' => $item->title,
                'category' => $item->category->name ?? 'Tanpa Kategori',
                'description' => $item->description,
                'location' => $item->location,
                'date' => $item->date,
                'image_path' => $item->image_path,
                'status' => $item->status,
                'is_urgent' => $item->is_urgent,
                'created_at' => $item->created_at,
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

        // Panggil Modul Auth untuk data Pelapor
        $reporter = $this->authClient->getUserById($item->user_id);

        // Mapping data komentar untuk menyisipkan nama pembuat komentar
        $discussions = $item->discussions->map(function ($discussion) {
            $commenter = $this->authClient->getUserById($discussion->user_id);
            return [
                'id' => $discussion->id,
                'message' => $discussion->message,
                'created_at' => $discussion->created_at,
                'user' => [
                    'id' => $commenter['id'] ?? null,
                    'name' => $commenter['name'] ?? 'Anonim',
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
                'image_path' => $item->image_path,
                'status' => $item->status,
                'reporter' => [
                    'name' => $reporter['name'] ?? 'Anonim',
                    'email' => $reporter['email'] ?? '-'
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

    // --- FUNGSI BARU UNTUK 4 BARANG TERBARU DASHBOARD ---
    public function getRecentItems(): JsonResponse
    {
        // Ambil 4 barang terbaru yang statusnya masih aktif
        $items = Item::with('category')
            ->where('status', 'active')
            ->latest()
            ->take(4)
            ->get();

        $mappedItems = $items->map(function ($item) {
            return [
                'id' => $item->id,
                'title' => $item->title,
                'location' => $item->location,
                // Format waktu sederhana, bisa Anda sesuaikan menggunakan Carbon
                'time' => $item->created_at->diffForHumans(),
                'description' => $item->description,
                'status' => 'Hilang', // Karena di tabel Anda status defaultnya 'active' 
                'isUrgent' => (bool) $item->is_urgent,
                'imageUrl' => $item->image_path ?? 'https://via.placeholder.com/400' // Gambar fallback
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
        $imageUrl = null;

        if ($request->hasFile('image')) {
            $uploadedFileUrl = cloudinary()->upload(
                $request->file('image')->getRealPath(),
                [
                    'folder' => 'lost_found_uisi'
                ]
            )->getSecurePath();

            $imageUrl = $uploadedFileUrl;
        }

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

        return response()->json([
            'message' => 'Laporan barang berhasil disetujui dan tayang di publik.',
            'data' => $item
        ], 200);
    }
}
