<?php

namespace App\Http\Requests;

use App\Enums\StockLocationUsage;
use App\Models\StockLocation;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateStockLocationRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var StockLocation|null $warehouse */
        $warehouse = $this->route('warehouse');

        return $warehouse !== null && ($this->user()?->can('update', $warehouse) ?? false);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        /** @var StockLocation|null $warehouse */
        $warehouse = $this->route('warehouse');

        return [
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique(StockLocation::class)->ignore($warehouse),
            ],
            'name' => ['required', 'string', 'max:150'],
            'usage' => ['required', Rule::enum(StockLocationUsage::class)],
            'description' => ['nullable', 'string', 'max:500'],
            'is_default_warehouse' => ['sometimes', 'boolean'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($this->boolean('is_default_warehouse') && $this->input('usage') !== StockLocationUsage::Internal->value) {
                    $validator->errors()->add('is_default_warehouse', 'Gudang default hanya dapat ditetapkan pada lokasi bertipe internal.');
                }

                if ($this->boolean('is_default_warehouse') && $this->has('is_active') && ! $this->boolean('is_active')) {
                    $validator->errors()->add('is_active', 'Gudang default harus tetap berstatus aktif.');
                }
            },
        ];
    }
}
