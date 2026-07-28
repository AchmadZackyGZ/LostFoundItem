<?php

namespace Modules\Item\Contracts;

interface ItemServiceInterface
{
    /**
     * Cari barang berdasarkan ID.
     * Mengembalikan object Item atau null jika tidak ketemu.
     */
    public function findItemById(string $itemId): ?object;
}
