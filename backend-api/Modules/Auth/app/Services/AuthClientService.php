<?php

namespace Modules\Auth\Services;

use App\Models\User;
use Modules\Auth\Contracts\AuthClientInterface;

class AuthClientService implements AuthClientInterface
{
    public function getUserById(string $id): ?array
    {
        $user = User::find($id);

        if (!$user) {
            return null;
        }

        // Kita mapping manual ke array agar Modul lain (Consumer) 
        // tidak memiliki akses ke fitur Eloquent/Database milik Modul Auth.
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role ?? 'Mahasiswa',
            'department' => $user->department ?? 'Informatika',
            'nim' => $user->nim ?? '-',
            'avatar_url' => $user->avatar_url,
            'is_suspended' => $user->isSuspended(),
            'suspended_until' => $user->suspended_until ? $user->suspended_until->toIso8601String() : null,
            'suspend_reason' => $user->suspend_reason,
        ];
    }
}
