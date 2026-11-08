<?php

namespace App\Http\Requests\Rbac;

use App\Models\BreakGlassGrant;
use Illuminate\Foundation\Http\FormRequest;

class ReviewBreakGlassRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var BreakGlassGrant|null $grant */
        $grant = $this->route('grant');

        return $grant !== null && ($this->user()?->can('review', $grant) ?? false);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'review_notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
