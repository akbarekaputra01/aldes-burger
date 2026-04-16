<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class IngredientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('ingredients')->insert([
            ['name' => 'Beef Patty', 'price' => 15000, 'stock' => 100, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Crispy Chicken', 'price' => 12000, 'stock' => 100, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Cheddar Cheese', 'price' => 5000, 'stock' => 100, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Caramelized Onion', 'price' => 3000, 'stock' => 100, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Lettuce', 'price' => 2000, 'stock' => 100, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Tomato', 'price' => 2000, 'stock' => 100, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Top Bun', 'price' => 0, 'stock' => 100, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Bottom Bun', 'price' => 0, 'stock' => 100, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
