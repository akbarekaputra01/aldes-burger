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
        $ingredients = [
            ['name' => 'Beef Patty',    'price' => 16000, 'stock' => 100],
            ['name' => 'Crispy Chicken','price' => 12000, 'stock' => 100],
            ['name' => 'Cheddar Cheese','price' => 4000,  'stock' => 100],
            ['name' => 'Pickles',       'price' => 2000,  'stock' => 100],
            ['name' => 'Lettuce',       'price' => 2000,  'stock' => 100],
            ['name' => 'Tomato',        'price' => 2000,  'stock' => 100],
            ['name' => 'Top Bun',       'price' => 3000,  'stock' => 100],
            ['name' => 'Bottom Bun',    'price' => 3000,  'stock' => 100],
            ['name' => 'Mayonnaise',    'price' => 1500,  'stock' => 200],
            ['name' => 'Ketchup',       'price' => 1000,  'stock' => 200],
            ['name' => 'Secret Sauce',  'price' => 2000,  'stock' => 200],
        ];

        foreach ($ingredients as $ingredient) {
            DB::table('ingredients')->updateOrInsert(
                ['name' => $ingredient['name']],
                [
                    ...$ingredient,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            );
        }
    }
}
