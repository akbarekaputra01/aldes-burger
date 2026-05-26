<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // Mengubah ENUM agar menerima 'cancelled' (Asumsi menggunakan MySQL)
        DB::statement("ALTER TABLE transactions MODIFY COLUMN status ENUM('pending', 'cooking', 'done', 'cancelled') NOT NULL DEFAULT 'pending'");
    }

    public function down()
    {
        // Mengembalikan ke semula jika di-rollback
        DB::statement("ALTER TABLE transactions MODIFY COLUMN status ENUM('pending', 'cooking', 'done') NOT NULL DEFAULT 'pending'");
    }
};