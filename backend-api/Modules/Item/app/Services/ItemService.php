<?php

namespace Modules\Item\Services;

use Modules\Item\Contracts\ItemServiceInterface;
use Modules\Item\Models\Item;

class ItemService implements ItemServiceInterface
{
    public function findItemById(string $itemId): ?object
    {
        // Hanya di dalam modul Item inilah pemanggilan Model Item dilegalkan
        return Item::find($itemId);
    }
}
