<?php

namespace App\Http\Requests;

use App\Enums\Permissions\PharmacyPermission;
use Illuminate\Foundation\Http\FormRequest;

class VerifyPrescriptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can(PharmacyPermission::PrescriptionVerify->value) ?? false;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'verification_notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
