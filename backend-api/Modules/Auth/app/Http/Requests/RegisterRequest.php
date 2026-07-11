<?php

namespace Modules\Auth\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'nim' => [
                'required',
                'string',
                'digits:10', // Memastikan isinya HANYA angka dan HARUS 10 digit
                'unique:users,nim' // Memastikan NIM belum terdaftar
            ],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                'unique:users,email',
                'ends_with:@uisi.ac.id,@student.uisi.ac.id' // Validasi email UISI
            ],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     */
    public function messages(): array
    {
        return [
            'email.ends_with' => 'Registrasi hanya diperbolehkan menggunakan email kampus UISI (@student.uisi.ac.id).',
            'nim.required' => 'NIM wajib diisi.',
            'nim.digits' => 'NIM harus berupa 10 digit angka (contoh: 3012410099).',
            'nim.unique' => 'NIM ini sudah terdaftar di sistem kami.',
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
