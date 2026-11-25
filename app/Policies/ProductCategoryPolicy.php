<?php

namespace App\Policies;

use App\Enums\Permissions\MasterDataPermission;
use App\Models\ProductCategory;
use App\Models\User;

class ProductCategoryPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can(MasterDataPermission::ProductView->value);
    }

    public function view(User $user, ProductCategory $productCategory): bool
    {
        return $user->can(MasterDataPermission::ProductView->value);
    }

    public function create(User $user): bool
    {
        return $user->can(MasterDataPermission::ProductManage->value);
    }

    public function update(User $user, ProductCategory $productCategory): bool
    {
        return $user->can(MasterDataPermission::ProductManage->value);
    }

    public function delete(User $user, ProductCategory $productCategory): bool
    {
        return $user->can(MasterDataPermission::ProductManage->value);
    }
}
