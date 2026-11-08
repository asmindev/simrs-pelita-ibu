<?php

namespace App\Policies;

use App\Enums\Permissions\RbacPermission;
use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can(RbacPermission::UserView->value);
    }

    public function view(User $user, User $model): bool
    {
        return $user->can(RbacPermission::UserView->value);
    }

    public function create(User $user): bool
    {
        return $user->can(RbacPermission::UserManage->value);
    }

    public function update(User $user, User $model): bool
    {
        return $user->can(RbacPermission::UserManage->value);
    }

    public function delete(User $user, User $model): bool
    {
        // Cannot delete self and cannot delete super-admin
        if ($user->id === $model->id) {
            return false;
        }

        if ($model->hasRole('super-admin')) {
            return false;
        }

        return $user->can(RbacPermission::UserManage->value);
    }
}
