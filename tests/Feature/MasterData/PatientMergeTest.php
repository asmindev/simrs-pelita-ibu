<?php

use App\Enums\RoleName;
use App\Models\Patient;
use App\Models\PatientAccessLog;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Spatie\Activitylog\Models\Activity;

beforeEach(function () {
    $this->seed([PermissionSeeder::class, RoleSeeder::class]);

    $this->admin = User::factory()->create();
    $this->admin->assignRole(RoleName::Admin->value);

    $this->doctor = User::factory()->create();
    $this->doctor->assignRole(RoleName::Doctor->value);
});

test('guest cannot merge patients', function () {
    $source = Patient::factory()->create();
    $target = Patient::factory()->create();

    $this->post(route('master-data.patients.merge', $source), [
        'target_patient_id' => $target->id,
        'reason' => 'Duplikasi data pendaftaran lama',
    ])->assertRedirect(route('login'));
});

test('user without patient merge permission cannot merge patients', function () {
    $source = Patient::factory()->create();
    $target = Patient::factory()->create();

    $this->actingAs($this->doctor)
        ->post(route('master-data.patients.merge', $source), [
            'target_patient_id' => $target->id,
            'reason' => 'Duplikasi data pendaftaran lama',
        ])
        ->assertForbidden();
});

test('patient cannot be merged to themselves', function () {
    $patient = Patient::factory()->create();

    $this->actingAs($this->admin)
        ->post(route('master-data.patients.merge', $patient), [
            'target_patient_id' => $patient->id,
            'reason' => 'Self merge test',
        ])
        ->assertSessionHasErrors(['target_patient_id']);
});

test('cannot merge to a non-existent or inactive or already merged patient', function () {
    $source = Patient::factory()->create();
    $inactiveTarget = Patient::factory()->inactive()->create();
    $alreadyMerged = Patient::factory()->create([
        'is_active' => false,
        'merged_to_patient_id' => $source->id,
        'merged_at' => now(),
    ]);

    // Target does not exist
    $this->actingAs($this->admin)
        ->post(route('master-data.patients.merge', $source), [
            'target_patient_id' => 999999,
            'reason' => 'Merge invalid target',
        ])
        ->assertSessionHasErrors(['target_patient_id']);

    // Target is inactive
    $this->actingAs($this->admin)
        ->post(route('master-data.patients.merge', $source), [
            'target_patient_id' => $inactiveTarget->id,
            'reason' => 'Merge inactive target',
        ])
        ->assertSessionHasErrors(['target_patient_id']);

    // Target is already merged
    $this->actingAs($this->admin)
        ->post(route('master-data.patients.merge', $source), [
            'target_patient_id' => $alreadyMerged->id,
            'reason' => 'Merge already merged target',
        ])
        ->assertSessionHasErrors(['target_patient_id']);
});

test('cannot merge a source patient that has already been merged', function () {
    $firstTarget = Patient::factory()->create();
    $source = Patient::factory()->create([
        'is_active' => false,
        'merged_to_patient_id' => $firstTarget->id,
        'merged_at' => now(),
    ]);
    $newTarget = Patient::factory()->create();

    $this->actingAs($this->admin)
        ->post(route('master-data.patients.merge', $source), [
            'target_patient_id' => $newTarget->id,
            'reason' => 'Attempt merge already merged source',
        ])
        ->assertSessionHasErrors(['target_patient_id']);
});

test('patient can be merged successfully with audit logs and access logs', function () {
    $source = Patient::factory()->create([
        'medical_record_number' => 'RM-SRC-001',
        'name' => 'Budi Duplikat',
        'is_active' => true,
    ]);

    $target = Patient::factory()->create([
        'medical_record_number' => 'RM-TGT-001',
        'name' => 'Budi Santoso Asli',
        'is_active' => true,
    ]);

    $response = $this->actingAs($this->admin)
        ->post(route('master-data.patients.merge', $source), [
            'target_patient_id' => $target->id,
            'reason' => 'Duplikasi berkas RM saat pendaftaran rawat jalan sebelumnya',
        ]);

    $response->assertRedirect(route('master-data.patients.edit', $target));
    $response->assertSessionHas('success');

    // Assert source patient status updated
    $source->refresh();
    expect($source->is_active)->toBeFalse();
    expect($source->merged_to_patient_id)->toBe($target->id);
    expect($source->merged_at)->not->toBeNull();

    // Assert target patient remained active
    $target->refresh();
    expect($target->is_active)->toBeTrue();
    expect($target->merged_to_patient_id)->toBeNull();

    // Assert activity log was written
    $activity = Activity::where('log_name', 'master-data')
        ->where('event', 'patient_merged')
        ->where('subject_type', Patient::class)
        ->where('subject_id', $source->id)
        ->first();

    expect($activity)->not->toBeNull();
    expect($activity->causer_id)->toBe($this->admin->id);
    expect($activity->properties['source_medical_record_number'])->toBe('RM-SRC-001');
    expect($activity->properties['target_medical_record_number'])->toBe('RM-TGT-001');
    expect($activity->properties['reason'])->toBe('Duplikasi berkas RM saat pendaftaran rawat jalan sebelumnya');

    // Assert patient access logs were written for both source and target
    $sourceAccessLog = PatientAccessLog::where('patient_id', $source->id)
        ->where('action', 'merge')
        ->first();
    expect($sourceAccessLog)->not->toBeNull();
    expect($sourceAccessLog->user_id)->toBe($this->admin->id);

    $targetAccessLog = PatientAccessLog::where('patient_id', $target->id)
        ->where('action', 'merge_received')
        ->first();
    expect($targetAccessLog)->not->toBeNull();
    expect($targetAccessLog->user_id)->toBe($this->admin->id);
});

test('patient search endpoint returns matching patients', function () {
    $patient1 = Patient::factory()->create([
        'medical_record_number' => 'RM-990001',
        'nik' => '3201019900010001',
        'name' => 'Ahmad Dahlan',
    ]);

    $patient2 = Patient::factory()->create([
        'medical_record_number' => 'RM-990002',
        'nik' => '3201019900020002',
        'name' => 'Siti Khadijah',
    ]);

    // Search by name
    $this->actingAs($this->admin)
        ->getJson(route('master-data.patients.search', ['q' => 'Ahmad']))
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $patient1->id)
        ->assertJsonPath('data.0.name', 'Ahmad Dahlan');

    // Search by RM
    $this->actingAs($this->admin)
        ->getJson(route('master-data.patients.search', ['q' => '990002']))
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $patient2->id);

    // Search with exclude
    $this->actingAs($this->admin)
        ->getJson(route('master-data.patients.search', ['q' => 'RM-99', 'exclude' => $patient1->id]))
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $patient2->id);

    // Empty query returns empty array
    $this->actingAs($this->admin)
        ->getJson(route('master-data.patients.search', ['q' => '']))
        ->assertOk()
        ->assertJsonCount(0, 'data');
});
