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
                'name' => 'Beef Burger - Double Patty',
                'description' => 'Double beef patty burger.',
                'price' => 55000,
                'category_id' => 1,
                'stock' => 100,
                'is_custom' => false,
            ],
            [
                'name' => 'Spicy Crispy Chicken Burger',
                'description' => 'Spicy crispy chicken burger.',
                'price' => 45000,
                'category_id' => 1,
                'stock' => 100,
                'is_custom' => false,
            ],
            [
                'name' => 'Make Your Own Burger',
                'description' => 'Build your own burger exactly the way you want it.',
                'price' => 0,
                'category_id' => 1,
                'stock' => 999,
                'is_custom' => true,
            ],
            [
                'name' => 'French Fries',
                'description' => 'Crispy potato fries.',
                'price' => 25000,
                'category_id' => 2,
                'stock' => 100,
                'is_custom' => false,
            ],
            [
                'name' => 'Nuggets',
                'description' => 'Crispy chicken nuggets.',
                'price' => 30000,
                'category_id' => 2,
                'stock' => 100,
                'is_custom' => false,
            ],
            [
                'name' => 'Onion Rings',
                'description' => 'Crunchy onion rings.',
                'price' => 28000,
                'category_id' => 2,
                'stock' => 100,
                'is_custom' => false,
            ],
            [
                'name' => 'Soft Drink',
                'description' => 'Refreshing soft drink.',
                'price' => 15000,
                'category_id' => 3,
                'stock' => 100,
                'is_custom' => false,
            ],
            [
                'name' => 'Tea',
                'description' => 'Freshly brewed tea.',
                'price' => 12000,
                'category_id' => 3,
                'stock' => 100,
                'is_custom' => false,
            ],
            [
                'name' => 'Water',
                'description' => 'Mineral water.',
                'price' => 10000,
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
