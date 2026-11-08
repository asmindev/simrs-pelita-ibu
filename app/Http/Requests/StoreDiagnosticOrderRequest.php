<?php

namespace App\Http\Requests;

use App\Enums\Permissions\DiagnosticsPermission;
use Illuminate\Foundation\Http\FormRequest;

class StoreDiagnosticOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can(DiagnosticsPermission::OrderCreate->value) ?? false;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'encounter_id' => ['required', 'integer', 'exists:encounters,id'],
            'type' => ['required', 'string', 'in:laboratory,radiology'],
            'unit_id' => ['nullable', 'integer', 'exists:units,id'],
            'clinical_notes' => ['nullable', 'string', 'max:1000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.test_name' => ['required', 'string', 'max:255'],
            'items.*.tariff_id' => ['nullable', 'integer', 'exists:tariffs,id'],
            'items.*.notes' => ['nullable', 'string', 'max:255'],
        ];
    }
}
