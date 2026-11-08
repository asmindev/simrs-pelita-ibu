<?php

namespace App\Http\Requests;

use App\Enums\Permissions\PharmacyPermission;
use Illuminate\Foundation\Http\FormRequest;

class StoreDrugBatchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can(PharmacyPermission::StockAdjust->value) ?? false;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'drug_id' => ['required', 'exists:drugs,id'],
            'batch_number' => ['required', 'string', 'max:50'],
            'expiry_date' => ['required', 'date', 'after:today'],
            'initial_quantity' => ['required', 'integer', 'min:1'],
            'buy_price' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
