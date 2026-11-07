<?php

use App\Enums\Permissions\MedicalRecordPermission;
use App\Enums\RoleName;
use App\Enums\SensitiveCategory;
use App\Models\BreakGlassGrant;
use App\Models\Encounter;
use App\Models\SensitiveNote;
use App\Models\User;
use App\Services\MedicalRecordService;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed([PermissionSeeder::class, RoleSeeder::class]);

    $this->doctor = User::factory()->create();
    $this->doctor->assignRole(RoleName::Doctor->value);

    $this->staff = User::factory()->create();
    $this->staff->assignRole(RoleName::Registration->value);
});

test('sensitive notes are strictly omitted from EMR payload when user has no permission and no break glass', function () {
    $encounter = Encounter::factory()->create();
    $note = SensitiveNote::factory()->create([
        'encounter_id' => $encounter->id,
        'patient_id' => $encounter->patient_id,
        'category' => SensitiveCategory::Hiv,
        'content' => 'Pasien terkonfirmasi HIV stadium 1.',
    ]);

    // Staff has EncounterView (via Registration role) or let's give registration staff view permission
    $userWithoutPermission = User::factory()->create();
    $userWithoutPermission->givePermissionTo(MedicalRecordPermission::EncounterView->value);

    $service = app(MedicalRecordService::class);
    $data = $service->getEncounterWithEmr($encounter, $userWithoutPermission);

    expect(array_key_exists('sensitive_notes', $data))->toBeFalse();
    expect($data['can_view_sensitive'])->toBeFalse();
});

test('sensitive notes are included when break glass grant is active for the user and patient', function () {
    $encounter = Encounter::factory()->create();
    $note = SensitiveNote::factory()->create([
        'encounter_id' => $encounter->id,
        'patient_id' => $encounter->patient_id,
        'category' => SensitiveCategory::Psychiatry,
        'content' => 'Riwayat depresi mayor dengan percobaan bunuh diri.',
    ]);

    $userWithoutDirectPermission = User::factory()->create();
    $userWithoutDirectPermission->givePermissionTo(MedicalRecordPermission::EncounterView->value);

    // Create active break glass grant
    BreakGlassGrant::create([
        'user_id' => $userWithoutDirectPermission->id,
        'patient_id' => $encounter->patient_id,
        'reason' => 'Kondisi kegawatdaruratan di ruang operasi',
        'justification' => 'Memerlukan riwayat psikiatri dan obat penenang darurat',
        'granted_at' => now(),
        'expires_at' => now()->addHours(2),
    ]);

    $service = app(MedicalRecordService::class);
    $data = $service->getEncounterWithEmr($encounter, $userWithoutDirectPermission);

    expect(array_key_exists('sensitive_notes', $data))->toBeTrue();
    expect($data['sensitive_notes'])->toHaveCount(1);
    expect($data['sensitive_notes'][0]['content'])->toBe('Riwayat depresi mayor dengan percobaan bunuh diri.');
    expect($data['can_view_sensitive'])->toBeTrue();
});

test('sensitive notes are included when user has direct permission', function () {
    $encounter = Encounter::factory()->create();
    $note = SensitiveNote::factory()->create([
        'encounter_id' => $encounter->id,
        'patient_id' => $encounter->patient_id,
        'category' => SensitiveCategory::SubstanceUse,
        'content' => 'Riwayat ketergantungan opioid.',
    ]);

    $service = app(MedicalRecordService::class);
    $data = $service->getEncounterWithEmr($encounter, $this->doctor);

    expect(array_key_exists('sensitive_notes', $data))->toBeTrue();
    expect($data['sensitive_notes'])->toHaveCount(1);
    expect($data['can_view_sensitive'])->toBeTrue();
});

test('storing a sensitive note creates database record and patient access log', function () {
    $encounter = Encounter::factory()->create();

    $response = $this->actingAs($this->doctor)
        ->post(route('medical-record.encounters.sensitive-notes.store', $encounter), [
            'category' => SensitiveCategory::Psychiatry->value,
            'content' => 'Pasien mengalami halusinasi auditorik berulang.',
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $this->assertDatabaseHas('sensitive_notes', [
        'encounter_id' => $encounter->id,
        'category' => SensitiveCategory::Psychiatry->value,
        'content' => 'Pasien mengalami halusinasi auditorik berulang.',
        'created_by' => $this->doctor->id,
    ]);

    $this->assertDatabaseHas('patient_access_logs', [
        'user_id' => $this->doctor->id,
        'patient_id' => $encounter->patient_id,
        'action' => 'add_sensitive_note',
    ]);
});
