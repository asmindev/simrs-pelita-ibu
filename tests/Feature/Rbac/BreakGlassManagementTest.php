<?php

use App\Enums\RoleName;
use App\Models\BreakGlassGrant;
use App\Models\Patient;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed([PermissionSeeder::class, RoleSeeder::class]);
});

test('auditor can see break-glass grants list', function () {
    $auditor = User::factory()->create();
    $auditor->assignRole(RoleName::Auditor->value);

    $this->actingAs($auditor)
        ->get(route('rbac.break-glass.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('rbac/break-glass/list/index')
            ->has('grants.data')
            ->has('statistics')
        );
});

test('unauthorized user cannot see break-glass grants list', function () {
    $user = User::factory()->create();
    $user->assignRole(RoleName::Pharmacist->value);

    $this->actingAs($user)
        ->get(route('rbac.break-glass.index'))
        ->assertForbidden();
});

test('auditor can review a break glass grant', function () {
    $auditor = User::factory()->create();
    $auditor->assignRole(RoleName::Auditor->value);

    $doctor = User::factory()->create();
    $patient = Patient::factory()->create();

    $grant = BreakGlassGrant::create([
        'user_id' => $doctor->id,
        'patient_id' => $patient->id,
        'reason' => 'Kedaruratan pasien tidak sadar di IGD',
        'granted_at' => now()->subMinutes(10),
        'expires_at' => now()->addMinutes(50),
    ]);

    $response = $this->actingAs($auditor)
        ->post(route('rbac.break-glass.review', $grant->id), [
            'review_notes' => 'Tervalidasi sesuai kondisi darurat IGD.',
        ]);

    $response->assertRedirect(route('rbac.break-glass.index'));

    $grant->refresh();
    expect($grant->reviewed_by_id)->toBe($auditor->id)
        ->and($grant->reviewed_at)->not->toBeNull()
        ->and($grant->review_notes)->toBe('Tervalidasi sesuai kondisi darurat IGD.');
});

test('auditor can revoke an active break glass grant', function () {
    $auditor = User::factory()->create();
    $auditor->assignRole(RoleName::Auditor->value);

    $doctor = User::factory()->create();
    $patient = Patient::factory()->create();

    $grant = BreakGlassGrant::create([
        'user_id' => $doctor->id,
        'patient_id' => $patient->id,
        'reason' => 'Kedaruratan pasien',
        'granted_at' => now()->subMinutes(10),
        'expires_at' => now()->addMinutes(50),
    ]);

    $response = $this->actingAs($auditor)
        ->post(route('rbac.break-glass.revoke', $grant->id));

    $response->assertRedirect(route('rbac.break-glass.index'));

    $grant->refresh();
    expect($grant->revoked_at)->not->toBeNull();
});
