<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PaymentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('payments')->insert([
            ['method' => 'Midtrans - QRIS', 'created_at' => now(), 'updated_at' => now()],
            ['method' => 'Midtrans - BCA Virtual Account', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
