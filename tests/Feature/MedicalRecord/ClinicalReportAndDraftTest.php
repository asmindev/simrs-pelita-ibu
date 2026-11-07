<?php

use App\Enums\ClinicalReportType;
use App\Enums\DiagnosisType;
use App\Enums\RoleName;
use App\Models\ClinicalReport;
use App\Models\Diagnosis;
use App\Models\Doctor;
use App\Models\Encounter;
use App\Models\Procedure;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed([PermissionSeeder::class, RoleSeeder::class]);

    $this->doctor = User::factory()->create();
    $this->doctor->assignRole(RoleName::Doctor->value);
});

test('adding diagnosis ICD-10 automatically demotes previous primary to secondary', function () {
    $encounter = Encounter::factory()->create();

    $diag1 = Diagnosis::factory()->create([
        'encounter_id' => $encounter->id,
        'patient_id' => $encounter->patient_id,
        'icd10_code' => 'A09',
        'type' => DiagnosisType::Primary,
    ]);

    $response = $this->actingAs($this->doctor)
        ->post(route('medical-record.encounters.diagnoses.store', $encounter), [
            'icd10_code' => 'J00',
            'icd10_name' => 'Acute nasopharyngitis [common cold]',
            'type' => DiagnosisType::Primary->value,
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    expect($diag1->fresh()->type)->toBe(DiagnosisType::Secondary);

    $this->assertDatabaseHas('diagnoses', [
        'encounter_id' => $encounter->id,
        'icd10_code' => 'J00',
        'type' => DiagnosisType::Primary->value,
    ]);
});

test('deleting diagnosis works', function () {
    $diagnosis = Diagnosis::factory()->create();

    $response = $this->actingAs($this->doctor)
        ->delete(route('medical-record.diagnoses.destroy', $diagnosis));

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $this->assertDatabaseMissing('diagnoses', [
        'id' => $diagnosis->id,
    ]);
});

test('adding and deleting procedure works', function () {
    $encounter = Encounter::factory()->create();
    $doctor = Doctor::factory()->create();

    $response = $this->actingAs($this->doctor)
        ->post(route('medical-record.encounters.procedures.store', $encounter), [
            'icd9_code' => '86.59',
            'name' => 'Penjahitan luka robek 5 cm',
            'notes' => 'Luka robek di lengan kiri',
            'performed_by' => $doctor->id,
        ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $procedure = Procedure::where('encounter_id', $encounter->id)->first();
    expect($procedure)->not->toBeNull();
    expect($procedure->name)->toBe('Penjahitan luka robek 5 cm');

    // Delete procedure
    $delResponse = $this->actingAs($this->doctor)
        ->delete(route('medical-record.procedures.destroy', $procedure));

    $delResponse->assertSessionHasNoErrors();
    $this->assertDatabaseMissing('procedures', ['id' => $procedure->id]);
});

test('creating clinical report surgery works and shows', function () {
    $encounter = Encounter::factory()->create();
    $doctor = Doctor::factory()->create();

    $response = $this->actingAs($this->doctor)
        ->post(route('medical-record.encounters.reports.store', $encounter), [
            'report_type' => ClinicalReportType::Surgery->value,
            'title' => 'Laporan Operasi Appendectomy Laparoskopi',
            'content' => 'Tindakan operasi pengangkatan appendix vermiformis berlangsung lancar tanpa komplikasi.',
            'doctor_id' => $doctor->id,
        ]);

    $response->assertSessionHasNoErrors();
    $report = ClinicalReport::where('encounter_id', $encounter->id)->first();
    expect($report)->not->toBeNull();
    $response->assertRedirect(route('medical-record.reports.show', $report));

    $showResponse = $this->actingAs($this->doctor)
        ->get(route('medical-record.reports.show', $report));
    $showResponse->assertOk();
});

test('draft autosave and retrieval works via JSON', function () {
    $encounter = Encounter::factory()->create();

    $storeResponse = $this->actingAs($this->doctor)
        ->postJson(route('medical-record.encounters.drafts.store', $encounter), [
            'form_type' => 'soap',
            'content' => [
                'subjective' => 'Pasien batuk berdahak 3 hari...',
                'objective' => 'Ronki basah halus minimal di basal paru kanan',
            ],
        ]);

    $storeResponse->assertOk();
    $storeResponse->assertJson(['success' => true]);

    $getResponse = $this->actingAs($this->doctor)
        ->getJson(route('medical-record.encounters.drafts.show', [
            'encounter' => $encounter,
            'form_type' => 'soap',
        ]));

    $getResponse->assertOk();
    $getResponse->assertJson([
        'draft' => [
            'subjective' => 'Pasien batuk berdahak 3 hari...',
            'objective' => 'Ronki basah halus minimal di basal paru kanan',
        ],
    ]);
});
