<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\Transaction; 
use App\Models\TransactionDetail; 

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

            // Karena data token sudah disimpan di database, 
            // token otomatis akan ikut terkirim dalam response JSON ini!
            return response()->json($transaction);
            
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Transaction not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Internal Server Error', 'error' => $e->getMessage()], 500);
        }
    }

    public function index()
    {
        // 1. Ambil data transaksi milik user yang sedang login
        $transactions = Transaction::where('user_id', auth()->id())
                            ->orderBy('created_at', 'desc')
                            ->get();

        // 2. Kirim datanya ke Frontend React
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
            'items.*.ingredients' => 'nullable|array' 
        ]);

        try {
            $paymentId = ($validatedData['payment_method'] === 'cash') ? 2 : 1;
            
            // 1. Buat Transaksi
            $transaction = Transaction::create([
                'id'                  => 'TRX-' . date('dmy') . '-' . mt_rand(1000, 9999), 
                'user_id'             => auth()->id(),
                'amount'              => $validatedData['amount'],
                'status'              => 'pending', 
                'destination_address' => $validatedData['address'],
                'address_id'          => $validatedData['address_id'],
                'payment_id'          => $paymentId,
            ]);

            // 2. Simpan Detail Item
            foreach ($validatedData['items'] as $item) {
                TransactionDetail::create([
                    'transaction_id'     => $transaction->id,
                    'menu_id'            => $item['id'],
                    'quantity'           => $item['qty'],
                    'snapshot_price'     => $item['price'],
                    'snapshot_name'      => $item['name'] ?? 'Menu Item',
                    'snapshot_modifiers' => isset($item['ingredients']) && count($item['ingredients']) > 0 ? $item['ingredients'] : null
                ]);
            }

            $snapToken = null;

            // 3. Jika bukan Cash, minta Token ke Midtrans dan Simpan ke DB
            if ($validatedData['payment_method'] !== 'cash') {
                // Konfigurasi Midtrans
                \Midtrans\Config::$serverKey = env('MIDTRANS_SERVER_KEY');
                \Midtrans\Config::$isProduction = false; // Sandbox
                \Midtrans\Config::$isSanitized = true;
                \Midtrans\Config::$is3ds = true;

                $midtransParams = [
                    'transaction_details' => [
                        'order_id' => $transaction->id,
                        'gross_amount' => (int) $validatedData['amount'],
                    ],
                    'customer_details' => [
                        'first_name' => auth()->user()->name ?? 'Customer',
                        'email' => auth()->user()->email ?? 'customer@aldesburger.com',
                    ],
                ];

                // Generate Token
                $snapToken = \Midtrans\Snap::getSnapToken($midtransParams);
                
                // Simpan token ke database Aldes Burger
                $transaction->snap_token = $snapToken;
                $transaction->save();
            }

            // Load relasi agar data lengkap saat dikirim ke frontend
            $transaction->load(['details', 'payment']);

            return response()->json([
                'message'     => 'Transaction created successfully',
                'transaction' => $transaction,
                'snap_token'  => $snapToken // Dioper ke frontend untuk popup payment
            ], 201); 

        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to create transaction: ' . $e->getMessage()], 500);
        }
    }
}