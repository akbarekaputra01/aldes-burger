<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\Transaction; // Sesuaikan dengan nama model transaksi Anda
// use App\Models\TransactionDetail; // Jika Anda menyimpan detail item di tabel terpisah

class TransactionController extends Controller
{
    public function show($id)
    {
        try {
            // Cari transaksi berdasarkan ID dan pastikan milik user yang sedang login
            // 'details' dan 'payment' adalah relasi yang ingin kita ambil bersamaan (Eager Loading)
            $transaction = Transaction::with(['details', 'payment'])
                                    ->where('id', $id)
                                    ->where('user_id', auth()->id())
                                    ->firstOrFail();

            return response()->json($transaction);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            // Jika tidak ditemukan, kembalikan response 404
            return response()->json(['message' => 'Transaction not found'], 404);
        } catch (\Exception $e) {
            // Jika ada error lain, kembalikan response 500 beserta pesan errornya
            return response()->json(['message' => 'Internal Server Error', 'error' => $e->getMessage()], 500);
        }
    }

    public function index()
    {
        // 1. Ambil data transaksi milik user yang sedang login
        // Diurutkan dari yang paling baru (descending)
        $transactions = Transaction::where('user_id', auth()->id())
                            ->orderBy('created_at', 'desc')
                            ->get();

        // 2. Kirim datanya ke Frontend React dalam bentuk JSON
        return response()->json($transactions);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'amount'         => 'required|numeric',
            'status'         => 'required|string',
            'payment_method' => 'required|string',
            'address'        => 'required|string',
            'address_id'     => 'required|integer',
            'items'          => 'required|array',
            'items.*.id'     => 'required',
            'items.*.qty'    => 'required|integer|min:1',
            'items.*.price'  => 'required|numeric',
            'items.*.name'   => 'nullable|string',
            'items.*.ingredients' => 'nullable|array' // <--- TAMBAHKAN VALIDASI INI
        ]);

        try {
            $paymentId = ($validatedData['payment_method'] === 'cash') ? 2 : 1;
            $transaction = Transaction::create([
                'id'                  => (string) \Illuminate\Support\Str::uuid(),
                'user_id'             => auth()->id(),
                'amount'              => $validatedData['amount'],
                'status'              => 'pending', 
                'destination_address' => $validatedData['address'],
                'address_id'          => $validatedData['address_id'],
                'payment_id'          => $paymentId,
            ]);

            foreach ($validatedData['items'] as $item) {
                \App\Models\TransactionDetail::create([
                    'transaction_id' => $transaction->id,
                    'menu_id'        => $item['id'],
                    'quantity'       => $item['qty'],
                    'snapshot_price' => $item['price'],
                    'snapshot_name'  => $item['name'] ?? 'Menu Item',
                    // SIMPAN URUTAN BAHAN KE DALAM SNAPSHOT MODIFIERS:
                    'snapshot_modifiers' => isset($item['ingredients']) && count($item['ingredients']) > 0 ? $item['ingredients'] : null
                ]);
            }

            return response()->json([
                'message' => 'Transaction created successfully',
                'transaction' => $transaction
            ], 201); 
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to create transaction: ' . $e->getMessage()], 500);
        }
    }
}