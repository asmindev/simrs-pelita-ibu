<?php

namespace App\Http\Requests;

use App\Enums\Permissions\PharmacyPermission;
use Illuminate\Foundation\Http\FormRequest;

class AdjustStockRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can(PharmacyPermission::StockAdjust->value)
            || $this->user()?->can(PharmacyPermission::StockOpname->value);
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'new_quantity' => ['required', 'integer', 'min:0'],
            'reason' => ['required', 'string', 'min:3', 'max:500'],
        ];
    }
}
