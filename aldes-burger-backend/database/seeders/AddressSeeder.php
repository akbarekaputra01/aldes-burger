<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AddressSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('addresses')->insert([
            [
                'user_id' => 2,
                'address' => 'Rumah - Jl. Sudirman No. 123, Jakarta Selatan',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 2,
                'address' => 'Kantor - Wisma Aldes, Lt. 10, Kuningan',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
