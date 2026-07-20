<?php

namespace Modules\Item\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreItemRequest extends FormRequest
{

    /**
     * MENCEGAT DATA SEBELUM DIVALIDASI
     */
    protected function prepareForValidation()
    {
        // Hentikan eksekusi dan lihat bentuk asli data yang diterima Laravel
        dd([
            'semua_data_teks' => $this->all(),
            'file_gambar_asli' => $this->file('image'),
            'apakah_terbaca_sebagai_file' => $this->hasFile('image')
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'category_id' => ['required', 'uuid', 'exists:categories,id'],
            'type' => ['required', 'in:lost,found'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'location' => ['required', 'string', 'max:255'],
            'date' => ['required', 'date'],
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg', 'max:5120'], // Max 5MB
        ];
    }

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Izinkan karena kita sudah pakai auth:sanctum di routes
    }
}
