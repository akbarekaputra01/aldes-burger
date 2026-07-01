<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            // Menambahkan kolom untuk OTP dan batas waktunya
            $table->string('otp')->nullable();
            $table->timestamp('otp_expires_at')->nullable();
            
            // Catatan: Pastikan tabel users kamu sudah memiliki kolom 'email_verified_at' 
            // (bawaan default Laravel) untuk menandai status verifikasi Sign Up.
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['otp', 'otp_expires_at']);
        });
    }
};
