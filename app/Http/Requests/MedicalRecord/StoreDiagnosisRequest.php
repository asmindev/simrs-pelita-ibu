<?php

namespace App\Http\Requests\MedicalRecord;

use App\Enums\DiagnosisType;
use App\Enums\Permissions\MedicalRecordPermission;
use App\Models\Encounter;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDiagnosisRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Encounter|null $encounter */
        $encounter = $this->route('encounter');

        if (! $encounter) {
            return false;
        }

        $user = $this->user();
        if (! $user || ! $user->can(MedicalRecordPermission::DiagnosisManage->value)) {
            return false;
        }

        $assignedUnits = $user->unitIds();
        if (! empty($assignedUnits) && ! in_array($encounter->unit_id, $assignedUnits, true)) {
            return false;
        }

        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'icd10_code' => ['required', 'string', 'max:16'],
            'icd10_name' => ['required', 'string', 'max:255'],
            'type' => ['required', Rule::enum(DiagnosisType::class)],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'icd10_code.required' => 'Kode ICD-10 wajib diisi.',
            'icd10_name.required' => 'Nama diagnosis ICD-10 wajib diisi.',
            'type.required' => 'Tipe diagnosis (primer/sekunder) wajib dipilih.',
        ];
    }
}
