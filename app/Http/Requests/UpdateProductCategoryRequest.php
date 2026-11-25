<?php

namespace App\Http\Requests;

use App\Models\ProductCategory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var ProductCategory|null $productCategory */
        $productCategory = $this->route('productCategory');

        return $productCategory !== null && ($this->user()?->can('update', $productCategory) ?? false);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        /** @var ProductCategory|null $productCategory */
        $productCategory = $this->route('productCategory');

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique(ProductCategory::class)->ignore($productCategory),
            ],
            'description' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
