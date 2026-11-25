<?php

namespace App\Policies;

use App\Enums\Permissions\MasterDataPermission;
use App\Models\Product;
use App\Models\User;

class ProductPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can(MasterDataPermission::ProductView->value);
    }

    public function view(User $user, Product $product): bool
    {
        return $user->can(MasterDataPermission::ProductView->value);
    }

    public function create(User $user): bool
    {
        return $user->can(MasterDataPermission::ProductManage->value);
    }

    public function update(User $user, Product $product): bool
    {
        return $user->can(MasterDataPermission::ProductManage->value);
    }

    public function delete(User $user, Product $product): bool
    {
        return $user->can(MasterDataPermission::ProductManage->value);
    }
}
