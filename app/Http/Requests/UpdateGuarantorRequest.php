<?php

namespace App\Http\Requests;

use App\Enums\GuarantorType;
use App\Models\Guarantor;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateGuarantorRequest extends FormRequest
{
    public function authorize(): bool
    {
        $guarantor = $this->route('guarantor');

        return $guarantor instanceof Guarantor
            && ($this->user()?->can('update', $guarantor) ?? false);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $guarantor = $this->route('guarantor');
        $guarantorId = $guarantor instanceof Guarantor ? $guarantor->id : null;

        return [
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique(Guarantor::class)->ignore($guarantorId),
            ],
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', Rule::enum(GuarantorType::class)],
            'description' => ['nullable', 'string', 'max:1000'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
