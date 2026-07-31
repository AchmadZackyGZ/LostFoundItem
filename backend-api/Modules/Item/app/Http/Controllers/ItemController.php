<?php

namespace Modules\Item\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Item\Http\Requests\StoreItemRequest;
use Modules\Item\Services\ItemService;
use Modules\Auth\Contracts\AuthClientInterface;
use Exception;

class ItemController extends Controller
{
    private ItemService $itemService;
    private AuthClientInterface $authClient;

    public function __construct(
        ItemService $itemService,
        AuthClientInterface $authClient
    ) {
        $this->itemService = $itemService;
        $this->authClient = $authClient;
    }

    /**
     * Seluruh Daftar Laporan Barang (Publik)
     */
    public function index(Request $request): JsonResponse
    {
        $items = $this->itemService->getPublicItems($request->all());

        $mappedItems = $items->map(function ($item) {
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
                'image_path' => $this->itemService->getPrimaryImageUrl($item->image_path),
                'images' => $this->itemService->parseImageUrls($item->image_path),
                'status' => $item->status,
                'is_urgent' => $item->is_urgent,
                'created_at' => $item->created_at,
                'time' => $item->created_at ? $item->created_at->diffForHumans() : '',
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
     * Detail 1 Barang beserta diskusinya
     */
    public function show(string $id): JsonResponse
    {
        $item = $this->itemService->getItemById($id);

        if (!$item) {
            return response()->json(['message' => 'Barang tidak ditemukan'], 404);
        }

        $userCache = [];
        $getUser = function ($userId) use (&$userCache) {
            if (!isset($userCache[$userId])) {
                $userCache[$userId] = $this->authClient->getUserById($userId);
            }
            return $userCache[$userId];
        };

        $reporter = $getUser($item->user_id);

        $discussions = $item->discussions->map(function ($discussion) use ($getUser) {
            $commenter = $getUser($discussion->user_id);
            return [
                'id' => $discussion->id,
                'message' => $discussion->message,
                'created_at' => $discussion->created_at,
                'user' => [
                    'id' => $commenter['id'] ?? null,
                    'name' => $commenter['name'] ?? 'Anonim',
                    'email' => $commenter['email'] ?? '-',
                    'department' => $commenter['department'] ?? 'Informatika',
                    'role' => $commenter['role'] ?? 'Mahasiswa',
                    'nim' => $commenter['nim'] ?? '-',
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
                'image_path' => $this->itemService->getPrimaryImageUrl($item->image_path),
                'images' => $this->itemService->parseImageUrls($item->image_path),
                'status' => $item->status,
                'reporter' => [
                    'name' => $reporter['name'] ?? 'Anonim',
                    'email' => $reporter['email'] ?? '-',
                    'avatar_url' => $reporter['avatar_url'] ?? null,
                ],
                'discussions' => $discussions
            ]
        ], 200);
    }

    /**
     * Dashboard Stats (Publik)
     */
    public function getDashboardStats(): JsonResponse
    {
        $stats = $this->itemService->getDashboardStats();
        return response()->json($stats, 200);
    }

    /**
     * Daftar Kategori Dinamis
     */
    public function getCategories(): JsonResponse
    {
        $categories = $this->itemService->getCategories();
        return response()->json($categories, 200);
    }

    /**
     * Barang Terbaru untuk Hero Banner Publik
     */
    public function getRecentItems(Request $request): JsonResponse
    {
        $limit = (int) $request->input('limit', 7);
        $items = $this->itemService->getRecentItems($limit);

        $mappedItems = $items->map(function ($item) {
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
                'imageUrl' => $this->itemService->getPrimaryImageUrl($item->image_path) ?? 'https://via.placeholder.com/400'
            ];
        });

        return response()->json($mappedItems, 200);
    }

    /**
     * Riwayat Laporan Milik User Login
     */
    public function myItems(Request $request): JsonResponse
    {
        $items = $this->itemService->getMyItems($request->user()->id);

        $mappedItems = $items->map(function ($item) {
            return [
                'id' => $item->id,
                'type' => $item->type,
                'title' => $item->title,
                'image_path' => $this->itemService->getPrimaryImageUrl($item->image_path),
                'images' => $this->itemService->parseImageUrls($item->image_path),
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

    /**
     * Update Laporan Barang
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $newImageFile = $request->hasFile('image') ? $request->file('image') : null;
            $data = $request->only(['title', 'description', 'location', 'category_id']);

            $item = $this->itemService->updateItem($id, $data, $request->user(), $newImageFile);

            return response()->json([
                'message' => 'Laporan barang berhasil diperbarui.',
                'data' => $item
            ], 200);
        } catch (Exception $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
            return response()->json(['message' => $e->getMessage()], $code);
        }
    }

    /**
     * Hapus Laporan Barang Milik User
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        try {
            $this->itemService->deleteItem($id, $request->user());
            return response()->json([
                'message' => 'Laporan barang dan gambar terkait berhasil dihapus dari sistem.'
            ], 200);
        } catch (Exception $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
            return response()->json(['message' => $e->getMessage()], $code);
        }
    }

    /**
     * Tambah Laporan Barang Baru
     */
    public function store(StoreItemRequest $request): JsonResponse
    {
        try {
            $imageFiles = [];
            if ($request->hasFile('images')) {
                $imageFiles = $request->file('images');
            } elseif ($request->hasFile('image')) {
                $imageFiles = [$request->file('image')];
            }

            $item = $this->itemService->createItem(
                $request->only(['category_id', 'type', 'title', 'description', 'location', 'date']),
                $request->user(),
                $imageFiles
            );

            return response()->json([
                'message' => 'Laporan berhasil dibuat.',
                'data' => $item
            ], 201);
        } catch (Exception $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
            return response()->json(['message' => $e->getMessage()], $code);
        }
    }

    // =========================================================================
    // FUNGSI KHUSUS ADMIN
    // =========================================================================

    /**
     * Admin: Antrean Barang Pending
     */
    public function getPendingItems(): JsonResponse
    {
        $items = $this->itemService->getPendingItems();

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
     * Admin: Approve Laporan Pending
     */
    public function approvePendingItem(string $id): JsonResponse
    {
        try {
            $item = $this->itemService->approvePendingItem($id);
            return response()->json([
                'message' => 'Laporan barang berhasil disetujui dan tayang di publik.',
                'data' => $item
            ], 200);
        } catch (Exception $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
            return response()->json(['message' => $e->getMessage()], $code);
        }
    }

    /**
     * Admin: Seluruh Inventaris Barang
     */
    public function getAdminInventory(Request $request): JsonResponse
    {
        $items = $this->itemService->getAdminInventory($request->all());

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
                'image_path' => $this->itemService->getPrimaryImageUrl($item->image_path),
                'images' => $this->itemService->parseImageUrls($item->image_path),
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
     * Admin: Statistik Dashboard
     */
    public function getAdminStats(): JsonResponse
    {
        $stats = $this->itemService->getAdminStats();
        return response()->json($stats, 200);
    }

    /**
     * Admin: Hapus Barang Paksa
     */
    public function adminDestroyItem(string $id): JsonResponse
    {
        try {
            $this->itemService->adminDestroyItem($id);
            return response()->json([
                'message' => 'Laporan barang berhasil dihapus dari inventaris oleh Admin.'
            ], 200);
        } catch (Exception $e) {
            $code = $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 500;
            return response()->json(['message' => $e->getMessage()], $code);
        }
    }
}
