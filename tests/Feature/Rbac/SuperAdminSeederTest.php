<?php

use App\Enums\RoleName;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Database\Seeders\SuperAdminSeeder;
use Illuminate\Support\Facades\Hash;

beforeEach(function () {
    $this->seed([PermissionSeeder::class, RoleSeeder::class]);

    config()->set('simrs.super_admin.name', 'Super Admin');
    config()->set('simrs.super_admin.email', 'superadmin@simrs.test');
    config()->set('simrs.super_admin.password', 'secret-password');
});

test('super admin seeder creates a verified super admin', function () {
    $this->seed(SuperAdminSeeder::class);

    $user = User::query()->where('email', 'superadmin@simrs.test')->firstOrFail();

    expect($user->name)->toBe('Super Admin')
        ->and($user->email_verified_at)->not->toBeNull()
        ->and($user->hasRole(RoleName::SuperAdmin->value))->toBeTrue()
        ->and(Hash::check('secret-password', $user->password))->toBeTrue();
});

test('super admin seeder is idempotent and does not reset the password', function () {
    $this->seed(SuperAdminSeeder::class);

    $user = User::query()->where('email', 'superadmin@simrs.test')->firstOrFail();
    $password = $user->password;

    config()->set('simrs.super_admin.password', 'different-password');

    $this->seed(SuperAdminSeeder::class);

    $user->refresh();

    expect(User::query()->where('email', 'superadmin@simrs.test')->count())->toBe(1)
        ->and($user->password)->toBe($password)
        ->and(Hash::check('secret-password', $user->password))->toBeTrue()
        ->and($user->hasRole(RoleName::SuperAdmin->value))->toBeTrue();
});

test('super admin seeder requires a password in production', function () {
    config()->set('simrs.super_admin.password', null);
    app()->instance('env', 'production');

    expect(fn () => (new SuperAdminSeeder)->run())
        ->toThrow(RuntimeException::class);
});
