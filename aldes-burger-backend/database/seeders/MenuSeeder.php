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
        DB::table('menus')->truncate();

        DB::table('menus')->insert([
            [
                'name' => 'Beef Burger - Double Patty',
                'description' => 'Double beef patty burger.',
                'price' => 55000,
                'category_id' => 1,
                'stock' => 100,
                'is_custom' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Spicy Crispy Chicken Burger',
                'description' => 'Spicy crispy chicken burger.',
                'price' => 45000,
                'category_id' => 1,
                'stock' => 100,
                'is_custom' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Make Your Own Burger',
                'description' => 'Build your own burger exactly the way you want it.',
                'price' => 0,
                'category_id' => 1,
                'stock' => 999,
                'is_custom' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'French Fries',
                'description' => 'Crispy potato fries.',
                'price' => 25000,
                'category_id' => 2,
                'stock' => 100,
                'is_custom' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Nuggets',
                'description' => 'Crispy chicken nuggets.',
                'price' => 30000,
                'category_id' => 2,
                'stock' => 100,
                'is_custom' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Onion Rings',
                'description' => 'Crunchy onion rings.',
                'price' => 28000,
                'category_id' => 2,
                'stock' => 100,
                'is_custom' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Soft Drink',
                'description' => 'Refreshing soft drink.',
                'price' => 15000,
                'category_id' => 3,
                'stock' => 100,
                'is_custom' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Tea',
                'description' => 'Freshly brewed tea.',
                'price' => 12000,
                'category_id' => 3,
                'stock' => 100,
                'is_custom' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Water',
                'description' => 'Mineral water.',
                'price' => 10000,
                'category_id' => 3,
                'stock' => 100,
                'is_custom' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
