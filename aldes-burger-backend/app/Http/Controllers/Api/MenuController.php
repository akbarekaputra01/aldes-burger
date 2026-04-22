<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use Illuminate\Http\JsonResponse;

class MenuController extends Controller
{
    public function index(): JsonResponse
    {
        $menu = Menu::query()
            ->with(['ingredients' => fn ($query) => $query->select('ingredients.id', 'name', 'price', 'stock')])
            ->orderByRaw("CASE WHEN is_custom = 1 THEN 1 WHEN LOWER(name) LIKE '%beef%' THEN 0 ELSE 2 END")
            ->orderBy('name')
            ->get();

        return response()->json($menu);
    }
}
