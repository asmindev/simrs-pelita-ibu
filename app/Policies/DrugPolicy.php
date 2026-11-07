<?php

namespace App\Policies;

use App\Enums\Permissions\MasterDataPermission;
use App\Models\Drug;
use App\Models\User;

class DrugPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can(MasterDataPermission::DrugView->value);
    }

    public function view(User $user, Drug $drug): bool
    {
        return $user->can(MasterDataPermission::DrugView->value);
    }

    public function create(User $user): bool
    {
        return $user->can(MasterDataPermission::DrugManage->value);
    }

    public function update(User $user, Drug $drug): bool
    {
        return $user->can(MasterDataPermission::DrugManage->value);
    }

    public function delete(User $user, Drug $drug): bool
    {
        return $user->can(MasterDataPermission::DrugManage->value);
    }
}
