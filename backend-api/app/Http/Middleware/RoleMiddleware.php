<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        // 1. Pastikan user memiliki token valid (sudah login)
        // 2. Pastikan role user di database sama dengan parameter role yang dikirim dari route
        if (!$request->user() || $request->user()->role !== $role) {
            return response()->json([
                'message' => 'Akses ditolak: Anda tidak memiliki izin otoritas untuk aksi ini!'
            ], 403);
        }

        // Jika lolos, izinkan request melanjutkan perjalanannya ke Controller
        return $next($request);
    }
}
