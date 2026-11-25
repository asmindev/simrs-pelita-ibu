<?php

namespace App\Http\Requests;

use App\Enums\Permissions\PharmacyPermission;
use Illuminate\Foundation\Http\FormRequest;

class StoreProductBatchRequest extends FormRequest
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
            'product_id' => ['required', 'exists:products,id'],
            'batch_number' => ['nullable', 'string', 'max:50'],
            'expiry_date' => ['required', 'date', 'after:today'],
            'initial_quantity' => ['required', 'integer', 'min:1'],
            'buy_price' => ['nullable', 'integer', 'min:0'],
            'stock_location_id' => ['nullable', 'exists:stock_locations,id'],
            'origin' => ['nullable', 'string', 'max:100'],
        ];
    }
}
