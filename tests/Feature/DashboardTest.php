<?php

use App\Enums\RoleName;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Database\Seeders\SuperAdminSeeder;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to login from the dashboard', function () {
    $this->get(route('dashboard'))->assertRedirect(route('login'));
});

test('authenticated users can view the dashboard', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('dashboard/index'));
});

test('authenticated users receive their roles and permissions on the dashboard', function () {
    $this->seed([PermissionSeeder::class, RoleSeeder::class]);

    $user = User::factory()->create();
    $user->assignRole(RoleName::Registration->value);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard/index')
            ->has('auth.user')
            ->where('auth.roles', [RoleName::Registration->value])
            ->has('auth.permissions')
        );
});

test('super admin has super-admin role on dashboard', function () {
    $this->seed([PermissionSeeder::class, RoleSeeder::class, SuperAdminSeeder::class]);

    $admin = User::where('email', config('simrs.super_admin.email'))->firstOrFail();

    $this->actingAs($admin)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard/index')
            ->where('auth.roles', [RoleName::SuperAdmin->value])
        );
});
