<?php

use App\Support\PermissionRegistry;

test('permission registry values are unique and well formed', function () {
    $permissions = PermissionRegistry::all();

    expect($permissions)->not->toBeEmpty()
        ->and($permissions)->toBe(array_values(array_unique($permissions)));

    foreach ($permissions as $permission) {
        expect($permission)->toMatch('/^[a-z][a-z-]*\.[a-z][a-z-]*\.[a-z][a-z-]*$/');
    }
});

test('permission registry groups permissions by domain', function () {
    $domains = PermissionRegistry::byDomain();

    expect(array_keys($domains))->toBe([
        'master-data',
        'registration',
        'medical-record',
        'pharmacy',
        'cashier',
        'diagnostics',
        'inpatient',
        'rbac',
        'audit',
    ]);

    foreach ($domains as $domain => $permissions) {
        foreach ($permissions as $permission) {
            expect($permission)->toStartWith($domain.'.');
        }
    }
});
