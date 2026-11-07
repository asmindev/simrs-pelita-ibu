<?php

namespace App\Policies;

use App\Enums\Permissions\MedicalRecordPermission;
use App\Models\BreakGlassGrant;
use App\Models\Encounter;
use App\Models\SensitiveNote;
use App\Models\User;

class SensitiveNotePolicy
{
    public function view(User $user, SensitiveNote|int $noteOrPatientId): bool
    {
        if ($user->can(MedicalRecordPermission::SensitiveNoteView->value)) {
            return true;
        }

        $patientId = is_numeric($noteOrPatientId)
            ? (int) $noteOrPatientId
            : $noteOrPatientId->patient_id;

        return BreakGlassGrant::where('user_id', $user->id)
            ->where('patient_id', $patientId)
            ->active()
            ->exists();
    }

    public function create(User $user, Encounter $encounter): bool
    {
        if (! $user->can(MedicalRecordPermission::SensitiveNoteUpdate->value)) {
            return false;
        }

        return $this->canAccessUnit($user, $encounter->unit_id);
    }

    private function canAccessUnit(User $user, int $unitId): bool
    {
        $assignedUnits = $user->unitIds();

        if (empty($assignedUnits)) {
            return true;
        }

        return in_array($unitId, $assignedUnits, true);
    }
}
