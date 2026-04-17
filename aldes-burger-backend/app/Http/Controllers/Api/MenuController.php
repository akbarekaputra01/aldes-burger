<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use Illuminate\Http\JsonResponse;

class MenuController extends Controller
{
    public function index(): JsonResponse
    {
        $menus = Menu::query()
            ->with(['ingredients' => fn ($query) => $query->select('ingredients.id', 'name', 'price', 'stock')])
            ->orderBy('name')
            ->get();

        return response()->json($menus);
    }
}
