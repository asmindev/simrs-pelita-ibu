<?php

namespace App\Http\Requests;

use App\Enums\Permissions\InpatientPermission;
use Illuminate\Foundation\Http\FormRequest;

class DischargePatientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can(InpatientPermission::DischargeCreate->value) ?? false;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'discharge_diagnosis' => ['required', 'string', 'min:3', 'max:1000'],
            'discharge_summary' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
