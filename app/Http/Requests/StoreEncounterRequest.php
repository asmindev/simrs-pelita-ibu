<?php

namespace App\Http\Requests;

use App\Enums\EncounterType;
use App\Enums\GuarantorType;
use App\Models\Doctor;
use App\Models\Encounter;
use App\Models\Guarantor;
use App\Models\Patient;
use App\Models\Unit;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreEncounterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Encounter::class) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'patient_id' => [
                'required',
                'integer',
                Rule::exists(Patient::class, 'id')->where(function ($query): void {
                    $query->where('is_active', true)
                        ->whereNull('merged_to_patient_id');
                }),
            ],
            'unit_id' => [
                'required',
                'integer',
                Rule::exists(Unit::class, 'id')->where('is_active', true),
            ],
            'doctor_id' => [
                'nullable',
                'integer',
                Rule::exists(Doctor::class, 'id')->where('is_active', true),
            ],
            'type' => ['required', Rule::enum(EncounterType::class)],
            'guarantor_id' => [
                'required',
                'integer',
                Rule::exists(Guarantor::class, 'id')->where('is_active', true),
            ],
            'card_number' => ['nullable', 'string', 'max:64'],
            'claim_number' => ['nullable', 'string', 'max:64'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'override_duplicate' => ['sometimes', 'boolean'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $user = $this->user();
            $unitId = (int) $this->input('unit_id');

            // Scoping unit pengguna
            if ($user && ! empty($user->unitIds()) && ! $user->hasUnitAccess($unitId)) {
                $validator->errors()->add(
                    'unit_id',
                    'Anda tidak memiliki akses penugasan untuk mendaftarkan pasien ke unit ini.'
                );
            }

            // Pencegahan kunjungan ganda hari ini pada unit yang sama
            if (! $this->boolean('override_duplicate')) {
                $patientId = (int) $this->input('patient_id');
                if ($patientId > 0 && $unitId > 0) {
                    $hasActiveEncounter = Encounter::query()
                        ->where('patient_id', $patientId)
                        ->where('unit_id', $unitId)
                        ->today()
                        ->active()
                        ->exists();

                    if ($hasActiveEncounter) {
                        $validator->errors()->add(
                            'patient_id',
                            'Pasien sudah memiliki kunjungan aktif di unit ini hari ini. Konfirmasi jika ingin tetap mendaftarkan kunjungan baru.'
                        );
                    }
                }
            }

            // Validasi nomor kartu untuk penjamin BPJS / Asuransi
            $guarantorId = (int) $this->input('guarantor_id');
            if ($guarantorId > 0) {
                $guarantor = Guarantor::find($guarantorId);
                if (
                    $guarantor
                    && in_array($guarantor->type, [GuarantorType::Bpjs, GuarantorType::Insurance], true)
                    && blank($this->input('card_number'))
                ) {
                    $validator->errors()->add(
                        'card_number',
                        'Nomor kartu/asuransi wajib diisi untuk penjamin '.$guarantor->name.'.'
                    );
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
            'patient_id.required' => 'Pasien wajib dipilih.',
            'patient_id.exists' => 'Pasien tidak valid, tidak aktif, atau berkas telah digabungkan.',
            'unit_id.required' => 'Unit/Poli tujuan wajib dipilih.',
            'unit_id.exists' => 'Unit tidak ditemukan atau sedang tidak aktif.',
            'guarantor_id.required' => 'Penjamin pembayaran wajib dipilih.',
            'guarantor_id.exists' => 'Penjamin tidak valid.',
            'type.required' => 'Jenis kunjungan wajib dipilih.',
        ];
    }
}
