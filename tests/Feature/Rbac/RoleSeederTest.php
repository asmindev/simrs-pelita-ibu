<?php

use App\Enums\RoleName;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    $this->seed([PermissionSeeder::class, RoleSeeder::class]);
});

test('role seeder creates every baseline role', function () {
    expect(Role::count())->toBe(count(RoleName::cases()));

    foreach (RoleName::cases() as $roleName) {
        expect(Role::where('name', $roleName->value)->where('guard_name', 'web')->exists())->toBeTrue();
    }
});

test('baseline roles receive explicit permissions', function () {
    expect(Role::findByName('doctor', 'web')->hasPermissionTo('medical-record.encounter.update'))->toBeTrue()
        ->and(Role::findByName('nurse', 'web')->hasPermissionTo('master-data.patient.create'))->toBeFalse()
        ->and(Role::findByName('lab-analyst', 'web')->hasPermissionTo('diagnostics.result.verify'))->toBeTrue();
});

test('super admin relies on gate bypass and has no explicit permissions', function () {
    expect(Role::findByName('super-admin', 'web')->permissions)->toBeEmpty();
});

test('role seeder is idempotent', function () {
    $permissionCount = Permission::count();

    $this->seed([PermissionSeeder::class, RoleSeeder::class]);

    expect(Role::count())->toBe(count(RoleName::cases()))
        ->and(Permission::count())->toBe($permissionCount);
});
