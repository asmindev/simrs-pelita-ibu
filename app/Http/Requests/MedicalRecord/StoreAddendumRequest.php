<?php

namespace App\Http\Requests\MedicalRecord;

use App\Models\Assessment;
use Illuminate\Foundation\Http\FormRequest;

class StoreAddendumRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Assessment|null $assessment */
        $assessment = $this->route('assessment');

        return $assessment ? $this->user()?->can('addendum', $assessment) ?? false : false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'reason' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'reason.required' => 'Alasan pembuatan addendum wajib diisi.',
            'reason.max' => 'Alasan addendum tidak boleh lebih dari 255 karakter.',
            'content.required' => 'Isi catatan addendum wajib diisi.',
        ];
    }
}
