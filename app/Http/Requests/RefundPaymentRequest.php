<?php

namespace App\Http\Requests;

use App\Enums\Permissions\CashierPermission;
use Illuminate\Foundation\Http\FormRequest;

class RefundPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can(CashierPermission::RefundCreate->value) ?? false;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'amount' => ['required', 'numeric', 'min:1'],
            'reason' => ['required', 'string', 'min:5', 'max:1000'],
            'payment_id' => ['nullable', 'integer', 'exists:payments,id'],
        ];
    }
}
