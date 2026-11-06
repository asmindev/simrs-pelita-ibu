<?php

namespace App\Http\Requests;

use App\Models\Doctor;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDoctorRequest extends FormRequest
{
    public function authorize(): bool
    {
        $doctor = $this->route('doctor');

        return $doctor instanceof Doctor
            && ($this->user()?->can('update', $doctor) ?? false);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $doctor = $this->route('doctor');
        $doctorId = $doctor instanceof Doctor ? $doctor->id : null;

        return [
            'code' => [
                'required',
                'string',
                'max:30',
                Rule::unique(Doctor::class)->ignore($doctorId),
            ],
            'name' => ['required', 'string', 'max:255'],
            'specialization' => ['nullable', 'string', 'max:255'],
            'license_number' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique(Doctor::class)->ignore($doctorId),
            ],
            'phone' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
