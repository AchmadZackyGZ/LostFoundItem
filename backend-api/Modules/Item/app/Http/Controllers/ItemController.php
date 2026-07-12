<?php

namespace Modules\Item\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Modules\Item\Http\Requests\StoreItemRequest;
use Modules\Item\Models\Item;

class ItemController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return view('item::index');
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
