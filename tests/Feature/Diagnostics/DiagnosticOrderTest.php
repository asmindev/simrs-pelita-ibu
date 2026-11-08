<?php

use App\Enums\RoleName;
use App\Models\DiagnosticOrder;
use App\Models\DiagnosticOrderItem;
use App\Models\Doctor;
use App\Models\Encounter;
use App\Models\Patient;
use App\Models\Unit;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->seed([PermissionSeeder::class, RoleSeeder::class]);
});

test('authorized user can view diagnostics orders list', function () {
    $analyst = User::factory()->create();
    $analyst->assignRole(RoleName::LabAnalyst->value);

    DiagnosticOrder::factory()->count(3)->create();

    $response = $this->actingAs($analyst)->get(route('diagnostics.orders.index'));

    $response->assertOk();
});

test('doctor can create laboratory diagnostic order with items', function () {
    $doctorUser = User::factory()->create();
    $doctorUser->assignRole(RoleName::Doctor->value);

    $patient = Patient::factory()->create();
    $doctor = Doctor::factory()->create();
    $unit = Unit::factory()->create();
    $encounter = Encounter::factory()->create([
        'patient_id' => $patient->id,
        'doctor_id' => $doctor->id,
        'unit_id' => $unit->id,
    ]);

    $orderData = [
        'encounter_id' => $encounter->id,
        'type' => 'laboratory',
        'clinical_notes' => 'Suspek DBD demam hari ke-3',
        'items' => [
            ['test_name' => 'Darah Lengkap (CBC)', 'notes' => 'Cek leukosit & trombosit'],
            ['test_name' => 'NS1 Antigen Dengue', 'notes' => 'Cito'],
        ],
    ];

    $response = $this->actingAs($doctorUser)->post(route('diagnostics.orders.store'), $orderData);

    $response->assertRedirect();
    $this->assertDatabaseHas('diagnostic_orders', [
        'encounter_id' => $encounter->id,
        'patient_id' => $patient->id,
        'type' => 'laboratory',
        'status' => 'ordered',
        'clinical_notes' => 'Suspek DBD demam hari ke-3',
    ]);

    $this->assertDatabaseHas('diagnostic_order_items', [
        'test_name' => 'Darah Lengkap (CBC)',
    ]);
    $this->assertDatabaseHas('diagnostic_order_items', [
        'test_name' => 'NS1 Antigen Dengue',
    ]);
});

test('lab analyst can input test results with parameters and reference range', function () {
    $analyst = User::factory()->create();
    $analyst->assignRole(RoleName::LabAnalyst->value);

    $order = DiagnosticOrder::factory()->create(['type' => 'laboratory', 'status' => 'ordered']);
    $item = DiagnosticOrderItem::factory()->create([
        'diagnostic_order_id' => $order->id,
        'test_name' => 'Hemoglobin',
    ]);

    $payload = [
        'diagnostic_order_item_id' => $item->id,
        'parameter_name' => 'Hb',
        'result_value' => '13.5',
        'unit' => 'g/dL',
        'reference_range' => '12.0 - 16.0',
        'is_critical' => false,
        'interpretation' => 'Hasil normal dalam batas rujukan',
    ];

    $response = $this->actingAs($analyst)->post(
        route('diagnostics.orders.results.store', $order->id),
        $payload
    );

    $response->assertRedirect();
    $this->assertDatabaseHas('diagnostic_results', [
        'diagnostic_order_id' => $order->id,
        'diagnostic_order_item_id' => $item->id,
        'parameter_name' => 'Hb',
        'result_value' => '13.5',
        'is_critical' => false,
    ]);

    // Order status should automatically transition to in_progress
    expect($order->fresh()->status)->toBe('in_progress');
});

test('radiographer can input result with attachment file upload', function () {
    Storage::fake('public');

    $radiographer = User::factory()->create();
    $radiographer->assignRole(RoleName::Radiographer->value);

    $order = DiagnosticOrder::factory()->create(['type' => 'radiology', 'status' => 'ordered']);
    $item = DiagnosticOrderItem::factory()->create([
        'diagnostic_order_id' => $order->id,
        'test_name' => 'Thorax PA',
    ]);

    $file = UploadedFile::fake()->image('thorax_scan.png');

    $payload = [
        'diagnostic_order_item_id' => $item->id,
        'parameter_name' => 'Rontgen Thorax',
        'result_value' => 'Normal Cor dan Pulmo',
        'unit' => null,
        'reference_range' => null,
        'is_critical' => false,
        'interpretation' => 'Kesan: Cor dan pulmo dalam batas normal, tidak tampak infiltrat aktif.',
        'attachment' => $file,
    ];

    $response = $this->actingAs($radiographer)->post(
        route('diagnostics.orders.results.store', $order->id),
        $payload
    );

    $response->assertRedirect();

    $result = $order->results()->first();
    expect($result)->not->toBeNull();
    expect($result->attachment_path)->not->toBeNull();
    Storage::disk('public')->assertExists($result->attachment_path);
});

test('critical value result sets critical flag on order and result', function () {
    $analyst = User::factory()->create();
    $analyst->assignRole(RoleName::LabAnalyst->value);

    $order = DiagnosticOrder::factory()->create(['type' => 'laboratory', 'status' => 'ordered']);
    $item = DiagnosticOrderItem::factory()->create([
        'diagnostic_order_id' => $order->id,
        'test_name' => 'Kalium Darah',
    ]);

    $payload = [
        'diagnostic_order_item_id' => $item->id,
        'parameter_name' => 'Kalium (K+)',
        'result_value' => '2.1', // Severely hypokalemic
        'unit' => 'mEq/L',
        'reference_range' => '3.5 - 5.0',
        'is_critical' => true,
        'interpretation' => 'NILAI KRITIS: Hipokalemia berat, segera laporkan DPJP',
    ];

    $response = $this->actingAs($analyst)->post(
        route('diagnostics.orders.results.store', $order->id),
        $payload
    );

    $response->assertRedirect();
    $this->assertDatabaseHas('diagnostic_results', [
        'diagnostic_order_id' => $order->id,
        'is_critical' => true,
    ]);
});

test('authorized user can complete order after examination', function () {
    $analyst = User::factory()->create();
    $analyst->assignRole(RoleName::LabAnalyst->value);

    $order = DiagnosticOrder::factory()->create(['type' => 'laboratory', 'status' => 'in_progress']);

    $response = $this->actingAs($analyst)->post(route('diagnostics.orders.complete', $order->id));

    $response->assertRedirect();
    $refreshed = $order->fresh();
    expect($refreshed->status)->toBe('completed');
    expect($refreshed->completed_at)->not->toBeNull();
    expect($refreshed->completed_by)->toBe($analyst->id);
});
