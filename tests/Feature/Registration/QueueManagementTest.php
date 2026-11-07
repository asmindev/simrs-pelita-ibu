<?php

use App\Enums\EncounterStatus;
use App\Enums\QueueStatus;
use App\Enums\RoleName;
use App\Models\Encounter;
use App\Models\Queue;
use App\Models\Unit;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed([PermissionSeeder::class, RoleSeeder::class]);

    $this->admin = User::factory()->create();
    $this->admin->assignRole(RoleName::Admin->value);

    $this->staff = User::factory()->create();
    $this->staff->assignRole(RoleName::Registration->value);
});

test('guest cannot access queue board or actions', function () {
    $queue = Queue::factory()->create();

    $this->get(route('registration.queues.board'))->assertRedirect(route('login'));
    $this->post(route('registration.queues.call', $queue))->assertRedirect(route('login'));
});

test('user without queue call permission cannot call or update queue', function () {
    $pharmacist = User::factory()->create();
    $pharmacist->assignRole(RoleName::Pharmacist->value);

    $queue = Queue::factory()->create();

    $this->actingAs($pharmacist)
        ->post(route('registration.queues.call', $queue))
        ->assertForbidden();
});

test('queue lifecycle transitions correctly through call, serve, complete', function () {
    $encounter = Encounter::factory()->create([
        'status' => EncounterStatus::Arrived,
    ]);
    $queue = Queue::factory()->create([
        'encounter_id' => $encounter->id,
        'unit_id' => $encounter->unit_id,
        'status' => QueueStatus::Waiting,
    ]);

    // 1. Call queue
    $this->actingAs($this->staff)
        ->post(route('registration.queues.call', $queue))
        ->assertSessionHas('success');

    $queue->refresh();
    expect($queue->status)->toBe(QueueStatus::Calling);
    expect($queue->called_at)->not->toBeNull();
    expect($queue->called_by)->toBe($this->staff->id);

    // 2. Serve queue
    $this->actingAs($this->staff)
        ->post(route('registration.queues.serve', $queue))
        ->assertSessionHas('success');

    $queue->refresh();
    $encounter->refresh();
    expect($queue->status)->toBe(QueueStatus::Serving);
    expect($queue->served_at)->not->toBeNull();
    expect($encounter->status)->toBe(EncounterStatus::InConsultation);
    expect($encounter->consultation_started_at)->not->toBeNull();

    // 3. Complete queue
    $this->actingAs($this->staff)
        ->post(route('registration.queues.complete', $queue))
        ->assertSessionHas('success');

    $queue->refresh();
    $encounter->refresh();
    expect($queue->status)->toBe(QueueStatus::Completed);
    expect($queue->completed_at)->not->toBeNull();
    expect($encounter->status)->toBe(EncounterStatus::Finished);
    expect($encounter->consultation_ended_at)->not->toBeNull();
});

test('queue can be skipped', function () {
    $queue = Queue::factory()->calling()->create();

    $this->actingAs($this->staff)
        ->post(route('registration.queues.skip', $queue))
        ->assertSessionHas('success');

    $queue->refresh();
    expect($queue->status)->toBe(QueueStatus::Skipped);
});

test('queue data json endpoint returns queues for given unit today', function () {
    $unit = Unit::factory()->create();
    $queue1 = Queue::factory()->create([
        'unit_id' => $unit->id,
        'queue_date' => today(),
        'queue_number' => 1,
    ]);
    $queue2 = Queue::factory()->create([
        'unit_id' => $unit->id,
        'queue_date' => today(),
        'queue_number' => 2,
    ]);

    $this->actingAs($this->staff)
        ->getJson(route('registration.queues.data', ['unit_id' => $unit->id]))
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('data.0.id', $queue1->id)
        ->assertJsonPath('data.1.id', $queue2->id);
});
