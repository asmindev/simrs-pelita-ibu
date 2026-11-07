<?php

namespace App\Http\Requests;

use App\Models\DrugCategory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDrugCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var DrugCategory|null $drugCategory */
        $drugCategory = $this->route('drugCategory');

        return $drugCategory !== null && ($this->user()?->can('update', $drugCategory) ?? false);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        /** @var DrugCategory|null $drugCategory */
        $drugCategory = $this->route('drugCategory');

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique(DrugCategory::class)->ignore($drugCategory),
            ],
            'description' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
