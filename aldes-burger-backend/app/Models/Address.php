<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Address extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'address',
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
    ];

    protected function casts(): array
    {
        return [
            'pin_confirmed' => 'boolean',
            'is_default' => 'boolean',
            'latitude' => 'float',
            'longitude' => 'float',
        ];
    }

    public static function composeLegacyAddress(array $payload): string
    {
        return implode(', ', array_filter([
            trim((string) ($payload['street_address'] ?? '')),
            trim((string) ($payload['detail_address'] ?? '')),
            trim((string) ($payload['district'] ?? '')),
            trim((string) ($payload['city'] ?? '')),
            trim((string) ($payload['province'] ?? '')),
            trim((string) ($payload['postal_code'] ?? '')),
        ]));
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }
}
