<?php

use App\Enums\RoleName;
use App\Models\User;
use App\Support\PermissionRegistry;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed([PermissionSeeder::class, RoleSeeder::class]);
});

test('super admin bypasses gate checks', function () {
    $user = User::factory()->create();
    $user->assignRole(RoleName::SuperAdmin->value);

    expect(Gate::forUser($user)->allows('any-ability'))->toBeTrue();
});

test('users without the super admin role do not bypass gate checks', function () {
    $user = User::factory()->create();

    expect(Gate::forUser($user)->allows('any-ability'))->toBeFalse();
});

test('permission middleware allows users whose role has the permission', function () {
    Route::middleware(['web', 'permission:master-data.patient.view'])
        ->get('/rbac/permission-check', fn () => 'ok');

    $user = User::factory()->create();
    $user->assignRole(RoleName::Doctor->value);

    $this->actingAs($user)->get('/rbac/permission-check')->assertOk();
});

test('permission middleware blocks users without the permission', function () {
    Route::middleware(['web', 'permission:master-data.patient.view'])
        ->get('/rbac/permission-check', fn () => 'ok');

    $user = User::factory()->create();
    $user->assignRole(RoleName::Auditor->value);

    $this->actingAs($user)->get('/rbac/permission-check')->assertForbidden();
});

test('role middleware allows users with the role', function () {
    Route::middleware(['web', 'role:doctor'])
        ->get('/rbac/role-check', fn () => 'ok');

    $user = User::factory()->create();
    $user->assignRole(RoleName::Doctor->value);

    $this->actingAs($user)->get('/rbac/role-check')->assertOk();
});

test('inertia shares roles and permissions for authenticated users', function () {
    $user = User::factory()->create();
    $user->assignRole(RoleName::Doctor->value);

    $expected = $user->getAllPermissions()->pluck('name')->sort()->values()->all();

    $this->actingAs($user)->get('/')->assertInertia(fn (Assert $page) => $page
        ->where('auth.roles', [RoleName::Doctor->value])
        ->where('auth.permissions', $expected));
});

test('inertia shares every permission for super admin', function () {
    $user = User::factory()->create();
    $user->assignRole(RoleName::SuperAdmin->value);

    $expected = collect(PermissionRegistry::all())->sort()->values()->all();

    $this->actingAs($user)->get('/')->assertInertia(fn (Assert $page) => $page
        ->where('auth.roles', [RoleName::SuperAdmin->value])
        ->where('auth.permissions', $expected));
});

test('inertia shares empty authorization data for guests', function () {
    $this->get('/')->assertInertia(fn (Assert $page) => $page
        ->where('auth.user', null)
        ->where('auth.roles', [])
        ->where('auth.permissions', []));
});
