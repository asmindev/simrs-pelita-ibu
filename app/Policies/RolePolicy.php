<?php

namespace App\Policies;

use App\Enums\Permissions\RbacPermission;
use App\Models\User;
use Spatie\Permission\Models\Role;

class RolePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can(RbacPermission::RoleView->value);
    }

    public function view(User $user, Role $role): bool
    {
        return $user->can(RbacPermission::RoleView->value);
    }

    public function create(User $user): bool
    {
        return $user->can(RbacPermission::RoleAssign->value);
    }

    public function update(User $user, Role $role): bool
    {
        return $user->can(RbacPermission::RoleAssign->value);
    }

    public function delete(User $user, Role $role): bool
    {
        if ($role->name === 'super-admin') {
            return false;
        }

        return $user->can(RbacPermission::RoleAssign->value);
    }
}
