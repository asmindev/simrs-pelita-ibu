<?php

use App\Enums\RoleName;
use App\Models\PatientAccessLog;
use App\Models\Unit;
use App\Models\User;
use App\Support\PatientAccessLogger;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Support\Facades\Gate;

beforeEach(function () {
    $this->seed([PermissionSeeder::class, RoleSeeder::class]);
});

test('patient access logger records the access', function () {
    $user = User::factory()->create();
    $unit = Unit::factory()->create();

    $log = app(PatientAccessLogger::class)->record(
        $user,
        42,
        'view',
        $unit,
        ['source' => 'encounter'],
    );

    expect($log->user_id)->toBe($user->id)
        ->and($log->patient_id)->toBe(42)
        ->and($log->unit_id)->toBe($unit->id)
        ->and($log->action)->toBe('view')
        ->and($log->context)->toBe(['source' => 'encounter']);

    $this->assertDatabaseHas('patient_access_logs', [
        'user_id' => $user->id,
        'patient_id' => 42,
        'unit_id' => $unit->id,
        'action' => 'view',
    ]);
});

test('patient access logs are only visible with the audit permission', function () {
    $log = app(PatientAccessLogger::class)->record(
        User::factory()->create(),
        1,
        'view',
    );

    $auditor = User::factory()->create();
    $auditor->assignRole(RoleName::Auditor->value);

    $doctor = User::factory()->create();
    $doctor->assignRole(RoleName::Doctor->value);

    expect(Gate::forUser($auditor)->allows('view', $log))->toBeTrue()
        ->and(Gate::forUser($auditor)->allows('viewAny', PatientAccessLog::class))->toBeTrue()
        ->and(Gate::forUser($doctor)->allows('view', $log))->toBeFalse();
});
