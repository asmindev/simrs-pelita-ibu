<?php

namespace App\Policies;

use App\Enums\Permissions\MasterDataPermission;
use App\Models\DrugCategory;
use App\Models\User;

class DrugCategoryPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can(MasterDataPermission::DrugView->value);
    }

    public function view(User $user, DrugCategory $drugCategory): bool
    {
        return $user->can(MasterDataPermission::DrugView->value);
    }

    public function create(User $user): bool
    {
        return $user->can(MasterDataPermission::DrugManage->value);
    }

    public function update(User $user, DrugCategory $drugCategory): bool
    {
        return $user->can(MasterDataPermission::DrugManage->value);
    }

    public function delete(User $user, DrugCategory $drugCategory): bool
    {
        return $user->can(MasterDataPermission::DrugManage->value);
    }
}
