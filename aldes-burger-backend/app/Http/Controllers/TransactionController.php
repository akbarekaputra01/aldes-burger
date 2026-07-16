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
        $transactions = Transaction::with('payment')
                            ->where('user_id', auth()->id())
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
                'status'              => ($paymentId == 2) ? 'pending' : 'waiting_for_payment', 
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

    public function changePaymentMethod(Request $request, $id)
    {
        $validatedData = $request->validate([
            'payment_method' => 'required|string',
        ]);

        $transaction = Transaction::where('id', $id)
                                ->where('user_id', auth()->id())
                                ->firstOrFail();

        $paymentId = ($validatedData['payment_method'] === 'cash') ? 2 : 1;
        
        $transaction->payment_id = $paymentId;

        // If they changed to cash, update Payment ID in DB (Assuming 2 is Cash, 1 is Bank Transfer from your seeder maybe, but let's update method)
        // Wait, the checkout creates a new payment or finds it by method name. 
        // Let's use `Payment::firstOrCreate` as done in CheckoutController
        $payment = \App\Models\Payment::firstOrCreate(['method' => $validatedData['payment_method']]);
        $transaction->payment_id = $payment->id;

        if ($validatedData['payment_method'] === 'cash') {
            $transaction->status = 'pending';
        } else {
            if ($request->is_success) {
                $transaction->status = 'pending';
            } else {
                $transaction->status = 'waiting_for_payment';
            }
            
            if (!$transaction->snap_token) {
                \Midtrans\Config::$serverKey = env('MIDTRANS_SERVER_KEY');
                \Midtrans\Config::$isProduction = false;
                \Midtrans\Config::$isSanitized = true;
                \Midtrans\Config::$is3ds = true;
                \Midtrans\Config::$curlOptions = [
                    CURLOPT_SSL_VERIFYHOST => 0,
                    CURLOPT_SSL_VERIFYPEER => 0,
                    CURLOPT_HTTPHEADER => [],
                ];
                
                $midtransParams = [
                    'transaction_details' => [
                        'order_id' => $transaction->id,
                        'gross_amount' => (int) $transaction->amount,
                    ],
                    'customer_details' => [
                        'first_name' => auth()->user()->name ?? 'Customer',
                        'email' => auth()->user()->email ?? 'customer@aldesburger.com',
                    ],
                ];

                $snapToken = \Midtrans\Snap::getSnapToken($midtransParams);
                $transaction->snap_token = $snapToken;
            }
        }
        
        $transaction->save();
        $transaction->load(['details', 'payment']);

        return response()->json([
            'message' => 'Payment method updated',
            'transaction' => $transaction
        ]);
    }

    public function getSnapToken(Transaction $transaction)
    {
        if (auth()->id() !== $transaction->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!$transaction->snap_token) {
            \Midtrans\Config::$serverKey = env('MIDTRANS_SERVER_KEY');
            \Midtrans\Config::$isProduction = false;
            \Midtrans\Config::$isSanitized = true;
            \Midtrans\Config::$is3ds = true;
            \Midtrans\Config::$curlOptions = [
                CURLOPT_SSL_VERIFYHOST => 0,
                CURLOPT_SSL_VERIFYPEER => 0,
                CURLOPT_HTTPHEADER => [],
            ];
            
            $midtransParams = [
                'transaction_details' => [
                    'order_id' => $transaction->id,
                    'gross_amount' => (int) $transaction->amount,
                ],
                'customer_details' => [
                    'first_name' => auth()->user()->name ?? 'Customer',
                    'email' => auth()->user()->email ?? 'customer@aldesburger.com',
                ],
            ];

            $transaction->snap_token = \Midtrans\Snap::getSnapToken($midtransParams);
            $transaction->save();
        }

        return response()->json([
            'snap_token' => $transaction->snap_token
        ]);
    }

    public function cancel(Transaction $transaction)
    {
        if (auth()->id() !== $transaction->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!in_array($transaction->status, ['pending', 'waiting_for_payment'])) {
            return response()->json(['message' => 'Order cannot be cancelled in this status'], 400);
        }

        $transaction->update(['status' => 'cancelled']);
        $transaction->load('details.menu.ingredients');

        // Restore stock
        foreach ($transaction->details as $detail) {
            $menu = $detail->menu;
            $qty = $detail->quantity;
            $modifiers = is_string($detail->snapshot_modifiers) ? json_decode($detail->snapshot_modifiers, true) : $detail->snapshot_modifiers;

            if ($menu && $menu->ingredients->isNotEmpty()) {
                foreach ($menu->ingredients as $ingredient) {
                    $needed = ($ingredient->pivot->quantity ?? 1) * $qty;
                    $ingredient->increment('stock', $needed);
                }

                if (is_array($modifiers) && isset($modifiers['add'])) {
                    foreach ($modifiers['add'] as $ingName) {
                        \App\Models\Ingredient::query()->where('name', $ingName)->increment('stock', $qty);
                    }
                }
            } else {
                // Custom burger or menu without ingredients
                if (is_array($modifiers)) {
                    $stackCounts = [];
                    foreach ($modifiers as $ingName) {
                        if (is_string($ingName)) {
                            $stackCounts[$ingName] = ($stackCounts[$ingName] ?? 0) + 1;
                        }
                    }
                    foreach ($stackCounts as $ingName => $count) {
                        \App\Models\Ingredient::query()->where('name', $ingName)->increment('stock', $count * $qty);
                    }
                }
            }
        }

        return response()->json([
            'message' => 'Order cancelled successfully',
            'transaction' => $transaction->fresh(['details', 'payment'])
        ]);
    }
}