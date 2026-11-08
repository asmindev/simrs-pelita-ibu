<?php

namespace App\Policies;

use App\Enums\Permissions\InpatientPermission;
use App\Models\Admission;
use App\Models\User;

class AdmissionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can(InpatientPermission::AdmissionView->value);
    }

    public function view(User $user, Admission $admission): bool
    {
        return $user->can(InpatientPermission::AdmissionView->value);
    }

    public function create(User $user): bool
    {
        return $user->can(InpatientPermission::AdmissionCreate->value);
    }

    public function assignBed(User $user, Admission $admission): bool
    {
        return $user->can(InpatientPermission::BedAssign->value)
            && $admission->status === 'active';
    }

    public function transfer(User $user, Admission $admission): bool
    {
        return $user->can(InpatientPermission::TransferCreate->value)
            && $admission->status === 'active';
    }

    public function discharge(User $user, Admission $admission): bool
    {
        return $user->can(InpatientPermission::DischargeCreate->value)
            && $admission->status === 'active';
    }

    public function addNote(User $user, Admission $admission): bool
    {
        return $user->can(InpatientPermission::DailyNoteUpdate->value)
            && $admission->status === 'active';
    }
}
