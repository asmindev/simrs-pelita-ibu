<?php

namespace App\Policies;

use App\Enums\Permissions\AuditPermission;
use App\Models\PatientAccessLog;
use App\Models\User;

class PatientAccessLogPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can(AuditPermission::PatientAccessView->value);
    }

    public function view(User $user, PatientAccessLog $patientAccessLog): bool
    {
        return $user->can(AuditPermission::PatientAccessView->value);
    }
}
