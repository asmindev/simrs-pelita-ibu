<?php

use App\Enums\RoleName;
use App\Models\Encounter;
use App\Models\Queue;
use App\Models\Unit;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed([PermissionSeeder::class, RoleSeeder::class]);

    $this->superAdmin = User::factory()->create();
    $this->superAdmin->assignRole(RoleName::SuperAdmin->value);

    $this->centralStaff = User::factory()->create();
    $this->centralStaff->assignRole(RoleName::Registration->value);

    $this->unitA = Unit::factory()->create(['name' => 'Poli Umum']);
    $this->unitB = Unit::factory()->create(['name' => 'Poli Gigi']);

    // Staff assigned exclusively to Unit A
    $this->staffUnitA = User::factory()->create();
    $this->staffUnitA->assignRole(RoleName::Registration->value);
    $this->staffUnitA->units()->attach($this->unitA->id, ['is_primary' => true]);
});

test('staff assigned to unit A cannot view encounter from unit B', function () {
    $encounterB = Encounter::factory()->create(['unit_id' => $this->unitB->id]);

    $this->actingAs($this->staffUnitA)
        ->get(route('registration.visits.show', $encounterB))
        ->assertForbidden();

    $this->actingAs($this->centralStaff)
        ->get(route('registration.visits.show', $encounterB))
        ->assertOk();

    $this->actingAs($this->superAdmin)
        ->get(route('registration.visits.show', $encounterB))
        ->assertOk();
});

test('staff assigned to unit A cannot call queue from unit B', function () {
    $queueB = Queue::factory()->create(['unit_id' => $this->unitB->id]);

    $this->actingAs($this->staffUnitA)
        ->post(route('registration.queues.call', $queueB))
        ->assertForbidden();

    $this->actingAs($this->centralStaff)
        ->post(route('registration.queues.call', $queueB))
        ->assertSessionHas('success');
});

test('staff assigned to unit A can view and call queue from unit A', function () {
    $queueA = Queue::factory()->create(['unit_id' => $this->unitA->id]);

    $this->actingAs($this->staffUnitA)
        ->post(route('registration.queues.call', $queueA))
        ->assertSessionHas('success');

    $queueA->refresh();
    expect($queueA->called_by)->toBe($this->staffUnitA->id);
});
