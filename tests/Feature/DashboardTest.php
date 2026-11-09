<?php

use App\Enums\RoleName;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function (): void {
    $this->seed(PermissionSeeder::class);
    $this->seed(RoleSeeder::class);
});

test('guest cannot access dashboard', function (): void {
    $response = $this->get(route('dashboard'));

    $response->assertRedirect(route('login'));
});

test('super admin accesses unified dashboard with global overview', function (): void {
    $user = User::factory()->create();
    $user->assignRole(RoleName::SuperAdmin->value);

    $response = $this->actingAs($user)->get(route('dashboard'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard/index')
            ->where('isSuperAdmin', true)
            ->has('pipeline')
            ->has('pipeline.registration_count')
            ->has('pipeline.bor_percentage')
            ->has('actionFeed')
            ->has('facilitySnapshot.beds')
            ->has('facilitySnapshot.active_doctors')
        );
});

test('doctor accesses dashboard with customized action feed', function (): void {
    $user = User::factory()->create();
    $user->assignRole(RoleName::Doctor->value);

    $response = $this->actingAs($user)->get(route('dashboard'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard/index')
            ->where('isSuperAdmin', false)
            ->where('assignedRoles', [RoleName::Doctor->value])
            ->has('pipeline')
            ->has('actionFeed')
        );
});

test('multi-role user receives consolidated action feed across their roles', function (): void {
    $user = User::factory()->create();
    $user->assignRole([RoleName::Doctor->value, RoleName::Cashier->value]);

    $response = $this->actingAs($user)->get(route('dashboard'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard/index')
            ->where('isSuperAdmin', false)
            ->has('assignedRoles', 2)
            ->has('pipeline')
            ->has('actionFeed')
        );
});
