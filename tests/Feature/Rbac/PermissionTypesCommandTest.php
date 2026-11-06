<?php

use Illuminate\Support\Facades\File;

test('permission type generation writes permission and role unions', function () {
    $path = resource_path('js/types/permissions.d.ts');

    $this->artisan('simrs:permissions', ['--types' => true])->assertSuccessful();

    expect(File::exists($path))->toBeTrue();

    $content = File::get($path);

    expect($content)
        ->toContain('export type PermissionName')
        ->toContain("'master-data.patient.view'")
        ->toContain('export type RoleName')
        ->toContain("'super-admin'");
});
