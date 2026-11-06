<?php

namespace App\Http\Requests;

use App\Enums\UnitType;
use App\Models\Unit;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUnitRequest extends FormRequest
{
    public function authorize(): bool
    {
        $unit = $this->route('unit');

        return $unit instanceof Unit
            && ($this->user()?->can('update', $unit) ?? false);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $unit = $this->route('unit');
        $unitId = $unit instanceof Unit ? $unit->id : null;

        return [
            'code' => [
                'required',
                'string',
                'max:30',
                Rule::unique(Unit::class)->ignore($unitId),
            ],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'type' => ['required', Rule::enum(UnitType::class)],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
