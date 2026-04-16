<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ReportSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('reports')->insert([
            'user_id' => 1,
            'title' => 'Laporan Penjualan Q1',
            'description' => 'Penjualan custom burger meningkat tajam.',
            'status' => 'Published',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
