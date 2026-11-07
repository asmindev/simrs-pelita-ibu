<?php

namespace App\Http\Requests\MedicalRecord;

use App\Enums\SensitiveCategory;
use App\Models\Encounter;
use App\Models\SensitiveNote;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSensitiveNoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Encounter|null $encounter */
        $encounter = $this->route('encounter');

        return $encounter ? $this->user()?->can('create', [SensitiveNote::class, $encounter]) ?? false : false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'category' => ['required', Rule::enum(SensitiveCategory::class)],
            'content' => ['required', 'string'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'category.required' => 'Kategori catatan khusus wajib dipilih.',
            'content.required' => 'Isi catatan khusus wajib diisi.',
        ];
    }
}
