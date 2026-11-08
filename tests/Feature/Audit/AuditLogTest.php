<?php

use App\Enums\RoleName;
use App\Models\Patient;
use App\Models\PatientAccessLog;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed([PermissionSeeder::class, RoleSeeder::class]);
});

test('auditor can see activity log list', function () {
    $auditor = User::factory()->create();
    $auditor->assignRole(RoleName::Auditor->value);

    activity()->causedBy($auditor)->log('Test activity log');

    $this->actingAs($auditor)
        ->get(route('audit.logs.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('audit/log/list/index')
            ->has('logs.data')
            ->has('statistics')
        );
});

test('auditor can see patient access log list', function () {
    $auditor = User::factory()->create();
    $auditor->assignRole(RoleName::Auditor->value);

    $patient = Patient::factory()->create();
    PatientAccessLog::create([
        'user_id' => $auditor->id,
        'patient_id' => $patient->id,
        'action' => 'view',
        'accessed_at' => now(),
    ]);

    $this->actingAs($auditor)
        ->get(route('audit.patient-access.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('audit/patient-access/list/index')
            ->has('logs.data')
            ->has('statistics')
        );
});

test('unauthorized user cannot see audit logs', function () {
    $user = User::factory()->create();
    $user->assignRole(RoleName::Cashier->value);

    $this->actingAs($user)
        ->get(route('audit.logs.index'))
        ->assertForbidden();

    $this->actingAs($user)
        ->get(route('audit.patient-access.index'))
        ->assertForbidden();
});
