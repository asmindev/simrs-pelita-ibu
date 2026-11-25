<?php

namespace App\Http\Requests;

use App\Enums\Permissions\PharmacyPermission;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreStockMoveRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can(PharmacyPermission::StockAdjust->value)
            || $this->user()?->can(PharmacyPermission::StockOpname->value);
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'type' => ['required', Rule::in(['in', 'out', 'transfer', 'adjustment'])],
            'product_id' => ['required', 'exists:products,id'],
            'product_batch_id' => ['nullable', 'exists:product_batches,id'],
            'source_location_id' => ['nullable', 'exists:stock_locations,id'],
            'destination_location_id' => ['nullable', 'exists:stock_locations,id'],
            'quantity' => ['required_unless:type,adjustment', 'nullable', 'integer', 'min:1'],
            'new_quantity' => ['required_if:type,adjustment', 'nullable', 'integer', 'min:0'],
            'unit_cost' => ['nullable', 'integer', 'min:0'],
            'origin' => ['nullable', 'string', 'max:100'],
            'reason' => ['required', 'string', 'min:3', 'max:500'],
        ];
    }
}
