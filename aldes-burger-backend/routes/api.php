<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\IngredientController;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\TransactionController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MidtransController;

// Endpoint Autentikasi Publik
Route::post('/register', [AuthController::class, 'register']);
Route::post('/verify-otp', [AuthController::class, 'verifyRegisterOtp']); // Route verifikasi registrasi baru
Route::post('/login', [AuthController::class, 'login']);

// Endpoint Lupa Password
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']); // Request OTP
Route::post('/reset-password', [AuthController::class, 'resetPasswordWithOtp']); // Submit OTP & Password Baru

Route::get('/menus', [MenuController::class, 'index']);
Route::get('/ingredients', [IngredientController::class, 'index']);

Route::post('/midtrans/callback', [MidtransController::class, 'callback']);
// Endpoint yang membutuhkan Token (Login)
Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/user/password', [AuthController::class, 'updatePassword']); // Ubah password dari dalam aplikasi (pakai old password)
    
    Route::get('/addresses', [CheckoutController::class, 'addresses']);
    Route::post('/addresses', [CheckoutController::class, 'storeAddress']);
    Route::put('/addresses/{address}', [CheckoutController::class, 'updateAddress']);
    Route::delete('/addresses/{address}', [CheckoutController::class, 'destroyAddress']);
    Route::post('/checkout', [CheckoutController::class, 'store']);

    Route::post('/transactions', [TransactionController::class, 'store']);
    Route::get('/transactions', [TransactionController::class, 'index']);
    Route::get('/transactions/{transaction}', [TransactionController::class, 'show']);
    Route::get('/transactions/{id}', [TransactionController::class, 'show']);
    
    Route::prefix('/admin')->group(function (): void {
        Route::get('/orders', [AdminController::class, 'orders']);
        Route::patch('/orders/{transaction}/status', [AdminController::class, 'updateOrderStatus']);

        Route::get('/menus', [AdminController::class, 'menu']);
        Route::post('/menus', [AdminController::class, 'storeMenu']);
        Route::put('/menus/{menu}', [AdminController::class, 'updateMenu']);
        Route::delete('/menus/{menu}', [AdminController::class, 'destroyMenu']);

        Route::get('/inventory', [AdminController::class, 'inventory']);
        Route::patch('/inventory/{ingredient}', [AdminController::class, 'updateInventory']);
    });
});