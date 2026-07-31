<?php

namespace Modules\Item\Services;

use Modules\Item\Models\Item;
use Modules\Item\Models\Category;
use Modules\Item\Models\Claim;
use App\Models\User;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Modules\Notification\Contracts\NotificationServiceInterface;
use Exception;

class ItemService
{
    private NotificationServiceInterface $notificationService;

    public function __construct(NotificationServiceInterface $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Parse array URL gambar dari kolom image_path
     */
    public function parseImageUrls(?string $imagePath): array
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

    /**
     * Dapatkan URL gambar utama
     */
    public function getPrimaryImageUrl(?string $imagePath): ?string
    {
        $urls = $this->parseImageUrls($imagePath);
        return $urls[0] ?? null;
    }

    /**
     * Mengambil daftar barang publik dengan filter (Search, Category, Status, Type)
     */
    public function getPublicItems(array $filters = [])
    {
        $query = Item::with('category')->where('status', '!=', 'pending');

        if (!empty($filters['search'])) {
            $search = strtolower($filters['search']);
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(title) LIKE ?', ["%{$search}%"])
                  ->orWhereRaw('LOWER(location) LIKE ?', ["%{$search}%"])
                  ->orWhereRaw('LOWER(description) LIKE ?', ["%{$search}%"])
                  ->orWhere('id', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['type'])) {
            $type = strtolower($filters['type']);
            if ($type === 'kehilangan') $type = 'lost';
            if ($type === 'temuan') $type = 'found';
            $query->where('type', $type);
        }

        return $query->latest()->get();
    }

    /**
     * Detail 1 Barang
     */
    public function getItemById(string $id): ?Item
    {
        return Item::with(['category', 'discussions' => function ($query) {
            $query->oldest();
        }])->find($id);
    }

    /**
     * Ambil Statistik Dashboard Publik
     */
    public function getDashboardStats(): array
    {
        $reported = Item::whereIn('status', ['active'])->count();
        $found = Item::where('type', 'temuan')->where('status', 'active')->count();
        $returned = Item::where('status', 'completed')->count();

        return [
            'reported' => $reported,
            'found' => $found,
            'returned' => $returned,
        ];
    }

    /**
     * Daftar Kategori Dinamis
     */
    public function getCategories()
    {
        return Category::select('id', 'name')->orderBy('name', 'asc')->get();
    }

    /**
     * Barang Terbaru untuk Hero Banner & Vertical Cards
     */
    public function getRecentItems(int $limit = 7)
    {
        $oldestItem = Item::with('category')
            ->where('status', 'active')
            ->oldest()
            ->first();

        if (!$oldestItem) {
            return collect();
        }

        $latestItems = Item::with('category')
            ->where('status', 'active')
            ->where('id', '!=', $oldestItem->id)
            ->latest()
            ->take(max(1, $limit - 1))
            ->get();

        return collect([$oldestItem])->merge($latestItems);
    }

    /**
     * Riwayat Laporan Barang Milik Pengguna Login
     */
    public function getMyItems(string $userId)
    {
        return Item::where('user_id', $userId)
            ->with('category')
            ->latest()
            ->get();
    }

    /**
     * Tambah Laporan Barang Baru oleh Pengguna
     */
    public function createItem(array $data, User $user, array $imageFiles = []): Item
    {
        if ($user->role === 'admin') {
            throw new Exception('admin tidak bisa membuat laporan barang kehilangan dan laporan menemukan barang', 403);
        }

        $uploadedUrls = [];
        if (!empty($imageFiles)) {
            foreach ($imageFiles as $file) {
                $uploadedUrls[] = Cloudinary::upload(
                    $file->getRealPath(),
                    ['folder' => 'lost_found_uisi']
                )->getSecurePath();
            }
        }

        $imageUrl = count($uploadedUrls) > 1
            ? json_encode($uploadedUrls)
            : ($uploadedUrls[0] ?? null);

        $item = Item::create([
            'user_id' => $user->id,
            'category_id' => $data['category_id'],
            'type' => $data['type'],
            'title' => $data['title'],
            'description' => $data['description'],
            'location' => $data['location'],
            'date' => $data['date'],
            'image_path' => $imageUrl,
            'status' => 'pending',
            'is_urgent' => false,
        ]);

        $this->notificationService->send(
            $user->id,
            $item->type === 'lost' ? 'Laporan Barang Hilang Dibuat' : 'Laporan Barang Temuan Dibuat',
            "Anda melaporkan " . ($item->type === 'lost' ? 'kehilangan' : 'penemuan') . " {$item->title} di area {$item->location}.",
            'report',
            "/items/{$item->id}"
        );

        return $item;
    }

    /**
     * Update Laporan Barang Milik Pengguna
     */
    public function updateItem(string $id, array $data, User $user, $newImageFile = null): Item
    {
        $item = Item::findOrFail($id);

        if ($item->user_id !== $user->id) {
            throw new Exception('Akses ditolak: Ini bukan laporan barang Anda.', 403);
        }

        if (in_array($item->status, ['is_pending', 'completed'])) {
            throw new Exception('Laporan tidak bisa diubah karena sedang dalam proses klaim atau sudah selesai.', 400);
        }

        if ($newImageFile) {
            if ($item->image_path) {
                $primaryUrl = $this->getPrimaryImageUrl($item->image_path);
                if ($primaryUrl && preg_match('/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/', $primaryUrl, $matches)) {
                    $publicId = $matches[1];
                    try {
                        Cloudinary::destroy($publicId);
                    } catch (Exception $e) {
                        logger()->error('Cloudinary destroy error: ' . $e->getMessage());
                    }
                }
            }

            $uploadedFileUrl = Cloudinary::upload($newImageFile->getRealPath(), [
                'folder' => 'lost_found_uisi'
            ])->getSecurePath();

            $data['image_path'] = $uploadedFileUrl;
        }

        $item->update($data);
        return $item;
    }

    /**
     * Hapus Laporan Barang Milik Pengguna
     */
    public function deleteItem(string $id, User $user): bool
    {
        $item = Item::findOrFail($id);

        if ($user->role !== 'admin' && $item->user_id !== $user->id) {
            throw new Exception('Akses ditolak: Ini bukan laporan barang Anda.', 403);
        }

        if ($item->image_path) {
            $urls = $this->parseImageUrls($item->image_path);
            foreach ($urls as $url) {
                if (preg_match('/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/', $url, $matches)) {
                    try {
                        Cloudinary::destroy($matches[1]);
                    } catch (Exception $e) {
                        logger()->error('Cloudinary delete error: ' . $e->getMessage());
                    }
                }
            }
        }

        return $item->delete();
    }

    /**
     * Admin: Antrean Barang Pending
     */
    public function getPendingItems()
    {
        return Item::with('category')->where('status', 'pending')->latest()->get();
    }

    /**
     * Admin: Disetujui Laporan Pending
     */
    public function approvePendingItem(string $id): Item
    {
        $item = Item::findOrFail($id);

        if ($item->status !== 'pending') {
            throw new Exception('Laporan ini tidak dalam status pending', 400);
        }

        $item->update(['status' => 'active']);

        $this->notificationService->send(
            $item->user_id,
            'Laporan Barang Disetujui',
            "Laporan anda untuk {$item->title} telah diverifikasi dan disetujui oleh admin.",
            'report',
            "/items/{$item->id}"
        );

        return $item;
    }

    /**
     * Admin: Seluruh Inventaris Barang
     */
    public function getAdminInventory(array $filters = [])
    {
        $query = Item::with('category')->latest();

        if (!empty($filters['type']) && in_array($filters['type'], ['lost', 'found'])) {
            $query->where('type', $filters['type']);
        }

        if (!empty($filters['status']) && in_array($filters['status'], ['pending', 'active', 'is_pending', 'completed'])) {
            $query->where('status', $filters['status']);
        }

        return $query->get();
    }

    /**
     * Admin: Statistik Dashboard Admin
     */
    public function getAdminStats(): array
    {
        $totalItems = Item::count();
        $completedItems = Item::where('status', 'completed')->count();
        $successRate = $totalItems > 0 ? round(($completedItems / $totalItems) * 100, 1) : 0;
        $pendingClaims = Claim::where('status', 'pending')->count();
        $activeUsers = User::count();

        return [
            'total_items' => $totalItems,
            'completed_items' => $completedItems,
            'success_rate' => $successRate,
            'pending_claims' => $pendingClaims,
            'active_users' => $activeUsers,
        ];
    }

    /**
     * Admin: Hapus Laporan Barang Secara Paksa oleh Admin
     */
    public function adminDestroyItem(string $id): bool
    {
        $item = Item::findOrFail($id);

        if ($item->image_path) {
            $urls = $this->parseImageUrls($item->image_path);
            foreach ($urls as $url) {
                if (preg_match('/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/', $url, $matches)) {
                    try {
                        Cloudinary::destroy($matches[1]);
                    } catch (Exception $e) {
                        logger()->error('Cloudinary destroy error: ' . $e->getMessage());
                    }
                }
            }
        }

        return $item->delete();
    }
}
