<?php

use App\Enums\RoleName;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    $this->seed([PermissionSeeder::class, RoleSeeder::class]);
});

test('admin can see roles and permission matrix', function () {
    $admin = User::factory()->create();
    $admin->assignRole(RoleName::SuperAdmin->value);

    $this->actingAs($admin)
        ->get(route('rbac.roles.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('rbac/role/list/index')
            ->has('roles')
            ->has('groupedPermissions')
        );
});

test('unauthorized user cannot see roles', function () {
    $user = User::factory()->create();
    $user->assignRole(RoleName::Nurse->value);

    $this->actingAs($user)
        ->get(route('rbac.roles.index'))
        ->assertForbidden();
});

test('admin can create a new role', function () {
    $admin = User::factory()->create();
    $admin->assignRole(RoleName::SuperAdmin->value);

    $response = $this->actingAs($admin)
        ->post(route('rbac.roles.store'), [
            'name' => 'radiology-officer',
        ]);

    $response->assertRedirect(route('rbac.roles.index'));

    expect(Role::where('name', 'radiology-officer')->exists())->toBeTrue();
});

test('admin can update permissions of a role', function () {
    $admin = User::factory()->create();
    $admin->assignRole(RoleName::SuperAdmin->value);

    $role = Role::create(['name' => 'custom-cashier', 'guard_name' => 'web']);

    $response = $this->actingAs($admin)
        ->put(route('rbac.roles.permissions.update', $role->id), [
            'permissions' => ['cashier.invoice.view', 'cashier.payment.create'],
        ]);

    $response->assertRedirect(route('rbac.roles.index'));

    $role->refresh();
    expect($role->hasPermissionTo('cashier.invoice.view'))->toBeTrue()
        ->and($role->hasPermissionTo('cashier.payment.create'))->toBeTrue();
});
