<?php

namespace App\Policies;

use App\Enums\Permissions\MasterDataPermission;
use App\Models\Doctor;
use App\Models\User;

class DoctorPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can(MasterDataPermission::DoctorView->value);
    }

    public function view(User $user, Doctor $doctor): bool
    {
        return $user->can(MasterDataPermission::DoctorView->value);
    }

    public function create(User $user): bool
    {
        return $user->can(MasterDataPermission::DoctorManage->value);
    }

    public function update(User $user, Doctor $doctor): bool
    {
        return $user->can(MasterDataPermission::DoctorManage->value);
    }

    public function delete(User $user, Doctor $doctor): bool
    {
        return $user->can(MasterDataPermission::DoctorManage->value);
    }
}
