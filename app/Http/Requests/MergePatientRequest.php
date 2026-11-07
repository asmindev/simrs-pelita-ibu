<?php

namespace App\Http\Requests;

use App\Models\Patient;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class MergePatientRequest extends FormRequest
{
    public function authorize(): bool
    {
        $patient = $this->route('patient');

        return $patient instanceof Patient
            && ($this->user()?->can('merge', $patient) ?? false);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $sourcePatient = $this->route('patient');
        $sourceId = $sourcePatient instanceof Patient ? $sourcePatient->id : null;

        return [
            'target_patient_id' => [
                'required',
                'integer',
                Rule::notIn([$sourceId]),
                Rule::exists(Patient::class, 'id')->where(function ($query): void {
                    $query->where('is_active', true)
                        ->whereNull('merged_to_patient_id');
                }),
            ],
            'reason' => ['required', 'string', 'max:500'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $sourcePatient = $this->route('patient');

            if ($sourcePatient instanceof Patient && $sourcePatient->merged_to_patient_id !== null) {
                $validator->errors()->add(
                    'target_patient_id',
                    'Berkas rekam medis sumber sudah pernah digabungkan ke berkas lain.'
                );
            }
        });
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'target_patient_id.not_in' => 'Pasien tujuan tidak boleh sama dengan pasien sumber.',
            'target_patient_id.exists' => 'Pasien tujuan tidak ditemukan, tidak aktif, atau sudah digabungkan.',
            'reason.required' => 'Alasan penggabungan wajib diisi.',
            'reason.max' => 'Alasan penggabungan maksimal 500 karakter.',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'target_patient_id' => 'pasien tujuan',
            'reason' => 'alasan penggabungan',
        ];
    }
}
