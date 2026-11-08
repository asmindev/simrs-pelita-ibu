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

test('super admin accesses executive dashboard by default', function (): void {
    $user = User::factory()->create();
    $user->assignRole(RoleName::SuperAdmin->value);

    $response = $this->actingAs($user)->get(route('dashboard'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard/index')
            ->where('activeRole', 'executive')
            ->has('availableRoles')
            ->has('metrics.total_encounters_today')
            ->has('metrics.bor_percentage')
            ->has('widgets.recent_encounters')
            ->has('widgets.recent_audit_logs')
        );
});

test('doctor accesses doctor dashboard', function (): void {
    $user = User::factory()->create();
    $user->assignRole(RoleName::Doctor->value);

    $response = $this->actingAs($user)->get(route('dashboard'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard/index')
            ->where('activeRole', 'doctor')
            ->has('metrics.waiting_count')
            ->has('widgets.patient_queue')
        );
});

test('registration staff accesses registration dashboard', function (): void {
    $user = User::factory()->create();
    $user->assignRole(RoleName::Registration->value);

    $response = $this->actingAs($user)->get(route('dashboard'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard/index')
            ->where('activeRole', 'registration')
            ->has('metrics.total_encounters')
            ->has('widgets.queues_by_unit')
        );
});

test('pharmacist accesses pharmacy dashboard', function (): void {
    $user = User::factory()->create();
    $user->assignRole(RoleName::Pharmacist->value);

    $response = $this->actingAs($user)->get(route('dashboard'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard/index')
            ->where('activeRole', 'pharmacist')
            ->has('metrics.submitted_count')
            ->has('widgets.pending_prescriptions')
        );
});

test('cashier accesses cashier dashboard', function (): void {
    $user = User::factory()->create();
    $user->assignRole(RoleName::Cashier->value);

    $response = $this->actingAs($user)->get(route('dashboard'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard/index')
            ->where('activeRole', 'cashier')
            ->has('metrics.pending_invoices_count')
            ->has('widgets.pending_invoices')
        );
});

test('nurse accesses nurse dashboard', function (): void {
    $user = User::factory()->create();
    $user->assignRole(RoleName::Nurse->value);

    $response = $this->actingAs($user)->get(route('dashboard'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard/index')
            ->where('activeRole', 'nurse')
            ->has('metrics.bor_percentage')
            ->has('widgets.bed_classes')
        );
});

test('lab analyst accesses diagnostics dashboard', function (): void {
    $user = User::factory()->create();
    $user->assignRole(RoleName::LabAnalyst->value);

    $response = $this->actingAs($user)->get(route('dashboard'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard/index')
            ->where('activeRole', 'diagnostics')
            ->has('metrics.pending_lab_orders')
            ->has('widgets.pending_orders')
        );
});

test('super admin can switch dashboard role view via query parameter', function (): void {
    $user = User::factory()->create();
    $user->assignRole(RoleName::SuperAdmin->value);

    $response = $this->actingAs($user)->get(route('dashboard', ['role' => 'cashier']));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard/index')
            ->where('activeRole', 'cashier')
            ->has('metrics.pending_invoices_count')
            ->has('widgets.pending_invoices')
        );
});
