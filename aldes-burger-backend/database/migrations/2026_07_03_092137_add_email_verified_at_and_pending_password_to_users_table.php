<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Missing from the original create_users_table migration —
            // required for the OTP-verification-gated login flow to work.
            if (! Schema::hasColumn('users', 'email_verified_at')) {
                $table->timestamp('email_verified_at')->nullable()->after('password');
            }

            // Staging column for a new password during re-registration.
            // Only promoted to the real `password` column after OTP succeeds.
            if (! Schema::hasColumn('users', 'pending_password')) {
                $table->string('pending_password')->nullable()->after('password');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['email_verified_at', 'pending_password']);
        });
    }
};