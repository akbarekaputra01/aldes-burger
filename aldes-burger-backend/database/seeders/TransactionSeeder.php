<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $transactionId1 = (string) Str::uuid();
        $transactionId2 = (string) Str::uuid();

        DB::table('transactions')->insert([
            [
                'id' => $transactionId1,
                'payment_id' => 1,
                'address_id' => 1,
                'destination_address' => 'Jl. Sudirman No. 123, Jakarta Selatan',
                'user_id' => 2,
                'amount' => 55000,
                'status' => 'done',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => $transactionId2,
                'payment_id' => 2,
                'address_id' => 2,
                'destination_address' => 'Jl. Gatot Subroto No. 45, Jakarta Selatan',
                'user_id' => 2,
                'amount' => 20000,
                'status' => 'cooking',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        DB::table('transaction_details')->insert([
            [
                'transaction_id'     => $transactionId1,
                'menu_id'            => 1,
                'quantity'           => 1,
                'snapshot_name'      => 'Beef Burger Deluxe',
                'snapshot_price'     => 55000,
                'snapshot_modifiers' => null,
                'created_at'         => now(),
                'updated_at'         => now(),
            ],
            [
                'transaction_id'     => $transactionId2,
                'menu_id'            => 3,
                'quantity'           => 1,
                'snapshot_name'      => 'Custom Burger [ADD Cheddar Cheese, REMOVE Tomato]',
                'snapshot_price'     => 20000,
                'snapshot_modifiers' => json_encode([
                    'add'    => ['Cheddar Cheese'],
                    'remove' => ['Tomato'],
                ]),
                'created_at'         => now(),
                'updated_at'         => now(),
            ],
        ]);
    }
}
