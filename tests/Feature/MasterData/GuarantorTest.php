<?php

use App\Enums\GuarantorType;
use App\Enums\RoleName;
use App\Models\Guarantor;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Support\Facades\Gate;

beforeEach(function () {
    $this->seed([PermissionSeeder::class, RoleSeeder::class]);
});

test('guarantor factory creates active guarantor with correct casts', function () {
    $guarantor = Guarantor::factory()->create([
        'code' => 'BPJS-01',
        'name' => 'BPJS Kesehatan',
        'type' => GuarantorType::Bpjs,
        'description' => 'Badan Penyelenggara Jaminan Sosial Kesehatan',
        'is_active' => true,
    ]);

    expect($guarantor->code)->toBe('BPJS-01')
        ->and($guarantor->name)->toBe('BPJS Kesehatan')
        ->and($guarantor->type)->toBe(GuarantorType::Bpjs)
        ->and($guarantor->description)->toBe('Badan Penyelenggara Jaminan Sosial Kesehatan')
        ->and($guarantor->is_active)->toBeTrue();
});

test('guarantor factory inactive state creates inactive guarantor', function () {
    $guarantor = Guarantor::factory()->inactive()->create();

    expect($guarantor->is_active)->toBeFalse();
});

test('guarantor records activity log on creation and update', function () {
    $guarantor = Guarantor::factory()->create([
        'code' => 'ASR-01',
        'name' => 'Asuransi Sinarmas',
        'type' => GuarantorType::Insurance,
    ]);

    $this->assertDatabaseHas('activity_log', [
        'log_name' => 'master-data',
        'event' => 'created',
        'subject_type' => Guarantor::class,
        'subject_id' => $guarantor->id,
    ]);

    $guarantor->update(['name' => 'Sinarmas MSIG Life']);

    $this->assertDatabaseHas('activity_log', [
        'log_name' => 'master-data',
        'event' => 'updated',
        'subject_type' => Guarantor::class,
        'subject_id' => $guarantor->id,
    ]);
});

test('guarantor scope search filters by code or name', function () {
    Guarantor::factory()->create([
        'code' => 'BPJS',
        'name' => 'BPJS Kesehatan Cabang Utama',
    ]);
    Guarantor::factory()->create([
        'code' => 'PRUD',
        'name' => 'Prudential Life Assurance',
    ]);

    expect(Guarantor::query()->search('BPJS')->count())->toBe(1)
        ->and(Guarantor::query()->search('Prudential')->count())->toBe(1)
        ->and(Guarantor::query()->search('NonExistent')->count())->toBe(0);
});

test('guarantor policy checks view and manage permissions', function () {
    $admin = User::factory()->create();
    $admin->assignRole(RoleName::Admin->value);

    $auditor = User::factory()->create();
    $auditor->assignRole(RoleName::Auditor->value);

    $superAdmin = User::factory()->create();
    $superAdmin->assignRole(RoleName::SuperAdmin->value);

    $guarantor = Guarantor::factory()->create();

    // Admin has both view and manage
    expect(Gate::forUser($admin)->allows('viewAny', Guarantor::class))->toBeTrue()
        ->and(Gate::forUser($admin)->allows('view', $guarantor))->toBeTrue()
        ->and(Gate::forUser($admin)->allows('create', Guarantor::class))->toBeTrue()
        ->and(Gate::forUser($admin)->allows('update', $guarantor))->toBeTrue()
        ->and(Gate::forUser($admin)->allows('delete', $guarantor))->toBeTrue();

    // Auditor has no guarantor view or manage permissions
    expect(Gate::forUser($auditor)->allows('viewAny', Guarantor::class))->toBeFalse()
        ->and(Gate::forUser($auditor)->allows('view', $guarantor))->toBeFalse()
        ->and(Gate::forUser($auditor)->allows('create', Guarantor::class))->toBeFalse()
        ->and(Gate::forUser($auditor)->allows('update', $guarantor))->toBeFalse()
        ->and(Gate::forUser($auditor)->allows('delete', $guarantor))->toBeFalse();

    // SuperAdmin bypasses all
    expect(Gate::forUser($superAdmin)->allows('viewAny', Guarantor::class))->toBeTrue()
        ->and(Gate::forUser($superAdmin)->allows('view', $guarantor))->toBeTrue()
        ->and(Gate::forUser($superAdmin)->allows('create', Guarantor::class))->toBeTrue()
        ->and(Gate::forUser($superAdmin)->allows('update', $guarantor))->toBeTrue()
        ->and(Gate::forUser($superAdmin)->allows('delete', $guarantor))->toBeTrue();
});
