<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('addresses', function (Blueprint $table) {
            $table->string('recipient_name', 100)->nullable()->after('address');
            $table->string('phone_number', 30)->nullable()->after('recipient_name');
            $table->string('label', 20)->nullable()->after('phone_number');
            $table->string('province', 100)->nullable()->after('label');
            $table->string('city', 100)->nullable()->after('province');
            $table->string('district', 100)->nullable()->after('city');
            $table->string('postal_code', 20)->nullable()->after('district');
            $table->text('street_address')->nullable()->after('postal_code');
            $table->text('detail_address')->nullable()->after('street_address');
            $table->decimal('latitude', 10, 8)->nullable()->after('detail_address');
            $table->decimal('longitude', 11, 8)->nullable()->after('latitude');
            $table->string('pin_source', 30)->nullable()->after('longitude');
            $table->boolean('pin_confirmed')->default(false)->after('pin_source');
            $table->boolean('is_default')->default(false)->after('pin_confirmed');
        });

        DB::table('addresses')->whereNull('street_address')->update([
            'street_address' => DB::raw('address'),
            'pin_confirmed' => false,
            'is_default' => false,
        ]);
    }

    public function down(): void
    {
        Schema::table('addresses', function (Blueprint $table) {
            $table->dropColumn([
                'recipient_name',
                'phone_number',
                'label',
                'province',
                'city',
                'district',
                'postal_code',
                'street_address',
                'detail_address',
                'latitude',
                'longitude',
                'pin_source',
                'pin_confirmed',
                'is_default',
            ]);
        });
    }
};
