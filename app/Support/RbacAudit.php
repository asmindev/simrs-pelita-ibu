<?php

namespace App\Support;

use App\Models\User;
use Spatie\Activitylog\Models\Activity;
use Spatie\Permission\Models\Role;

final class RbacAudit
{
    /**
     * @param  array<string, mixed>  $properties
     */
    private static function record(User $actor, User $target, string $event, array $properties): Activity
    {
        return activity('rbac')
            ->causedBy($actor)
            ->performedOn($target)
            ->event($event)
            ->withProperties($properties)
            ->log('RBAC changed');
    }

    public static function roleAssigned(User $actor, User $target, string $role): Activity
    {
        return self::record($actor, $target, 'role_assigned', ['role' => $role]);
    }

    public static function roleRevoked(User $actor, User $target, string $role): Activity
    {
        return self::record($actor, $target, 'role_revoked', ['role' => $role]);
    }

    /**
     * @param  array<int, string>  $permissions
     */
    public static function permissionsSynced(User $actor, Role $role, array $permissions): Activity
    {
        return activity('rbac')
            ->causedBy($actor)
            ->performedOn($role)
            ->event('permissions_synced')
            ->withProperties(['permissions' => array_values($permissions)])
            ->log('Permissions synced');
    }
}
