<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $menu = [
            [
                'name' => 'Beef Burger',
                'description' => 'Juicy beef patty with fresh veggies and our special sauce.',
                'price' => 32000,
                'category_id' => 1,
                'stock' => 100,
                'is_custom' => false,
            ],
            [
                'name' => 'Chicken Burger',
                'description' => 'Crispy spiced chicken with fresh veggies and creamy sauce.',
                'price' => 28000,
                'category_id' => 1,
                'stock' => 100,
                'is_custom' => false,
            ],
            [
                'name' => 'Make Your Own Burger',
                'description' => 'Pick your ingredients and build your perfect burger.',
                'price' => 0,
                'category_id' => 1,
                'stock' => 999,
                'is_custom' => true,
            ],
            [
                'name' => 'French Fries',
                'description' => 'Crispy potato fries.',
                'price' => 15000,
                'category_id' => 2,
                'stock' => 100,
                'is_custom' => false,
            ],
            [
                'name' => 'Nuggets',
                'description' => 'Crispy chicken nuggets.',
                'price' => 20000,
                'category_id' => 2,
                'stock' => 100,
                'is_custom' => false,
            ],
            [
                'name' => 'Onion Rings',
                'description' => 'Crunchy onion rings.',
                'price' => 15000,
                'category_id' => 2,
                'stock' => 100,
                'is_custom' => false,
            ],
            [
                'name' => 'Soft Drink',
                'description' => 'Refreshing soft drink.',
                'price' => 10000,
                'category_id' => 3,
                'stock' => 100,
                'is_custom' => false,
            ],
            [
                'name' => 'Tea',
                'description' => 'Freshly brewed tea.',
                'price' => 8000,
                'category_id' => 3,
                'stock' => 100,
                'is_custom' => false,
            ],
            [
                'name' => 'Water',
                'description' => 'Mineral water.',
                'price' => 5000,
                'category_id' => 3,
                'stock' => 100,
                'is_custom' => false,
            ],
        ];

        foreach ($menu as $menu) {
            DB::table('menus')->updateOrInsert(
                [
                    'name' => $menu['name'],
                    'category_id' => $menu['category_id'],
                ],
                [
                    ...$menu,
                    'updated_at' => now(),
                    'created_at' => now(),
                ],
            );
        }
    }
}
