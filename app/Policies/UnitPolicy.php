<?php

namespace App\Policies;

use App\Enums\Permissions\MasterDataPermission;
use App\Models\Unit;
use App\Models\User;

class UnitPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can(MasterDataPermission::UnitView->value);
    }

    public function view(User $user, Unit $unit): bool
    {
        return $user->can(MasterDataPermission::UnitView->value);
    }

    public function create(User $user): bool
    {
        return $user->can(MasterDataPermission::UnitManage->value);
    }

    public function update(User $user, Unit $unit): bool
    {
        return $user->can(MasterDataPermission::UnitManage->value);
    }

    public function delete(User $user, Unit $unit): bool
    {
        return $user->can(MasterDataPermission::UnitManage->value);
    }
}
