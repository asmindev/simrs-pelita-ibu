<?php

use App\Enums\RoleName;
use App\Models\BreakGlassGrant;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Support\Facades\Gate;

beforeEach(function () {
    $this->seed([PermissionSeeder::class, RoleSeeder::class]);
});

function createBreakGlassGrantForTest(array $attributes = []): BreakGlassGrant
{
    return BreakGlassGrant::create([
        'user_id' => User::factory()->create()->id,
        'patient_id' => 1,
        'reason' => 'Emergency access',
        'granted_at' => now(),
        'expires_at' => now()->addMinutes(30),
        ...$attributes,
    ]);
}

test('break glass grant is active only while valid', function () {
    $active = createBreakGlassGrantForTest();
    $expired = createBreakGlassGrantForTest(['expires_at' => now()->subMinute()]);
    $revoked = createBreakGlassGrantForTest(['revoked_at' => now()]);

    expect($active->isActive())->toBeTrue()
        ->and($expired->isActive())->toBeFalse()
        ->and($revoked->isActive())->toBeFalse()
        ->and(BreakGlassGrant::active()->count())->toBe(1);
});

test('clinical roles can request break glass access', function () {
    $doctor = User::factory()->create();
    $doctor->assignRole(RoleName::Doctor->value);

    $nurse = User::factory()->create();
    $nurse->assignRole(RoleName::Nurse->value);

    $auditor = User::factory()->create();
    $auditor->assignRole(RoleName::Auditor->value);

    expect(Gate::forUser($doctor)->allows('create', BreakGlassGrant::class))->toBeTrue()
        ->and(Gate::forUser($nurse)->allows('create', BreakGlassGrant::class))->toBeTrue()
        ->and(Gate::forUser($auditor)->allows('create', BreakGlassGrant::class))->toBeFalse();
});

test('only reviewers can review break glass grants', function () {
    $grant = createBreakGlassGrantForTest();

    $auditor = User::factory()->create();
    $auditor->assignRole(RoleName::Auditor->value);

    $doctor = User::factory()->create();
    $doctor->assignRole(RoleName::Doctor->value);

    expect(Gate::forUser($auditor)->allows('review', $grant))->toBeTrue()
        ->and(Gate::forUser($doctor)->allows('review', $grant))->toBeFalse();
});

test('owners can view their own break glass grant', function () {
    $owner = User::factory()->create();
    $grant = createBreakGlassGrantForTest(['user_id' => $owner->id]);

    $otherDoctor = User::factory()->create();
    $otherDoctor->assignRole(RoleName::Doctor->value);

    expect(Gate::forUser($owner)->allows('view', $grant))->toBeTrue()
        ->and(Gate::forUser($otherDoctor)->allows('view', $grant))->toBeFalse();
});
