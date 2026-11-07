<?php

use App\Enums\AssessmentType;
use App\Enums\EncounterStatus;
use App\Enums\RoleName;
use App\Models\Assessment;
use App\Models\Encounter;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed([PermissionSeeder::class, RoleSeeder::class]);

    $this->doctor = User::factory()->create();
    $this->doctor->assignRole(RoleName::Doctor->value);

    $this->nurse = User::factory()->create();
    $this->nurse->assignRole(RoleName::Nurse->value);

    $this->staff = User::factory()->create();
    $this->staff->assignRole(RoleName::Registration->value);
});

test('guest cannot access medical record assessment', function () {
    $encounter = Encounter::factory()->create();

    $this->post(route('medical-record.encounters.assessments.store', $encounter), [
        'type' => AssessmentType::Soap->value,
    ])->assertRedirect(route('login'));
});

test('doctor can create assessment and encounter transitions to in_consultation', function () {
    $encounter = Encounter::factory()->create([
        'status' => EncounterStatus::Arrived,
    ]);

    $response = $this->actingAs($this->doctor)
        ->post(route('medical-record.encounters.assessments.store', $encounter), [
            'type' => AssessmentType::Soap->value,
            'subjective' => 'Pasien mengeluh demam sejak 3 hari.',
            'objective' => 'Suhu 38.5 C, tenggorokan hiperemis.',
            'assessment' => 'Faringitis Akut',
            'plan' => 'Paracetamol 500mg 3x1, Amoxicillin 500mg 3x1',
            'vital_signs' => [
                'systolic' => 120,
                'diastolic' => 80,
                'temperature' => 38.5,
                'heart_rate' => 84,
            ],
            'triage_level' => 'green',
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $this->assertDatabaseHas('assessments', [
        'encounter_id' => $encounter->id,
        'patient_id' => $encounter->patient_id,
        'created_by' => $this->doctor->id,
        'type' => AssessmentType::Soap->value,
        'assessment' => 'Faringitis Akut',
        'is_final' => false,
    ]);

    expect($encounter->fresh()->status)->toBe(EncounterStatus::InConsultation);

    $this->assertDatabaseHas('patient_access_logs', [
        'user_id' => $this->doctor->id,
        'patient_id' => $encounter->patient_id,
        'action' => 'create_assessment',
    ]);

    $this->assertDatabaseHas('activity_log', [
        'log_name' => 'medical-record',
        'event' => 'assessment_created',
        'causer_id' => $this->doctor->id,
    ]);
});

test('updating an assessment works with valid last_updated_at', function () {
    $assessment = Assessment::factory()->create([
        'subjective' => 'Keluhan awal',
        'is_final' => false,
    ]);

    $response = $this->actingAs($this->doctor)
        ->put(route('medical-record.assessments.update', $assessment), [
            'subjective' => 'Keluhan telah diperbarui setelah anamnesis lanjut',
            'last_updated_at' => $assessment->updated_at->toISOString(),
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    expect($assessment->fresh()->subjective)->toBe('Keluhan telah diperbarui setelah anamnesis lanjut');
});

test('updating an assessment fails with optimistic locking conflict', function () {
    $assessment = Assessment::factory()->create([
        'subjective' => 'Keluhan awal',
        'is_final' => false,
    ]);

    // Simulate another user updating the assessment 5 minutes ago
    $staleTimestamp = $assessment->updated_at->subMinutes(5)->toISOString();

    $response = $this->actingAs($this->doctor)
        ->put(route('medical-record.assessments.update', $assessment), [
            'subjective' => 'Perubahan konflik',
            'last_updated_at' => $staleTimestamp,
        ]);

    $response->assertSessionHasErrors(['last_updated_at']);
    expect($assessment->fresh()->subjective)->toBe('Keluhan awal');
});

test('finalizing an assessment locks it from direct updates', function () {
    $assessment = Assessment::factory()->create([
        'is_final' => false,
    ]);

    $response = $this->actingAs($this->doctor)
        ->post(route('medical-record.assessments.finalize', $assessment), [
            'last_updated_at' => $assessment->updated_at->toISOString(),
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $fresh = $assessment->fresh();
    expect($fresh->is_final)->toBeTrue();
    expect($fresh->finalized_by)->toBe($this->doctor->id);
    expect($fresh->finalized_at)->not->toBeNull();

    // Attempting to update a finalized assessment should be forbidden
    $this->actingAs($this->doctor)
        ->put(route('medical-record.assessments.update', $fresh), [
            'subjective' => 'Mencoba merubah setelah final',
            'last_updated_at' => $fresh->updated_at->toISOString(),
        ])
        ->assertForbidden();
});

test('finalized assessment can have addenda added', function () {
    $assessment = Assessment::factory()->final()->create();

    $response = $this->actingAs($this->doctor)
        ->post(route('medical-record.assessments.addenda.store', $assessment), [
            'reason' => 'Klarifikasi riwayat alergi obat',
            'content' => 'Pasien baru mengingat adanya riwayat alergi terhadap obat golongan sulfa.',
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $this->assertDatabaseHas('record_addenda', [
        'assessment_id' => $assessment->id,
        'created_by' => $this->doctor->id,
        'reason' => 'Klarifikasi riwayat alergi obat',
    ]);

    $this->assertDatabaseHas('patient_access_logs', [
        'user_id' => $this->doctor->id,
        'patient_id' => $assessment->patient_id,
        'action' => 'addendum_created',
    ]);
});
