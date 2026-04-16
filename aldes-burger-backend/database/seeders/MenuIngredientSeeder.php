<?php

namespace Database\Seeders;

use App\Models\Ingredient;
use App\Models\Menu;
use Illuminate\Database\Seeder;

class MenuIngredientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $recipes = [
            [
                'menu' => ['Chicken Burger', 'Spicy Crispy Chicken'],
                'ingredients' => [
                    ['name' => ['Bun', 'Top Bun'], 'quantity' => 1],
                    ['name' => ['Chicken Patty', 'Crispy Chicken'], 'quantity' => 1],
                    ['name' => ['Lettuce'], 'quantity' => 1],
                    ['name' => ['Tomato'], 'quantity' => 1],
                ],
            ],
            [
                'menu' => ['Beef Burger', 'Beef Burger Deluxe'],
                'ingredients' => [
                    ['name' => ['Bun', 'Top Bun'], 'quantity' => 1],
                    ['name' => ['Beef Patty'], 'quantity' => 1],
                    ['name' => ['Cheese', 'Cheddar Cheese'], 'quantity' => 1],
                    ['name' => ['Onion', 'Caramelized Onion'], 'quantity' => 1],
                ],
            ],
            // DIY Burger / Make Your Own Burger intentionally has no preset ingredients.
            [
                'menu' => ['DIY Burger', 'Make Your Own Burger'],
                'ingredients' => [],
            ],
        ];

        foreach ($recipes as $recipe) {
            $menu = Menu::query()->whereIn('name', $recipe['menu'])->first();

            if (! $menu) {
                continue;
            }

            $menuIngredients = [];

            foreach ($recipe['ingredients'] as $ingredientPreset) {
                $ingredient = Ingredient::query()->whereIn('name', $ingredientPreset['name'])->first();

                if (! $ingredient) {
                    continue;
                }

                $menuIngredients[$ingredient->id] = [
                    'quantity' => $ingredientPreset['quantity'],
                ];
            }

            $menu->ingredients()->sync($menuIngredients);
        }
    }
}
