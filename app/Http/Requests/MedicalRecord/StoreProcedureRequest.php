<?php

namespace App\Http\Requests\MedicalRecord;

use App\Enums\Permissions\MedicalRecordPermission;
use App\Models\Doctor;
use App\Models\Encounter;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProcedureRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Encounter|null $encounter */
        $encounter = $this->route('encounter');

        if (! $encounter) {
            return false;
        }

        $user = $this->user();
        if (! $user || ! $user->can(MedicalRecordPermission::ProcedureManage->value)) {
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
            'icd9_code' => ['nullable', 'string', 'max:16'],
            'name' => ['required', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'performed_by' => ['nullable', 'integer', Rule::exists(Doctor::class, 'id')],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama tindakan medis wajib diisi.',
            'performed_by.exists' => 'Dokter pelaksana tidak valid.',
        ];
    }
}
