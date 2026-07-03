<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transaction; // Sesuaikan dengan nama Model transaksi Anda (bisa Order, atau Transaction)
use Illuminate\Support\Facades\Log;

class MidtransController extends Controller
{
    public function callback(Request $request)
    {
        // 1. Ambil data dari Midtrans
        $payload = $request->all();
        
        Log::info('Midtrans Webhook masuk:', $payload); // Untuk ngecek log di Vercel nanti kalau ada error

        $orderId = $payload['order_id'];
        $statusCode = $payload['status_code'];
        $grossAmount = $payload['gross_amount'];
        $reqSignature = $payload['signature_key'];
        $transactionStatus = $payload['transaction_status'];

        // 2. (Opsional tapi penting) Keamanan: Validasi Signature Key agar tidak bisa ditembak sembarang orang
        $serverKey = env('MIDTRANS_SERVER_KEY'); // Pastikan Anda sudah pasang MIDTRANS_SERVER_KEY di .env Vercel
        $mySignature = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);

        if ($mySignature !== $reqSignature) {
            return response()->json(['message' => 'Invalid signature'], 403);
        }

        // 3. Cari transaksi di database berdasarkan ID
        $transaction = Transaction::where('id', $orderId)->first(); // Sesuaikan kolom pencarian ID-nya

        if (!$transaction) {
            return response()->json(['message' => 'Transaction not found'], 404);
        }

        // 4. Update status berdasarkan laporan Midtrans
        if ($transactionStatus == 'capture' || $transactionStatus == 'settlement') {
            // Lunas -> Ubah status jadi cooking (atau status apapun yang Anda pakai untuk lunas)
            $transaction->status = 'cooking'; 
        } else if ($transactionStatus == 'cancel' || $transactionStatus == 'deny' || $transactionStatus == 'expire') {
            // Gagal / Batal
            $transaction->status = 'cancelled';
        } else if ($transactionStatus == 'pending') {
            $transaction->status = 'pending';
        }

        // Simpan perubahan ke database
        $transaction->save();

        // 5. Beri tahu Midtrans bahwa pesan sudah kita terima dengan baik (HTTP 200)
        return response()->json(['message' => 'Callback success']);
    }
}