<?php

namespace App\Http\Requests;

use App\Enums\Permissions\CashierPermission;
use Illuminate\Foundation\Http\FormRequest;

class VoidInvoiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can(CashierPermission::InvoiceVoid->value) ?? false;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'void_reason' => ['required', 'string', 'min:5', 'max:1000'],
        ];
    }
}
