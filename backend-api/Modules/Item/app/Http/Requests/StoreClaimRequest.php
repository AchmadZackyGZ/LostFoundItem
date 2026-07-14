<?php

namespace Modules\Item\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreClaimRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'proof_description' => ['required', 'string', 'max:1000'],
            'proof_image' => ['required', 'image', 'mimes:jpeg,png,jpg', 'max:5120'], // Max 5MB
        ];
    }

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }
}
