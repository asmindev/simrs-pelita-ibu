<?php

namespace App\Http\Requests;

use App\Models\Encounter;
use Illuminate\Foundation\Http\FormRequest;

class CancelEncounterRequest extends FormRequest
{
    public function authorize(): bool
    {
        $encounter = $this->route('encounter');

        return $encounter instanceof Encounter
            && ($this->user()?->can('cancel', $encounter) ?? false);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'cancellation_reason' => ['required', 'string', 'min:5', 'max:500'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'cancellation_reason.required' => 'Alasan pembatalan kunjungan wajib diisi.',
            'cancellation_reason.min' => 'Alasan pembatalan minimal 5 karakter.',
            'cancellation_reason.max' => 'Alasan pembatalan maksimal 500 karakter.',
        ];
    }
}
