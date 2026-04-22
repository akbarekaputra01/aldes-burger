<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ingredient;
use App\Models\Menu;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    private function ensureAdmin(Request $request): void
    {
        abort_unless($request->user()?->role === 'admin', 403);
    }

    public function orders(Request $request): JsonResponse
    {
        $this->ensureAdmin($request);

        $orders = Transaction::query()->with(['details', 'user'])->latest()->get();

        return response()->json($orders);
    }

    public function updateOrderStatus(Request $request, Transaction $transaction): JsonResponse
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'status' => ['required', 'in:pending,cooking,done'],
        ]);

        $transaction->update($data);

        return response()->json($transaction->fresh(['details', 'user']));
    }

    public function menu(Request $request): JsonResponse
    {
        $this->ensureAdmin($request);

        return response()->json(Menu::query()->with('ingredients')->orderBy('name')->get());
    }

    public function storeMenu(Request $request): JsonResponse
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'price' => ['required', 'integer', 'min:0'],
            'category_id' => ['required', 'integer'],
            'stock' => ['required', 'integer', 'min:0'],
            'is_custom' => ['required', 'boolean'],
        ]);

        $menu = Menu::query()->create($data);

        return response()->json($menu, 201);
    }

    public function updateMenu(Request $request, Menu $menu): JsonResponse
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'string'],
            'price' => ['sometimes', 'integer', 'min:0'],
            'category_id' => ['sometimes', 'integer'],
            'stock' => ['sometimes', 'integer', 'min:0'],
            'is_custom' => ['sometimes', 'boolean'],
        ]);

        $menu->update($data);

        return response()->json($menu->fresh('ingredients'));
    }

    public function destroyMenu(Request $request, Menu $menu): JsonResponse
    {
        $this->ensureAdmin($request);

        $menu->delete();

        return response()->json(['message' => 'Menu deleted.']);
    }

    public function inventory(Request $request): JsonResponse
    {
        $this->ensureAdmin($request);

        return response()->json(Ingredient::query()->orderBy('name')->get());
    }

    public function updateInventory(Request $request, Ingredient $ingredient): JsonResponse
    {
        $this->ensureAdmin($request);

        $data = $request->validate([
            'stock' => ['required', 'integer', 'min:0'],
            'price' => ['nullable', 'integer', 'min:0'],
        ]);

        $ingredient->update($data);

        return response()->json($ingredient);
    }
}
