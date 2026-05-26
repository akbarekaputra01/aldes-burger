<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Menu; 
use App\Models\Ingredient;

class MenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $menus = [
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

        foreach ($menus as $menuData) {
            DB::table('menus')->updateOrInsert(
                [
                    'name' => $menuData['name'],
                    'category_id' => $menuData['category_id'],
                ],
                array_merge($menuData, [
                    'updated_at' => now(),
                    'created_at' => now(),
                ])
            );
        }

        // --- RELASI INGREDIENTS DIBUAT DINAMIS & ANTI GAGAL ---
        
        $beefBurger = Menu::where('name', 'Beef Burger')->first();
        $chickenBurger = Menu::where('name', 'Chicken Burger')->first();

        // Helper function: Cari ID bahan, kalau tidak ada, langsung buatkan otomatis!
        $getIngredientId = function($name, $price) {
            $ingredient = Ingredient::where('name', 'like', "%{$name}%")->first();
            
            if (!$ingredient) {
                return DB::table('ingredients')->insertGetId([
                    'name' => $name,
                    'price' => $price,
                    'stock' => 100,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
            
            return $ingredient->id;
        };

        // Pastikan semua bahan terdaftar dan dapatkan ID-nya
        $bottomBun = $getIngredientId('Bottom Bun', 3000);
        $topBun    = $getIngredientId('Top Bun', 3000);
        $beef      = $getIngredientId('Beef Patty', 16000);
        $chicken   = $getIngredientId('Crispy Chicken', 12000);
        $cheese    = $getIngredientId('Cheddar Cheese', 4000);
        $lettuce   = $getIngredientId('Lettuce', 2000);
        $tomato    = $getIngredientId('Tomato', 2000);
        $pickles   = $getIngredientId('Pickles', 2000);

        // Susun burger tanpa menggunakan array_filter karena ID dipastikan 100% ada
        if ($beefBurger) {
            $beefBurger->ingredients()->sync([$bottomBun, $beef, $cheese, $lettuce, $tomato, $pickles, $topBun]);
        }

        if ($chickenBurger) {
            $chickenBurger->ingredients()->sync([$bottomBun, $chicken, $cheese, $lettuce, $tomato, $pickles, $topBun]);
        }
    }
}