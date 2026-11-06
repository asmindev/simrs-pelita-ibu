<?php

use App\Support\PermissionRegistry;
use Database\Seeders\PermissionSeeder;
use Spatie\Permission\Models\Permission;

test('permission seeder creates every registry permission', function () {
    $this->seed(PermissionSeeder::class);

    expect(Permission::count())->toBe(count(PermissionRegistry::all()));

    foreach (PermissionRegistry::all() as $permission) {
        expect(Permission::where('name', $permission)->where('guard_name', 'web')->exists())->toBeTrue();
    }
});

test('permission seeder is idempotent', function () {
    $this->seed(PermissionSeeder::class);
    $this->seed(PermissionSeeder::class);

    expect(Permission::count())->toBe(count(PermissionRegistry::all()));
});
