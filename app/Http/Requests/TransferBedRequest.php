<?php

namespace App\Http\Requests;

use App\Enums\Permissions\InpatientPermission;
use Illuminate\Foundation\Http\FormRequest;

class TransferBedRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can(InpatientPermission::TransferCreate->value) ?? false;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'target_bed_id' => ['required', 'integer', 'exists:beds,id'],
            'reason' => ['required', 'string', 'min:3', 'max:255'],
        ];
    }
}
