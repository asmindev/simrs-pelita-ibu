<?php

namespace App\Policies;

use App\Enums\Permissions\MedicalRecordPermission;
use App\Models\Assessment;
use App\Models\Encounter;
use App\Models\User;

class AssessmentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can(MedicalRecordPermission::EncounterView->value);
    }

    public function view(User $user, Assessment $assessment): bool
    {
        if (! $user->can(MedicalRecordPermission::EncounterView->value)) {
            return false;
        }

        return $this->canAccessUnit($user, $assessment->encounter->unit_id);
    }

    public function create(User $user, Encounter $encounter): bool
    {
        if (! $user->can(MedicalRecordPermission::AssessmentUpdate->value)) {
            return false;
        }

        return $this->canAccessUnit($user, $encounter->unit_id);
    }

    public function update(User $user, Assessment $assessment): bool
    {
        if (! $user->can(MedicalRecordPermission::AssessmentUpdate->value)) {
            return false;
        }

        if ($assessment->is_final) {
            return false;
        }

        return $this->canAccessUnit($user, $assessment->encounter->unit_id);
    }

    public function finalize(User $user, Assessment $assessment): bool
    {
        if (! $user->can(MedicalRecordPermission::AssessmentUpdate->value)) {
            return false;
        }

        if ($assessment->is_final) {
            return false;
        }

        return $this->canAccessUnit($user, $assessment->encounter->unit_id);
    }

    public function addendum(User $user, Assessment $assessment): bool
    {
        if (! $user->can(MedicalRecordPermission::AssessmentUpdate->value)) {
            return false;
        }

        if (! $assessment->is_final) {
            return false;
        }

        return $this->canAccessUnit($user, $assessment->encounter->unit_id);
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
