<?php

namespace App\Policies;

use App\Enums\EncounterStatus;
use App\Enums\Permissions\RegistrationPermission;
use App\Models\Encounter;
use App\Models\User;

class EncounterPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can(RegistrationPermission::VisitView->value);
    }

    public function view(User $user, Encounter $encounter): bool
    {
        if (! $user->can(RegistrationPermission::VisitView->value)) {
            return false;
        }

        return $this->canAccessUnit($user, $encounter->unit_id);
    }

    public function create(User $user): bool
    {
        return $user->can(RegistrationPermission::VisitCreate->value);
    }

    public function update(User $user, Encounter $encounter): bool
    {
        if (! $user->can(RegistrationPermission::VisitUpdate->value)) {
            return false;
        }

        return $this->canAccessUnit($user, $encounter->unit_id);
    }

    public function cancel(User $user, Encounter $encounter): bool
    {
        if (! $user->can(RegistrationPermission::VisitCancel->value)) {
            return false;
        }

        if (in_array($encounter->status, [EncounterStatus::Finished, EncounterStatus::Cancelled], true)) {
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
