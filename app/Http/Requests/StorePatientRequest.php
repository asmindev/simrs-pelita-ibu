<?php

namespace App\Http\Requests;

use App\Enums\PatientGender;
use App\Models\Patient;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePatientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Patient::class) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'medical_record_number' => [
                'required',
                'string',
                'max:30',
                Rule::unique(Patient::class),
            ],
            'nik' => [
                'nullable',
                'string',
                'digits:16',
                Rule::unique(Patient::class),
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
