<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Transaction extends Model
{
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'payment_id',
        'address_id',
        'destination_address',
        'user_id',
        'amount',
        'status',
    ];

    protected static function booted(): void
    {
        static::creating(function (Transaction $transaction): void {
            if (! empty($transaction->destination_address)) {
                return;
            }

            if (empty($transaction->address_id)) {
                return;
            }

            $transaction->destination_address = Address::query()
                ->whereKey($transaction->address_id)
                ->value('address');
        });
    }

    public function address(): BelongsTo
    {
        return $this->belongsTo(Address::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    public function details(): HasMany
    {
        return $this->hasMany(TransactionDetail::class);
    }
}
