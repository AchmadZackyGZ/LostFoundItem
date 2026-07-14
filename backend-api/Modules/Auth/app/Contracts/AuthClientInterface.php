<?php

namespace Modules\Auth\Contracts;

interface AuthClientInterface
{
    /**
     * Mengambil data user berdasarkan ID.
     * Mengembalikan array data murni, bukan Eloquent Model.
     */
    public function getUserById(string $id): ?array;
}
