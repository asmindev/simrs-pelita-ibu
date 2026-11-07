<?php

use App\Enums\EncounterStatus;
use App\Enums\EncounterType;
use App\Enums\QueueStatus;
use App\Enums\RoleName;
use App\Models\Doctor;
use App\Models\Encounter;
use App\Models\Guarantor;
use App\Models\Patient;
use App\Models\PatientAccessLog;
use App\Models\Queue;
use App\Models\Unit;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Spatie\Activitylog\Models\Activity;

beforeEach(function () {
    $this->seed([PermissionSeeder::class, RoleSeeder::class]);

    $this->admin = User::factory()->create();
    $this->admin->assignRole(RoleName::Admin->value);

    $this->staff = User::factory()->create();
    $this->staff->assignRole(RoleName::Registration->value);

    $this->doctorUser = User::factory()->create();
    $this->doctorUser->assignRole(RoleName::Doctor->value);
});

test('guest cannot access registration', function () {
    $this->get(route('registration.index'))->assertRedirect(route('login'));
    $this->get(route('registration.visits.index'))->assertRedirect(route('login'));
    $this->get(route('registration.visits.create'))->assertRedirect(route('login'));
});

test('user without visit view permission cannot view visits', function () {
    $user = User::factory()->create();
    $user->assignRole(RoleName::Pharmacist->value);

    $this->actingAs($user)
        ->get(route('registration.visits.index'))
        ->assertForbidden();
});

test('user with registration role can create visit and auto-generate queue', function () {
    $patient = Patient::factory()->create();
    $unit = Unit::factory()->create(['code' => 'POLI-UMUM']);
    $doctor = Doctor::factory()->create();
    $guarantor = Guarantor::factory()->create();

    $response = $this->actingAs($this->staff)
        ->post(route('registration.visits.store'), [
            'patient_id' => $patient->id,
            'unit_id' => $unit->id,
            'doctor_id' => $doctor->id,
            'type' => EncounterType::Outpatient->value,
            'guarantor_id' => $guarantor->id,
            'card_number' => '1234567890',
            'claim_number' => 'SEP-001',
            'notes' => 'Pasien kontrol rutin',
        ]);

    $encounter = Encounter::where('patient_id', $patient->id)->first();
    expect($encounter)->not->toBeNull();
    expect($encounter->status)->toBe(EncounterStatus::Arrived);
    expect($encounter->encounter_number)->toStartWith('ENC-');

    $response->assertRedirect(route('registration.visits.show', $encounter));
    $response->assertSessionHas('success');

    // Assert queue generated
    $queue = Queue::where('encounter_id', $encounter->id)->first();
    expect($queue)->not->toBeNull();
    expect($queue->queue_number)->toBe(1);
    expect($queue->status)->toBe(QueueStatus::Waiting);
    expect($queue->queue_code)->toBe('POLI-001');

    // Assert insurance coverage
    $coverage = $encounter->insuranceCoverage;
    expect($coverage)->not->toBeNull();
    expect($coverage->card_number)->toBe('1234567890');

    // Assert activity log
    $activity = Activity::where('log_name', 'registration')
        ->where('event', 'encounter_created')
        ->first();
    expect($activity)->not->toBeNull();
    expect($activity->causer_id)->toBe($this->staff->id);

    // Assert patient access log
    $accessLog = PatientAccessLog::where('patient_id', $patient->id)
        ->where('action', 'registration')
        ->first();
    expect($accessLog)->not->toBeNull();
});

test('duplicate encounter on same unit and date is rejected without override', function () {
    $patient = Patient::factory()->create();
    $unit = Unit::factory()->create();
    $doctor = Doctor::factory()->create();
    $guarantor = Guarantor::factory()->create();

    // First registration
    Encounter::factory()->create([
        'patient_id' => $patient->id,
        'unit_id' => $unit->id,
        'status' => EncounterStatus::Arrived,
        'arrived_at' => now(),
    ]);

    // Second registration without override
    $this->actingAs($this->staff)
        ->post(route('registration.visits.store'), [
            'patient_id' => $patient->id,
            'unit_id' => $unit->id,
            'doctor_id' => $doctor->id,
            'type' => EncounterType::Outpatient->value,
            'guarantor_id' => $guarantor->id,
            'card_number' => '1234567890',
            'override_duplicate' => false,
        ])
        ->assertSessionHasErrors(['patient_id']);

    // Second registration WITH override succeeds
    $this->actingAs($this->staff)
        ->post(route('registration.visits.store'), [
            'patient_id' => $patient->id,
            'unit_id' => $unit->id,
            'doctor_id' => $doctor->id,
            'type' => EncounterType::Outpatient->value,
            'guarantor_id' => $guarantor->id,
            'card_number' => '1234567890',
            'override_duplicate' => true,
        ])
        ->assertSessionHasNoErrors();
});

test('cannot register visit for inactive or merged patient', function () {
    $mergedTarget = Patient::factory()->create();
    $mergedPatient = Patient::factory()->create([
        'is_active' => false,
        'merged_to_patient_id' => $mergedTarget->id,
    ]);
    $unit = Unit::factory()->create();
    $guarantor = Guarantor::factory()->create();

    $this->actingAs($this->staff)
        ->post(route('registration.visits.store'), [
            'patient_id' => $mergedPatient->id,
            'unit_id' => $unit->id,
            'type' => EncounterType::Outpatient->value,
            'guarantor_id' => $guarantor->id,
        ])
        ->assertSessionHasErrors(['patient_id']);
});

test('visit can be cancelled with valid reason and cancels related queue', function () {
    $encounter = Encounter::factory()->create([
        'status' => EncounterStatus::Arrived,
    ]);
    $queue = Queue::factory()->create([
        'encounter_id' => $encounter->id,
        'unit_id' => $encounter->unit_id,
        'status' => QueueStatus::Waiting,
    ]);

    $response = $this->actingAs($this->staff)
        ->post(route('registration.visits.cancel', $encounter), [
            'cancellation_reason' => 'Pasien berhalangan dan ingin pulang.',
        ]);

    $response->assertSessionHas('success');

    $encounter->refresh();
    expect($encounter->status)->toBe(EncounterStatus::Cancelled);
    expect($encounter->cancellation_reason)->toBe('Pasien berhalangan dan ingin pulang.');
    expect($encounter->cancelled_by)->toBe($this->staff->id);

    $queue->refresh();
    expect($queue->status)->toBe(QueueStatus::Cancelled);
});

test('cannot cancel already finished visit', function () {
    $encounter = Encounter::factory()->finished()->create();

    $this->actingAs($this->staff)
        ->post(route('registration.visits.cancel', $encounter), [
            'cancellation_reason' => 'Ingin batalkan kunjungan yang sudah selesai',
        ])
        ->assertForbidden();
});
