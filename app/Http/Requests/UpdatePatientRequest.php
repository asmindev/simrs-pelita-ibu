<?php

namespace App\Http\Requests;

use App\Enums\PatientGender;
use App\Models\Patient;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePatientRequest extends FormRequest
{
    public function authorize(): bool
    {
        $patient = $this->route('patient');

        return $patient instanceof Patient
            && ($this->user()?->can('update', $patient) ?? false);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $patient = $this->route('patient');
        $patientId = $patient instanceof Patient ? $patient->id : null;

        return [
            'nik' => [
                'nullable',
                'string',
                'digits:16',
                Rule::unique(Patient::class)->ignore($patientId),
            ],
            'name' => ['required', 'string', 'max:255'],
            'gender' => ['required', Rule::enum(PatientGender::class)],
            'birth_date' => ['required', 'date', 'before_or_equal:today'],
            'address' => ['nullable', 'string', 'max:1000'],
            'phone' => ['nullable', 'string', 'max:30'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
