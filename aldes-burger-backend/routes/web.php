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