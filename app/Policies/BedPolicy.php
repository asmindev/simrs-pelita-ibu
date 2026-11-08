<?php

namespace App\Policies;

use App\Enums\Permissions\InpatientPermission;
use App\Models\Bed;
use App\Models\User;

class BedPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can(InpatientPermission::BedView->value);
    }

    public function create(User $user): bool
    {
        return $user->can(InpatientPermission::BedView->value);
    }

    public function update(User $user, Bed $bed): bool
    {
        return $user->can(InpatientPermission::BedView->value);
    }
}
