<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\IngredientController;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\TransactionController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/menus', [MenuController::class, 'index']);
Route::get('/ingredients', [IngredientController::class, 'index']);

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/addresses', [CheckoutController::class, 'addresses']);
    Route::post('/checkout', [CheckoutController::class, 'store']);

    Route::get('/transactions', [TransactionController::class, 'index']);
    Route::get('/transactions/{transaction}', [TransactionController::class, 'show']);

    Route::prefix('/admin')->group(function (): void {
        Route::get('/orders', [AdminController::class, 'orders']);
        Route::patch('/orders/{transaction}/status', [AdminController::class, 'updateOrderStatus']);

        Route::get('/menus', [AdminController::class, 'menus']);
        Route::post('/menus', [AdminController::class, 'storeMenu']);
        Route::put('/menus/{menu}', [AdminController::class, 'updateMenu']);
        Route::delete('/menus/{menu}', [AdminController::class, 'destroyMenu']);

        Route::get('/inventory', [AdminController::class, 'inventory']);
        Route::patch('/inventory/{ingredient}', [AdminController::class, 'updateInventory']);
    });
});
