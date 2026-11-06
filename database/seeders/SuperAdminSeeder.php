<?php

namespace Database\Seeders;

use App\Enums\RoleName;
use App\Models\User;
use Illuminate\Database\Seeder;
use RuntimeException;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $name = (string) config('simrs.super_admin.name');
        $email = (string) config('simrs.super_admin.email');
        $password = config('simrs.super_admin.password');

        if (blank($password)) {
            if (app()->environment('production')) {
                throw new RuntimeException('SUPER_ADMIN_PASSWORD wajib diisi untuk membuat super admin.');
            }

            $password = 'password';
        }

        $user = User::query()->firstOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => $password,
                'email_verified_at' => now(),
            ],
        );

        $user->forceFill([
            'name' => $name,
            'email_verified_at' => $user->email_verified_at ?? now(),
        ])->save();

        $user->syncRoles([RoleName::SuperAdmin->value]);
    }
}
