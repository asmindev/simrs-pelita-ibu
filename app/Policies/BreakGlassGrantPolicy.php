<?php

namespace App\Policies;

use App\Enums\Permissions\RbacPermission;
use App\Models\BreakGlassGrant;
use App\Models\User;

class BreakGlassGrantPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can(RbacPermission::BreakGlassReview->value);
    }

    public function view(User $user, BreakGlassGrant $breakGlassGrant): bool
    {
        return $breakGlassGrant->user_id === $user->id
            || $user->can(RbacPermission::BreakGlassReview->value);
    }

    public function create(User $user): bool
    {
        return $user->can(RbacPermission::BreakGlassRequest->value);
    }

    public function review(User $user, BreakGlassGrant $breakGlassGrant): bool
    {
        return $user->can(RbacPermission::BreakGlassReview->value);
    }

    public function update(User $user, BreakGlassGrant $breakGlassGrant): bool
    {
        return false;
    }

    public function delete(User $user, BreakGlassGrant $breakGlassGrant): bool
    {
        return false;
    }
}
