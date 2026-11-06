<?php

use App\Enums\RoleName;
use App\Models\User;
use App\Support\RbacAudit;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    $this->seed([PermissionSeeder::class, RoleSeeder::class]);
});

test('role assignment is written to the activity log', function () {
    $actor = User::factory()->create();
    $target = User::factory()->create();

    $activity = RbacAudit::roleAssigned($actor, $target, RoleName::Doctor->value);

    expect($activity->log_name)->toBe('rbac')
        ->and($activity->event)->toBe('role_assigned')
        ->and($activity->subject_type)->toBe(User::class)
        ->and($activity->subject_id)->toBe($target->id)
        ->and($activity->causer_id)->toBe($actor->id)
        ->and($activity->properties->get('role'))->toBe(RoleName::Doctor->value);
});

test('permission sync is written to the activity log', function () {
    $actor = User::factory()->create();
    $role = Role::findByName(RoleName::Doctor->value, 'web');

    $activity = RbacAudit::permissionsSynced($actor, $role, [
        'master-data.patient.view',
        'medical-record.encounter.view',
    ]);

    expect($activity->log_name)->toBe('rbac')
        ->and($activity->event)->toBe('permissions_synced')
        ->and($activity->subject_type)->toBe(Role::class)
        ->and($activity->subject_id)->toBe($role->id)
        ->and($activity->properties->get('permissions'))->toBe([
            'master-data.patient.view',
            'medical-record.encounter.view',
        ]);
});
