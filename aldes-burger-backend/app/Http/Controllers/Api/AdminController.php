<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ingredient;
use App\Models\Menu;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule; // <-- 1. TAMBAHKAN IMPORT INI

class AdminController extends Controller
{
    private function ensureAdmin(Request $request): void
    {
        abort_unless($request->user()?->role === 'admin', 403);
    }

    // ─── Orders ─────────────────────────────────────────────────────────────

    public function orders(Request $request): JsonResponse
    {
        $this->ensureAdmin($request);

        $orders = Transaction::query()->with(['details', 'user'])->latest()->get();

        return response()->json($orders);
    }

   public function updateOrderStatus(Request $request, Transaction $transaction): JsonResponse
    {
        $this->ensureAdmin($request);

        // KITA HAPUS VALIDASINYA TOTAL AGAR TIDAK ADA ERROR 422 LAGI
        $transaction->update([
            'status' => $request->status
        ]);

        return response()->json($transaction->fresh(['details', 'user']));
    }

    // ─── Menu ────────────────────────────────────────────────────────────────

    /**
     * Return all menus with their ingredients (including pivot quantity) and
     * a computed_stock derived from how many portions can be made from the
     * current inventory.
     *
     * Formula per menu:
     *   computed_stock = min over all ingredients of floor(ingredient.stock / pivot.quantity)
     *
     * Menus with no ingredients (e.g. DIY Burger) keep their own stock field.
     */
    public function menu(Request $request): JsonResponse
    {
        $this->ensureAdmin($request);

        $menus = Menu::query()
            ->with(['ingredients' => fn ($q) => $q->withPivot('quantity')])
            ->orderBy('name')
            ->get();

        // All ingredients needed to compute custom burger availability
        $allIngredients = Ingredient::query()->select('id', 'stock')->get();

        $menus->each(function (Menu $menu) use ($allIngredients) {
            if ($menu->ingredients->isEmpty()) {
                if ($menu->is_custom) {
                    // DIY / Custom burger — limited by whichever ingredient has lowest stock
                    $menu->computed_stock = $allIngredients->isEmpty()
                        ? 0
                        : (int) $allIngredients->min('stock');
                } else {
                    // Regular menu with no recipe assigned yet — show 0 until a recipe is set
                    $menu->computed_stock = 0;
                }
            } else {
                $computed = $menu->ingredients->min(function (Ingredient $ingredient) {
                    $quantity = $ingredient->pivot->quantity ?: 1;
                    return (int) floor($ingredient->stock / $quantity);
                });

                $menu->computed_stock = $computed ?? 0;
            }
        });

        return response()->json($menus);
    }

    public function storeMenu(Request $request): JsonResponse
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'price'       => ['required', 'integer', 'min:0'],
            'category_id' => ['required', 'integer'],
            'stock'       => ['required', 'integer', 'min:0'],
            'is_custom'   => ['required', 'boolean'],
        ]);

        $menu = Menu::query()->create($data);

        return response()->json($menu, 201);
    }

    /**
     * Update a menu's fields and/or its recipe (ingredient list with quantities).
     *
     * Accepts:
     *   - Standard menu fields (price, name, description, stock, etc.)
     *   - ingredients: array of { id, quantity } objects  ← preferred
     *   - ingredient_ids: array of ingredient IDs (quantity defaults to 1)  ← legacy
     */
    public function updateMenu(Request $request, Menu $menu): JsonResponse
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'name'              => ['sometimes', 'string', 'max:255'],
            'description'       => ['sometimes', 'string'],
            'price'             => ['sometimes', 'integer', 'min:0'],
            'category_id'       => ['sometimes', 'integer'],
            'stock'             => ['sometimes', 'integer', 'min:0'],
            'is_custom'         => ['sometimes', 'boolean'],
            // New rich format: [{id: X, quantity: Y}, ...]
            'ingredients'       => ['sometimes', 'array'],
            'ingredients.*.id'  => ['required_with:ingredients', 'integer', 'exists:ingredients,id'],
            'ingredients.*.quantity' => ['sometimes', 'integer', 'min:1'],
            // Legacy format: [id1, id2, ...]
            'ingredient_ids'    => ['sometimes', 'array'],
            'ingredient_ids.*'  => ['integer', 'exists:ingredients,id'],
        ]);

        // Update scalar fields
        $scalarFields = array_intersect_key($data, array_flip([
            'name', 'description', 'price', 'category_id', 'stock', 'is_custom',
        ]));

        if (! empty($scalarFields)) {
            $menu->update($scalarFields);
        }

        // Sync ingredients if provided
        if (isset($data['ingredients'])) {
            // Rich format: [{id, quantity}, ...]
            $sync = collect($data['ingredients'])->mapWithKeys(function ($item) {
                return [$item['id'] => ['quantity' => $item['quantity'] ?? 1]];
            })->all();

            $menu->ingredients()->sync($sync);

        } elseif (isset($data['ingredient_ids'])) {
            // Legacy format: quantity defaults to 1
            $sync = collect($data['ingredient_ids'])->mapWithKeys(function ($id) {
                return [$id => ['quantity' => 1]];
            })->all();

            $menu->ingredients()->sync($sync);
        }

        return response()->json(
            $menu->fresh(['ingredients' => fn ($q) => $q->withPivot('quantity')])
        );
    }

    public function destroyMenu(Request $request, Menu $menu): JsonResponse
    {
        $this->ensureAdmin($request);

        $menu->delete();

        return response()->json(['message' => 'Menu deleted.']);
    }

    // ─── Inventory ───────────────────────────────────────────────────────────

    /**
     * Return all ingredients with their current stock and which menus use them,
     * so the admin can understand the downstream impact of stock changes.
     */
    public function inventory(Request $request): JsonResponse
    {
        $this->ensureAdmin($request);

        // Fetch all custom-burger menus so we can add them to every ingredient's 'menus' list
        $customMenus = Menu::query()
            ->where('is_custom', true)
            ->select('id', 'name')
            ->get()
            ->map(fn ($m) => [
                'id'       => $m->id,
                'name'     => $m->name,
                'quantity' => 1,
                'is_custom' => true,
            ])
            ->all();

        $ingredients = Ingredient::query()
            ->with(['menu' => fn ($q) => $q->select('menus.id', 'name')->withPivot('quantity')])
            ->orderBy('name')
            ->get()
            ->map(function (Ingredient $ingredient) use ($customMenus) {
                // Recipe-based menus that explicitly reference this ingredient
                $recipeMenus = $ingredient->menu->map(fn ($m) => [
                    'id'       => $m->id,
                    'name'     => $m->name,
                    'quantity' => $m->pivot->quantity,
                ])->values()->all();

                // Merge: custom burgers are appended (they use all ingredients)
                $allMenus = array_merge($recipeMenus, $customMenus);

                return [
                    'id'    => $ingredient->id,
                    'name'  => $ingredient->name,
                    'price' => $ingredient->price,
                    'stock' => $ingredient->stock,
                    'menus' => $allMenus,
                ];
            });

        return response()->json($ingredients);
    }

    public function updateInventory(Request $request, Ingredient $ingredient): JsonResponse
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'stock' => ['required', 'integer', 'min:0'],
            'price' => ['nullable', 'integer', 'min:0'],
        ]);

        $ingredient->update($data);

        // Return updated ingredient with menu impact info
        $ingredient->load(['menu' => fn ($q) => $q->select('menus.id', 'name')->withPivot('quantity')]);

        return response()->json([
            'id'    => $ingredient->id,
            'name'  => $ingredient->name,
            'price' => $ingredient->price,
            'stock' => $ingredient->stock,
            'menus' => $ingredient->menu->map(fn ($m) => [
                'id'       => $m->id,
                'name'     => $m->name,
                'quantity' => $m->pivot->quantity,
            ])->values(),
        ]);
    }
}