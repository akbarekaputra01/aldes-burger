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
        'snap_token'
    ];

    public function address(): BelongsTo
    {
        return $this->belongsTo(Address::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // public function payment(): BelongsTo
    // {
    //     return $this->belongsTo(Payment::class);
    // }

    // public function details(): HasMany
    // {
    //     return $this->hasMany(TransactionDetail::class);
    // }
    // Relasi ke tabel transaction_details
    public function details()
    {
        return $this->hasMany(TransactionDetail::class, 'transaction_id', 'id');
    }

    // Relasi ke tabel payments
    public function payment()
    {
        return $this->belongsTo(Payment::class, 'payment_id', 'id');
    }
}
