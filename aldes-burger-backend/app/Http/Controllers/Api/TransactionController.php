<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $transactions = Transaction::query()
            ->where('user_id', $request->user()->id)
            ->with(['details', 'payment'])
            ->latest()
            ->get();

        return response()->json($transactions);
    }

    public function show(Request $request, Transaction $transaction): JsonResponse
    {
        abort_if($transaction->user_id !== $request->user()->id && $request->user()->role !== 'admin', 403);

        return response()->json($transaction->load(['details.menu', 'payment', 'user']));
    }
}
