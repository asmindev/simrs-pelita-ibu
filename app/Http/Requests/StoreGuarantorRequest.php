<?php

namespace App\Http\Requests;

use App\Enums\GuarantorType;
use App\Models\Guarantor;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreGuarantorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Guarantor::class) ?? false;
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
                Rule::unique(Guarantor::class),
            ],
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', Rule::enum(GuarantorType::class)],
            'description' => ['nullable', 'string', 'max:1000'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
