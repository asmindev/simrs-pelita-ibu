<?php

namespace App\Http\Requests;

use App\Enums\TariffCategory;
use App\Models\Tariff;
use App\Models\Unit;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTariffRequest extends FormRequest
{
    public function authorize(): bool
    {
        $tariff = $this->route('tariff');

        return $tariff instanceof Tariff
            && ($this->user()?->can('update', $tariff) ?? false);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $tariff = $this->route('tariff');
        $tariffId = $tariff instanceof Tariff ? $tariff->id : null;

        return [
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique(Tariff::class)->ignore($tariffId),
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
