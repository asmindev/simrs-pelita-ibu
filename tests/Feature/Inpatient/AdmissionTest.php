<?php

use App\Enums\RoleName;
use App\Models\Admission;
use App\Models\Bed;
use App\Models\Doctor;
use App\Models\Encounter;
use App\Models\Patient;
use App\Models\Unit;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed([PermissionSeeder::class, RoleSeeder::class]);
});

test('nurse can view inpatient admissions list', function () {
    $nurse = User::factory()->create();
    $nurse->assignRole(RoleName::Nurse->value);

    Admission::factory()->count(2)->create();

    $response = $this->actingAs($nurse)->get(route('inpatient.admissions.index'));

    $response->assertOk();
});

test('nurse can register a new bed in a room', function () {
    $nurse = User::factory()->create();
    $nurse->assignRole(RoleName::Nurse->value);

    $bedData = [
        'room_name' => 'Bangsal Melati',
        'bed_number' => 'MLT-01',
        'class' => 'class_1',
        'daily_rate' => 350000,
        'notes' => 'Dekat nurse station',
    ];

    $response = $this->actingAs($nurse)->post(route('inpatient.beds.store'), $bedData);

    $response->assertRedirect();
    $this->assertDatabaseHas('beds', [
        'room_name' => 'Bangsal Melati',
        'bed_number' => 'MLT-01',
        'class' => 'class_1',
        'status' => 'available',
        'daily_rate' => 350000,
    ]);
});

test('nurse can admit patient to an available bed', function () {
    $nurse = User::factory()->create();
    $nurse->assignRole(RoleName::Nurse->value);

    $bed = Bed::factory()->create(['status' => 'available']);
    $doctor = Doctor::factory()->create();
    $patient = Patient::factory()->create();
    $unit = Unit::factory()->create();
    $encounter = Encounter::factory()->create([
        'patient_id' => $patient->id,
        'doctor_id' => $doctor->id,
        'unit_id' => $unit->id,
    ]);

    $admissionPayload = [
        'encounter_id' => $encounter->id,
        'bed_id' => $bed->id,
        'initial_diagnosis' => 'Gastroenteritis Akut Dehidrasi Sedang',
    ];

    $response = $this->actingAs($nurse)->post(route('inpatient.admissions.store'), $admissionPayload);

    $response->assertRedirect();

    $this->assertDatabaseHas('admissions', [
        'encounter_id' => $encounter->id,
        'patient_id' => $patient->id,
        'status' => 'active',
        'initial_diagnosis' => 'Gastroenteritis Akut Dehidrasi Sedang',
    ]);

    // Bed must be updated to occupied
    expect($bed->fresh()->status)->toBe('occupied');

    // Bed assignment must exist
    $this->assertDatabaseHas('bed_assignments', [
        'bed_id' => $bed->id,
        'released_at' => null,
    ]);
});

test('cannot admit patient to an already occupied bed', function () {
    $nurse = User::factory()->create();
    $nurse->assignRole(RoleName::Nurse->value);

    $bed = Bed::factory()->create(['status' => 'occupied']);
    $encounter = Encounter::factory()->create();

    $admissionPayload = [
        'encounter_id' => $encounter->id,
        'bed_id' => $bed->id,
        'initial_diagnosis' => 'Demam Tifoid',
    ];

    $response = $this->actingAs($nurse)->post(route('inpatient.admissions.store'), $admissionPayload);

    $response->assertSessionHasErrors(['bed_id']);
});

test('nurse can transfer patient to another available bed', function () {
    $nurse = User::factory()->create();
    $nurse->assignRole(RoleName::Nurse->value);

    $oldBed = Bed::factory()->create(['status' => 'available']);
    $newBed = Bed::factory()->create(['status' => 'available']);

    $doctor = Doctor::factory()->create();
    $patient = Patient::factory()->create();
    $encounter = Encounter::factory()->create([
        'patient_id' => $patient->id,
        'doctor_id' => $doctor->id,
    ]);

    // Admit first
    $this->actingAs($nurse)->post(route('inpatient.admissions.store'), [
        'encounter_id' => $encounter->id,
        'bed_id' => $oldBed->id,
        'initial_diagnosis' => 'Observasi Febris',
    ]);

    $admission = Admission::where('encounter_id', $encounter->id)->firstOrFail();

    // Now transfer to new bed
    $response = $this->actingAs($nurse)->post(
        route('inpatient.admissions.transfer', $admission->id),
        [
            'target_bed_id' => $newBed->id,
            'reason' => 'Upgrade kelas kamar atas permintaan keluarga',
        ]
    );

    $response->assertRedirect();

    // Old bed must be available again
    expect($oldBed->fresh()->status)->toBe('available');

    // New bed must now be occupied
    expect($newBed->fresh()->status)->toBe('occupied');

    // Old assignment has released_at timestamp
    $this->assertDatabaseHas('bed_assignments', [
        'admission_id' => $admission->id,
        'bed_id' => $oldBed->id,
    ]);
    expect($admission->assignments()->where('bed_id', $oldBed->id)->first()->released_at)->not->toBeNull();

    // New assignment is active
    expect($admission->currentAssignment->bed_id)->toBe($newBed->id);
});

test('healthcare worker can record daily CPPT note with vital signs and SOAP', function () {
    $doctorUser = User::factory()->create();
    $doctorUser->assignRole(RoleName::Doctor->value);

    $admission = Admission::factory()->create(['status' => 'active']);

    $notePayload = [
        'note_type' => 'doctor_visit',
        'vital_signs' => [
            'blood_pressure' => '120/80',
            'heart_rate' => '84',
            'respiratory_rate' => '20',
            'temperature' => '36.7',
            'oxygen_saturation' => '99',
        ],
        'subjective' => 'Pasien mengeluh nyeri perut berkurang, mual tidak ada',
        'objective' => 'Abdomen supel, bising usus normal, turgor baik',
        'assessment' => 'GEA perbaikan H-2',
        'plan' => 'Lanjutkan infus RL 20 tpm, diet lunak rendah serat',
    ];

    $response = $this->actingAs($doctorUser)->post(
        route('inpatient.admissions.daily-notes.store', $admission->id),
        $notePayload
    );

    $response->assertRedirect();
    $this->assertDatabaseHas('inpatient_daily_notes', [
        'admission_id' => $admission->id,
        'author_id' => $doctorUser->id,
        'note_type' => 'doctor_visit',
        'subjective' => 'Pasien mengeluh nyeri perut berkurang, mual tidak ada',
    ]);
});

test('doctor can discharge patient and bed is automatically released', function () {
    $doctorUser = User::factory()->create();
    $doctorUser->assignRole(RoleName::Doctor->value);

    $bed = Bed::factory()->create(['status' => 'available']);
    $doctor = Doctor::factory()->create();
    $encounter = Encounter::factory()->create(['doctor_id' => $doctor->id]);

    $nurse = User::factory()->create();
    $nurse->assignRole(RoleName::Nurse->value);

    $this->actingAs($nurse)->post(route('inpatient.admissions.store'), [
        'encounter_id' => $encounter->id,
        'bed_id' => $bed->id,
        'initial_diagnosis' => 'Dengue Fever',
    ]);

    $admission = Admission::where('encounter_id', $encounter->id)->firstOrFail();
    expect($bed->fresh()->status)->toBe('occupied');

    // Doctor discharges patient
    $response = $this->actingAs($doctorUser)->post(
        route('inpatient.admissions.discharge', $admission->id),
        [
            'discharge_diagnosis' => 'Demam Berdarah Dengue derajat 1 Sembuh',
            'discharge_summary' => 'Kondisi umum baik, trombosit 180.000, obat pulang paracetamol prn, kontrol poli 3 hari lagi',
        ]
    );

    $response->assertRedirect();

    $refreshedAdmission = $admission->fresh();
    expect($refreshedAdmission->status)->toBe('discharged');
    expect($refreshedAdmission->discharged_at)->not->toBeNull();
    expect($refreshedAdmission->discharge_diagnosis)->toBe('Demam Berdarah Dengue derajat 1 Sembuh');

    // Bed must be automatically released back to available!
    expect($bed->fresh()->status)->toBe('available');
});
