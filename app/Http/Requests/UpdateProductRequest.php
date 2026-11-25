<?php

namespace App\Http\Requests;

use App\Enums\ProductType;
use App\Models\Drug;
use App\Models\DrugCategory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Drug|null $product */
        $product = $this->route('product');

        return $product !== null && ($this->user()?->can('update', $product) ?? false);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        /** @var Drug|null $product */
        $product = $this->route('product');

        return [
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique(Drug::class)->ignore($product),
            ],
            'name' => ['required', 'string', 'max:255'],
            'product_type' => ['required', Rule::enum(ProductType::class)],
            'drug_category_id' => [
                'required',
                'integer',
                Rule::exists(DrugCategory::class, 'id'),
            ],
            'form' => ['required_if:product_type,drug', 'nullable', 'string', 'max:100'],
            'strength' => ['required_if:product_type,drug', 'nullable', 'string', 'max:100'],
            'unit_of_measure' => ['required', 'string', 'max:50'],
            'price' => ['required', 'integer', 'min:0'],
            'manufacturer' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
