<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => 'admin@aldes.com'],
            [
                'name' => 'Aldes Admin',
                'phone' => null,
                'password' => Hash::make('password'),
                'profile_picture' => null,
                'role' => 'admin',
            ]
        );

        User::query()->updateOrCreate(
            ['email' => 'john.doe@email.com'],
            [
                'name' => 'John Doe',
                'phone' => '+6281234567890',
                'password' => Hash::make('password'),
                'profile_picture' => null,
                'role' => 'customer',
            ]
        );
    }
}
