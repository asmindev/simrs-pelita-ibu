<?php

use App\Enums\RoleName;
use App\Models\HospitalSetting;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed([PermissionSeeder::class, RoleSeeder::class]);
});

test('guest cannot access settings page', function () {
    $this->get(route('settings.edit'))->assertRedirect(route('login'));
});

test('user without setting manage permission cannot access settings', function () {
    $doctor = User::factory()->create();
    $doctor->assignRole(RoleName::Doctor->value);

    $this->actingAs($doctor)
        ->get(route('settings.edit'))
        ->assertForbidden();
});

test('admin can view settings page', function () {
    $admin = User::factory()->create();
    $admin->assignRole(RoleName::Admin->value);

    $this->actingAs($admin)
        ->get(route('settings.edit'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/index')
            ->has('setting')
        );
});

test('admin can update hospital settings with logo and favicon', function () {
    Storage::fake('public');

    $admin = User::factory()->create();
    $admin->assignRole(RoleName::Admin->value);

    $logo = UploadedFile::fake()->image('logo.png', 100, 100);
    $favicon = UploadedFile::fake()->image('favicon.png', 32, 32);

    $response = $this->actingAs($admin)->post(route('settings.update'), [
        'app_name' => 'SIMRS Medika Pratama',
        'app_tagline' => 'Solusi Digital Rumah Sakit',
        'hospital_name' => 'RS Medika Pratama',
        'hospital_code' => '7371999',
        'phone' => '0811223344',
        'email' => 'admin@medikana.com',
        'city' => 'Makassar',
        'logo' => $logo,
        'favicon' => $favicon,
    ]);

    $response->assertSessionHasNoErrors()->assertRedirect();

    $setting = HospitalSetting::instance();
    expect($setting->app_name)->toBe('SIMRS Medika Pratama')
        ->and($setting->hospital_name)->toBe('RS Medika Pratama')
        ->and($setting->logo_path)->not->toBeNull()
        ->and($setting->favicon_path)->not->toBeNull();

    Storage::disk('public')->assertExists($setting->logo_path);
    Storage::disk('public')->assertExists($setting->favicon_path);
});
