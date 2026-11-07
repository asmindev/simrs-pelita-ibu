<?php

namespace App\Http\Requests\MedicalRecord;

use App\Enums\AssessmentType;
use App\Models\Assessment;
use App\Models\Encounter;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAssessmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Encounter|null $encounter */
        $encounter = $this->route('encounter');

        return $encounter ? $this->user()?->can('create', [Assessment::class, $encounter]) ?? false : false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'type' => ['required', Rule::enum(AssessmentType::class)],
            'subjective' => ['nullable', 'string'],
            'objective' => ['nullable', 'string'],
            'assessment' => ['nullable', 'string'],
            'plan' => ['nullable', 'string'],
            'vital_signs' => ['nullable', 'array'],
            'vital_signs.systolic' => ['nullable', 'numeric'],
            'vital_signs.diastolic' => ['nullable', 'numeric'],
            'vital_signs.heart_rate' => ['nullable', 'numeric'],
            'vital_signs.respiratory_rate' => ['nullable', 'numeric'],
            'vital_signs.temperature' => ['nullable', 'numeric'],
            'vital_signs.spo2' => ['nullable', 'numeric'],
            'vital_signs.weight' => ['nullable', 'numeric'],
            'vital_signs.height' => ['nullable', 'numeric'],
            'triage_level' => ['nullable', 'string', 'in:green,yellow,red,black'],
            'allergies' => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'type.required' => 'Jenis asesmen klinis wajib dipilih.',
            'triage_level.in' => 'Kategori triase tidak valid (pilihan: green, yellow, red, black).',
        ];
    }
}
