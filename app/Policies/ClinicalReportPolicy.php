<?php

namespace App\Policies;

use App\Enums\Permissions\MedicalRecordPermission;
use App\Models\ClinicalReport;
use App\Models\Encounter;
use App\Models\User;

class ClinicalReportPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can(MedicalRecordPermission::ReportView->value);
    }

    public function view(User $user, ClinicalReport $clinicalReport): bool
    {
        if (! $user->can(MedicalRecordPermission::ReportView->value)) {
            return false;
        }

        return $this->canAccessUnit($user, $clinicalReport->encounter->unit_id);
    }

    public function create(User $user, Encounter $encounter): bool
    {
        if (! $user->can(MedicalRecordPermission::ReportManage->value)) {
            return false;
        }

        return $this->canAccessUnit($user, $encounter->unit_id);
    }

    public function update(User $user, ClinicalReport $clinicalReport): bool
    {
        if (! $user->can(MedicalRecordPermission::ReportManage->value)) {
            return false;
        }

        return $this->canAccessUnit($user, $clinicalReport->encounter->unit_id);
    }

    public function delete(User $user, ClinicalReport $clinicalReport): bool
    {
        if (! $user->can(MedicalRecordPermission::ReportManage->value)) {
            return false;
        }

        return $this->canAccessUnit($user, $clinicalReport->encounter->unit_id);
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
