<?php

namespace App\Http\Requests;

use App\Enums\TariffCategory;
use App\Models\Tariff;
use App\Models\Unit;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTariffRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Tariff::class) ?? false;
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
                Rule::unique(Tariff::class),
            ],
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', Rule::enum(TariffCategory::class)],
            'price' => ['required', 'integer', 'min:0'],
            'unit_id' => ['nullable', 'integer', Rule::exists(Unit::class, 'id')],
            'description' => ['nullable', 'string', 'max:1000'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
