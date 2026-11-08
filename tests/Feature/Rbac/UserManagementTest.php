<?php

use App\Enums\RoleName;
use App\Models\Unit;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed([PermissionSeeder::class, RoleSeeder::class]);
});

test('admin with user view permission can see user list', function () {
    $admin = User::factory()->create();
    $admin->assignRole(RoleName::SuperAdmin->value);

    $this->actingAs($admin)
        ->get(route('rbac.users.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('rbac/user/list/index')
            ->has('users.data')
            ->has('statistics')
        );
});

test('user without view permission cannot see user list', function () {
    $user = User::factory()->create();
    $user->assignRole(RoleName::Doctor->value);

    $this->actingAs($user)
        ->get(route('rbac.users.index'))
        ->assertForbidden();
});

test('admin can create new user with roles and units', function () {
    $admin = User::factory()->create();
    $admin->assignRole(RoleName::SuperAdmin->value);

    $unit = Unit::factory()->create();

    $response = $this->actingAs($admin)
        ->post(route('rbac.users.store'), [
            'name' => 'dr. Sarah Connor',
            'email' => 'sarah@rs.local',
            'password' => 'secret1234',
            'roles' => ['doctor'],
            'unit_ids' => [$unit->id],
        ]);

    $response->assertRedirect(route('rbac.users.index'));

    $user = User::where('email', 'sarah@rs.local')->first();
    expect($user)->not->toBeNull()
        ->and($user->hasRole('doctor'))->toBeTrue()
        ->and($user->units)->toHaveCount(1);
});

test('admin can update user and assign new roles', function () {
    $admin = User::factory()->create();
    $admin->assignRole(RoleName::SuperAdmin->value);

    $target = User::factory()->create(['name' => 'Original Name']);
    $target->assignRole(RoleName::Nurse->value);

    $response = $this->actingAs($admin)
        ->put(route('rbac.users.update', $target->id), [
            'name' => 'Updated Name',
            'email' => $target->email,
            'roles' => ['nurse', 'pharmacist'],
        ]);

    $response->assertRedirect(route('rbac.users.index'));

    $target->refresh();
    expect($target->name)->toBe('Updated Name')
        ->and($target->hasRole('nurse'))->toBeTrue()
        ->and($target->hasRole('pharmacist'))->toBeTrue();
});

test('user cannot delete their own account', function () {
    $admin = User::factory()->create();
    $admin->assignRole(RoleName::SuperAdmin->value);

    $this->actingAs($admin)
        ->delete(route('rbac.users.destroy', $admin->id))
        ->assertForbidden();
});

test('admin can delete another regular user', function () {
    $admin = User::factory()->create();
    $admin->assignRole(RoleName::SuperAdmin->value);

    $target = User::factory()->create();
    $target->assignRole(RoleName::Cashier->value);

    $this->actingAs($admin)
        ->delete(route('rbac.users.destroy', $target->id))
        ->assertRedirect(route('rbac.users.index'));

    expect(User::find($target->id))->toBeNull();
});
