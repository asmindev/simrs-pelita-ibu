<?php

namespace App\Http\Requests\MedicalRecord;

use App\Enums\Permissions\MedicalRecordPermission;
use App\Models\Encounter;
use Illuminate\Foundation\Http\FormRequest;

class SaveDraftRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Encounter|null $encounter */
        $encounter = $this->route('encounter');

        if (! $encounter) {
            return false;
        }

        $user = $this->user();
        if (! $user || ! $user->can(MedicalRecordPermission::AssessmentUpdate->value)) {
            return false;
        }

        $assignedUnits = $user->unitIds();
        if (! empty($assignedUnits) && ! in_array($encounter->unit_id, $assignedUnits, true)) {
            return false;
        }

        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'form_type' => ['required', 'string', 'max:32'],
            'content' => ['required', 'array'],
        ];
    }
}
