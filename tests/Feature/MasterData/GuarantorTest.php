<?php

use App\Enums\GuarantorType;
use App\Enums\RoleName;
use App\Models\Guarantor;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Support\Facades\Gate;
use Inertia\Testing\AssertableInertia;

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

test('guarantor index lists and filters guarantors', function () {
    $admin = User::factory()->create();
    $admin->assignRole(RoleName::Admin->value);

    Guarantor::factory()->create([
        'code' => 'BPJS-01',
        'name' => 'BPJS Kesehatan',
        'type' => GuarantorType::Bpjs,
    ]);
    Guarantor::factory()->inactive()->create([
        'code' => 'ASR-01',
        'name' => 'Asuransi Mandiri Inhealth',
        'type' => GuarantorType::Insurance,
    ]);

    $this->actingAs($admin)
        ->get(route('master-data.guarantors.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('master-data/guarantor/list/index')
            ->has('guarantors.data', 2)
            ->where('filters.search', '')
            ->where('filters.type', '')
            ->where('filters.status', '')
        );

    $this->actingAs($admin)
        ->get(route('master-data.guarantors.index', [
            'search' => 'Mandiri',
            'type' => 'insurance',
            'status' => 'inactive',
        ]))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->has('guarantors.data', 1)
            ->where('guarantors.data.0.code', 'ASR-01')
        );
});

test('guarantor index requires view permission', function () {
    $auditor = User::factory()->create();
    $auditor->assignRole(RoleName::Auditor->value);

    $this->actingAs($auditor)
        ->get(route('master-data.guarantors.index'))
        ->assertForbidden();
});

test('admin can store valid guarantor with activity log', function () {
    $admin = User::factory()->create();
    $admin->assignRole(RoleName::Admin->value);

    $response = $this->actingAs($admin)
        ->post(route('master-data.guarantors.store'), [
            'code' => 'JASA-01',
            'name' => 'PT Jasa Raharja',
            'type' => 'insurance',
            'description' => 'Asuransi kecelakaan lalu lintas',
            'is_active' => true,
        ]);

    $response->assertRedirect(route('master-data.guarantors.index'))
        ->assertSessionHas('success');

    $this->assertDatabaseHas('guarantors', [
        'code' => 'JASA-01',
        'name' => 'PT Jasa Raharja',
    ]);

    $this->assertDatabaseHas('activity_log', [
        'log_name' => 'master-data',
        'event' => 'created',
        'subject_type' => Guarantor::class,
    ]);
});

test('store rejects duplicate code and invalid type', function () {
    $admin = User::factory()->create();
    $admin->assignRole(RoleName::Admin->value);

    Guarantor::factory()->create(['code' => 'EXISTING']);

    $response = $this->actingAs($admin)
        ->post(route('master-data.guarantors.store'), [
            'code' => 'EXISTING',
            'name' => 'Duplikat',
            'type' => 'invalid_type',
        ]);

    $response->assertSessionHasErrors(['code', 'type']);
});

test('admin can update guarantor', function () {
    $admin = User::factory()->create();
    $admin->assignRole(RoleName::Admin->value);

    $guarantor = Guarantor::factory()->create([
        'code' => 'BPJS-OLD',
        'name' => 'BPJS Lama',
    ]);

    $response = $this->actingAs($admin)
        ->put(route('master-data.guarantors.update', $guarantor), [
            'code' => 'BPJS-OLD',
            'name' => 'BPJS Baru',
            'type' => 'bpjs',
            'is_active' => false,
        ]);

    $response->assertRedirect(route('master-data.guarantors.index'))
        ->assertSessionHas('success');

    expect($guarantor->fresh()->name)->toBe('BPJS Baru')
        ->and($guarantor->fresh()->is_active)->toBeFalse();
});

test('admin can delete guarantor', function () {
    $admin = User::factory()->create();
    $admin->assignRole(RoleName::Admin->value);

    $guarantor = Guarantor::factory()->create();

    $response = $this->actingAs($admin)
        ->delete(route('master-data.guarantors.destroy', $guarantor));

    $response->assertRedirect(route('master-data.guarantors.index'))
        ->assertSessionHas('success');

    $this->assertDatabaseMissing('guarantors', ['id' => $guarantor->id]);
});
