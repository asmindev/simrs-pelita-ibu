<?php

namespace App\Http\Requests;

use App\Enums\Permissions\PharmacyPermission;
use Illuminate\Foundation\Http\FormRequest;

class CancelPrescriptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can(PharmacyPermission::PrescriptionVerify->value)
            || $this->user()?->can(PharmacyPermission::PrescriptionCreate->value);
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'cancel_reason' => ['required', 'string', 'min:3', 'max:500'],
        ];
    }
}
