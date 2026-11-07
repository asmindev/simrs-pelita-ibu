<?php

namespace App\Http\Requests\MedicalRecord;

use App\Models\Assessment;
use Carbon\Carbon;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class FinalizeAssessmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Assessment|null $assessment */
        $assessment = $this->route('assessment');

        return $assessment ? $this->user()?->can('finalize', $assessment) ?? false : false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
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
            'last_updated_at.required' => 'Waktu versi catatan wajib disertakan untuk finalisasi.',
        ];
    }
}
