<?php

namespace Modules\Item\Services;

use Modules\Item\Models\Item;
use App\Models\User;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Support\Facades\DB;
use Exception;

class ItemService
{
    /**
     * Mengambil daftar barang publik dengan filter pencarian & kategori
     */
    public function getPublicItems(array $filters = [])
    {
        $query = Item::with(['category'])
            ->where('status', '!=', 'pending');

        // Filter tipe (lost / found)
        if (!empty($filters['type'])) {
            $type = strtolower($filters['type']);
            if ($type === 'kehilangan') $type = 'lost';
            if ($type === 'temuan') $type = 'found';
            $query->where('type', $type);
        }

        // Filter kategori
        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        // Filter status
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // Search query (judul, lokasi, deskripsi)
        if (!empty($filters['search'])) {
            $search = strtolower($filters['search']);
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(title) LIKE ?', ["%{$search}%"])
                    ->orWhereRaw('LOWER(location) LIKE ?', ["%{$search}%"])
                    ->orWhereRaw('LOWER(description) LIKE ?', ["%{$search}%"])
                    ->orWhere('id', 'like', "%{$search}%");
            });
        }

        return $query->latest()->get();
    }

    /**
     * Mengambil detail barang berdasarkan ID
     */
    public function getItemById(string $itemId): ?Item
    {
        return Item::with(['category', 'discussions' => function ($query) {
            $query->oldest();
        }])->find($itemId);
    }

    /**
     * Membuat laporan barang baru (termasuk upload gambar ke Cloudinary)
     */
    public function createItem(array $data, User $user, array $imageFiles = []): Item
    {
        if ($user->role === 'admin') {
            throw new Exception('Admin tidak diperbolehkan membuat laporan barang.', 403);
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

        $imagePath = count($uploadedUrls) > 1
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
            'image_path' => $imagePath,
            'status' => $data['status'] ?? 'active',
            'is_urgent' => $data['is_urgent'] ?? false,
        ]);

        return $item->load('category');
    }

    /**
     * Admin: Mengambil seluruh inventaris barang
     */
    public function getAdminInventory()
    {
        return Item::with(['category'])
            ->latest()
            ->get();
    }

    /**
     * Admin: Setujui Laporan Barang Pending
     */
    public function approveItem(string $itemId): Item
    {
        $item = Item::findOrFail($itemId);
        $item->update(['status' => 'active']);
        return $item;
    }

    /**
     * Hapus Laporan Barang & Gambar dari Cloudinary
     */
    public function deleteItem(string $itemId, User $user): bool
    {
        $item = Item::findOrFail($itemId);

        if ($user->role !== 'admin' && $item->user_id !== $user->id) {
            throw new Exception('Akses ditolak: Ini bukan laporan barang Anda.', 403);
        }

        if ($item->image_path) {
            if (preg_match('/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/', $item->image_path, $matches)) {
                $publicId = $matches[1];
                try {
                    Cloudinary::destroy($publicId);
                } catch (Exception $e) {
                    logger()->error('Cloudinary delete error: ' . $e->getMessage());
                }
            }
        }

        return $item->delete();
    }
}
