<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['id' => 1, 'name' => 'Burger'],
            ['id' => 2, 'name' => 'Sides'],
            ['id' => 3, 'name' => 'Drinks'],
        ];

        foreach ($categories as $category) {
            DB::table('categories')->updateOrInsert(
                ['id' => $category['id']],
                [
                    ...$category,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            );
        }
    }
}
