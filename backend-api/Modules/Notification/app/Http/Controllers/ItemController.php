<?php

namespace Modules\Item\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Modules\Item\Models\FoundItem;
use Modules\Notification\Notifications\ItemFoundNotification; // Import dari modul Notification
use App\Models\User;

class ItemController extends Controller
{
    public function claimItem(int $itemId)
    {
        $item = FoundItem::findOrFail($itemId);
        $owner = User::find($item->user_id); // Pemilik barang yang hilang

        if ($owner) {
            $owner->notify(new ItemFoundNotification($item));
        }

        return response()->json([
            'success' => true,
            'message' => 'Barang berhasil diklaim dan pemilik diberi notifikasi',
        ]);
    }
}
