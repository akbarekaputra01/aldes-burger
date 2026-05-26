<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/health', function () {
    try {
        return [
            'status' => 'ok',
            'env' => env('APP_ENV'),
            'app_key' => env('APP_KEY') ? 'exists' : 'missing',
        ];
    } catch (\Throwable $e) {
        return $e->getMessage();
    }
});

// TEMPORARY: Debug route to check registered routes on Vercel - REMOVE AFTER FIX
Route::get('/debug-routes', function () {
    $routes = collect(app('router')->getRoutes()->getRoutes())->map(fn($r) => [
        'uri' => $r->uri(),
        'methods' => $r->methods(),
    ])->values();

    return response()->json([
        'total' => $routes->count(),
        'api_routes_file_exists' => file_exists(base_path('routes/api.php')),
        'base_path' => base_path(),
        'routes_sample' => $routes->take(10),
    ]);
});