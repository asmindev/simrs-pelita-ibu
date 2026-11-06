<?php

namespace App\Policies;

use App\Enums\Permissions\MasterDataPermission;
use App\Models\Patient;
use App\Models\User;

class PatientPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can(MasterDataPermission::PatientView->value);
    }

    public function view(User $user, Patient $patient): bool
    {
        return $user->can(MasterDataPermission::PatientView->value);
    }

    public function create(User $user): bool
    {
        return $user->can(MasterDataPermission::PatientCreate->value);
    }

    public function update(User $user, Patient $patient): bool
    {
        return $user->can(MasterDataPermission::PatientUpdate->value);
    }

    public function delete(User $user, Patient $patient): bool
    {
        return $user->can(MasterDataPermission::PatientDelete->value);
    }

    public function merge(User $user, Patient $patient): bool
    {
        return $user->can(MasterDataPermission::PatientMerge->value);
    }
}
