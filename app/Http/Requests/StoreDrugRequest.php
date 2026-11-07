<?php

namespace App\Http\Requests;

use App\Models\Drug;
use App\Models\DrugCategory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDrugRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Drug::class) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique(Drug::class),
            ],
            'name' => ['required', 'string', 'max:255'],
            'drug_category_id' => [
                'required',
                'integer',
                Rule::exists(DrugCategory::class, 'id'),
            ],
            'form' => ['required', 'string', 'max:100'],
            'strength' => ['required', 'string', 'max:100'],
            'unit_of_measure' => ['required', 'string', 'max:50'],
            'price' => ['required', 'integer', 'min:0'],
            'manufacturer' => ['required', 'string', 'max:255'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
