<?php

namespace App\Http\Requests;

use App\Enums\Permissions\InpatientPermission;
use Illuminate\Foundation\Http\FormRequest;

class StoreAdmissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can(InpatientPermission::AdmissionCreate->value) ?? false;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'encounter_id' => ['required', 'integer', 'exists:encounters,id'],
            'bed_id' => ['required', 'integer', 'exists:beds,id'],
            'doctor_id' => ['nullable', 'integer', 'exists:doctors,id'],
            'admitted_at' => ['nullable', 'date'],
            'initial_diagnosis' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
