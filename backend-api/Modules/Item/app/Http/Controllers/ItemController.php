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
        // Ambil barang beserta relasi internalnya (kategori)
        $items = Item::with('category')->latest()->get();

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
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('item::create');
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
            'status' => 'active',
            'is_urgent' => false,
        ]);

        return response()->json([
            'message' => 'Laporan berhasil dibuat.',
            'data' => $item
        ], 201);
    }

    /**
     * Show the specified resource.
     */
    public function show($id)
    {
        return view('item::show');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($id)
    {
        return view('item::edit');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id) {}

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id) {}
}
