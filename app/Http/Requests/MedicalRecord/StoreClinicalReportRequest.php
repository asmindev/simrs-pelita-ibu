<?php

namespace App\Http\Requests\MedicalRecord;

use App\Enums\ClinicalReportType;
use App\Models\ClinicalReport;
use App\Models\Doctor;
use App\Models\Encounter;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreClinicalReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Encounter|null $encounter */
        $encounter = $this->route('encounter');

        return $encounter ? $this->user()?->can('create', [ClinicalReport::class, $encounter]) ?? false : false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'report_type' => ['required', Rule::enum(ClinicalReportType::class)],
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'reported_at' => ['nullable', 'date'],
            'doctor_id' => ['nullable', 'integer', Rule::exists(Doctor::class, 'id')],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'report_type.required' => 'Jenis laporan klinis wajib dipilih.',
            'title.required' => 'Judul laporan klinis wajib diisi.',
            'content.required' => 'Isi laporan klinis wajib diisi.',
        ];
    }
}
