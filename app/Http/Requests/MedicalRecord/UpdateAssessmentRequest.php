<?php

namespace App\Http\Requests\MedicalRecord;

use App\Enums\AssessmentType;
use App\Models\Assessment;
use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateAssessmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Assessment|null $assessment */
        $assessment = $this->route('assessment');

        return $assessment ? $this->user()?->can('update', $assessment) ?? false : false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'type' => ['sometimes', 'required', Rule::enum(AssessmentType::class)],
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
            'last_updated_at' => ['required', 'string'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            /** @var Assessment|null $assessment */
            $assessment = $this->route('assessment');
            $lastUpdatedAt = $this->input('last_updated_at');

            if ($assessment && $assessment->updated_at && $lastUpdatedAt) {
                try {
                    $clientTime = Carbon::parse($lastUpdatedAt);
                    if ($assessment->updated_at->getTimestamp() !== $clientTime->getTimestamp()) {
                        $validator->errors()->add(
                            'last_updated_at',
                            'Catatan medis telah diperbarui oleh pengguna lain. Harap muat ulang halaman untuk melihat perubahan terbaru.'
                        );
                    }
                } catch (\Throwable) {
                    $validator->errors()->add('last_updated_at', 'Format waktu pembaruan tidak valid.');
                }
            }
        });
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'last_updated_at.required' => 'Waktu versi catatan wajib disertakan untuk pencegahan konflik edit.',
            'triage_level.in' => 'Kategori triase tidak valid (pilihan: green, yellow, red, black).',
        ];
    }
}
