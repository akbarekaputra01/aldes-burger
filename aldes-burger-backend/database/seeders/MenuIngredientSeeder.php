<?php

namespace Database\Seeders;

use App\Models\Ingredient;
use App\Models\Menu;
use Illuminate\Database\Seeder;

class MenuIngredientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Each burger gets:
     *   - 1× Top Bun, 1× Bottom Bun (structure)
     *   - Protein specific to that burger
     *   - Toppings specific to that burger
     *   - 1× Mayonnaise, 1× Ketchup, 1× Secret Sauce (all burgers)
     */
    public function run(): void
    {
        // Sauces shared by ALL burgers
        $sharedSauces = [
            ['name' => ['Mayonnaise'],   'quantity' => 1],
            ['name' => ['Ketchup'],      'quantity' => 1],
            ['name' => ['Secret Sauce'], 'quantity' => 1],
        ];

        $recipes = [
            [
                'menu' => ['Chicken Burger'],
                'ingredients' => [
                    ['name' => ['Top Bun'],       'quantity' => 1],
                    ['name' => ['Bottom Bun'],     'quantity' => 1],
                    ['name' => ['Crispy Chicken'], 'quantity' => 1],
                    ['name' => ['Lettuce'],        'quantity' => 1],
                    ['name' => ['Tomato'],         'quantity' => 1],
                    ...$sharedSauces,
                ],
            ],
            [
                'menu' => ['Beef Burger'],
                'ingredients' => [
                    ['name' => ['Top Bun'],        'quantity' => 1],
                    ['name' => ['Bottom Bun'],      'quantity' => 1],
                    ['name' => ['Beef Patty'],      'quantity' => 1],
                    ['name' => ['Cheddar Cheese'],  'quantity' => 1],
                    ['name' => ['Pickles'],         'quantity' => 1],
                    ...$sharedSauces,
                ],
            ],
            // DIY Burger intentionally has no preset ingredients.
            [
                'menu' => ['Make Your Own Burger', 'DIY Burger'],
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
                $ingredient = Ingredient::query()
                    ->whereIn('name', $ingredientPreset['name'])
                    ->first();

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
