<?php

use App\Enums\RoleName;
use App\Models\Doctor;
use App\Models\DoctorSchedule;
use App\Models\Unit;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed([PermissionSeeder::class, RoleSeeder::class]);

    $this->admin = User::factory()->create();
    $this->admin->assignRole(RoleName::Admin->value);

    $this->doctor = Doctor::factory()->create();
    $this->unit = Unit::factory()->create();
});

test('doctor edit page includes schedules and active units', function () {
    $schedule = DoctorSchedule::factory()->create([
        'doctor_id' => $this->doctor->id,
        'unit_id' => $this->unit->id,
    ]);

    $this->actingAs($this->admin)
        ->get(route('master-data.doctors.edit', $this->doctor))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('master-data/doctor/edit/index')
            ->has('schedules', 1)
            ->where('schedules.0.id', $schedule->id)
            ->has('units', 1)
            ->where('units.0.id', $this->unit->id));
});

test('doctor schedule can be created and is recorded in activity log', function () {
    $this->actingAs($this->admin)
        ->from(route('master-data.doctors.edit', $this->doctor))
        ->post(route('master-data.doctors.schedules.store', $this->doctor), [
            'unit_id' => $this->unit->id,
            'day_of_week' => 1,
            'start_time' => '08:00',
            'end_time' => '12:00',
            'quota' => 20,
        ])
        ->assertRedirect(route('master-data.doctors.edit', $this->doctor))
        ->assertSessionHas('success');

    $schedule = DoctorSchedule::query()->sole();

    $this->assertDatabaseHas('doctor_schedules', [
        'id' => $schedule->id,
        'doctor_id' => $this->doctor->id,
        'unit_id' => $this->unit->id,
        'day_of_week' => 1,
        'quota' => 20,
    ]);
    $this->assertDatabaseHas('activity_log', [
        'log_name' => 'master-data',
        'event' => 'created',
        'subject_type' => DoctorSchedule::class,
        'subject_id' => $schedule->id,
    ]);
});

test('doctor schedule rejects overlap, invalid time, and inactive unit', function () {
    DoctorSchedule::factory()->create([
        'doctor_id' => $this->doctor->id,
        'unit_id' => $this->unit->id,
        'day_of_week' => 1,
        'start_time' => '08:00',
        'end_time' => '12:00',
    ]);
    $inactiveUnit = Unit::factory()->inactive()->create();

    $this->actingAs($this->admin)
        ->post(route('master-data.doctors.schedules.store', $this->doctor), [
            'unit_id' => $this->unit->id,
            'day_of_week' => 1,
            'start_time' => '09:00',
            'end_time' => '10:00',
        ])
        ->assertSessionHasErrors('start_time');

    $this->actingAs($this->admin)
        ->post(route('master-data.doctors.schedules.store', $this->doctor), [
            'unit_id' => $this->unit->id,
            'day_of_week' => 2,
            'start_time' => '12:00',
            'end_time' => '08:00',
        ])
        ->assertSessionHasErrors('end_time');

    $this->actingAs($this->admin)
        ->post(route('master-data.doctors.schedules.store', $this->doctor), [
            'unit_id' => $inactiveUnit->id,
            'day_of_week' => 2,
            'start_time' => '08:00',
            'end_time' => '12:00',
        ])
        ->assertSessionHasErrors('unit_id');
});

test('doctor schedule can be deleted and is recorded in activity log', function () {
    $schedule = DoctorSchedule::factory()->create([
        'doctor_id' => $this->doctor->id,
        'unit_id' => $this->unit->id,
    ]);

    $this->actingAs($this->admin)
        ->from(route('master-data.doctors.edit', $this->doctor))
        ->delete(route('master-data.doctors.schedules.destroy', [
            'doctor' => $this->doctor,
            'schedule' => $schedule,
        ]))
        ->assertRedirect(route('master-data.doctors.edit', $this->doctor))
        ->assertSessionHas('success');

    $this->assertDatabaseMissing('doctor_schedules', ['id' => $schedule->id]);
    $this->assertDatabaseHas('activity_log', [
        'log_name' => 'master-data',
        'event' => 'deleted',
        'subject_type' => DoctorSchedule::class,
        'subject_id' => $schedule->id,
    ]);
});

test('doctor schedule management requires manage permission', function () {
    $user = User::factory()->create();
    $user->assignRole(RoleName::Doctor->value);

    $this->actingAs($user)
        ->post(route('master-data.doctors.schedules.store', $this->doctor), [
            'unit_id' => $this->unit->id,
            'day_of_week' => 1,
            'start_time' => '08:00',
            'end_time' => '12:00',
        ])
        ->assertForbidden();
});

test('doctor schedule cannot be deleted through another doctor', function () {
    $otherDoctor = Doctor::factory()->create();
    $schedule = DoctorSchedule::factory()->create([
        'doctor_id' => $otherDoctor->id,
        'unit_id' => $this->unit->id,
    ]);

    $this->actingAs($this->admin)
        ->delete(route('master-data.doctors.schedules.destroy', [
            'doctor' => $this->doctor,
            'schedule' => $schedule,
        ]))
        ->assertNotFound();
});
