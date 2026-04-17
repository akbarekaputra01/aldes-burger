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
        DB::table('menus')->insert([
            [
                'name' => 'Beef Burger Deluxe',
                'description' => 'Premium beef patty, cheese, and our house special sauce.',
                'price' => 55000,
                'category_id' => 1,
                'stock' => 50,
                'is_custom' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Spicy Crispy Chicken',
                'description' => 'Spicy crispy chicken, fresh lettuce, and creamy mayo.',
                'price' => 45000,
                'category_id' => 1,
                'stock' => 30,
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
        ]);
    }
}
