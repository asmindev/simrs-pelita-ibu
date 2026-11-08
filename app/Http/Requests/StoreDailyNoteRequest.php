<?php

namespace App\Http\Requests;

use App\Enums\Permissions\InpatientPermission;
use Illuminate\Foundation\Http\FormRequest;

class StoreDailyNoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can(InpatientPermission::DailyNoteUpdate->value) ?? false;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'note_type' => ['required', 'string', 'in:nurse,doctor_visit'],
            'vital_signs' => ['nullable', 'array'],
            'subjective' => ['nullable', 'string'],
            'objective' => ['nullable', 'string'],
            'assessment' => ['nullable', 'string'],
            'plan' => ['nullable', 'string'],
        ];
    }
}
