<?php

namespace App\Http\Requests;

use App\Enums\Permissions\DiagnosticsPermission;
use Illuminate\Foundation\Http\FormRequest;

class StoreDiagnosticResultRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can(DiagnosticsPermission::ResultInput->value) ?? false;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'diagnostic_order_item_id' => ['nullable', 'integer', 'exists:diagnostic_order_items,id'],
            'parameter_name' => ['required', 'string', 'max:255'],
            'result_value' => ['required', 'string'],
            'reference_range' => ['nullable', 'string', 'max:100'],
            'unit' => ['nullable', 'string', 'max:50'],
            'is_critical' => ['nullable', 'boolean'],
            'interpretation' => ['nullable', 'string', 'max:1000'],
            'attachment' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ];
    }
}
