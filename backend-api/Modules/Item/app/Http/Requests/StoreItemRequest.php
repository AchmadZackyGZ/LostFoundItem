<?php

namespace Modules\Item\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreItemRequest extends FormRequest
{
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
            'date' => ['required', 'date', 'before_or_equal:today'],
            'images' => ['required_without:image', 'array', 'min:1', 'max:5'],
            'images.*' => ['image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
            'image' => ['required_without:images', 'nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'date.before_or_equal' => 'Tanggal tidak valid. Anda tidak dapat membuat laporan dengan tanggal di masa depan (lebih dari hari ini).',
            'images.required_without' => 'Wajib mengunggah minimal 1 foto barang.',
            'image.required_without' => 'Wajib mengunggah minimal 1 foto barang.',
            'images.min' => 'Wajib mengunggah minimal 1 foto barang.',
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
