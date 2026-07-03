<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Address;
use App\Models\Ingredient;
use App\Models\Menu;
use App\Models\Payment;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CheckoutController extends Controller
{
    public function addresses(Request $request): JsonResponse
    {
        return response()->json(
            $request->user()->addresses()->orderByDesc('id')->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        // 1. TAMBAHKAN VALIDASI INGREDIENTS
        $payload = $request->validate([
            'address_id' => ['required', 'integer', 'exists:addresses,id'],
            'payment_method' => ['required', 'string', 'max:100'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.menu_id' => ['required', 'integer', 'exists:menus,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.modifiers' => ['nullable', 'array'],
            'items.*.modifiers.*.ingredient_id' => ['required', 'integer', 'exists:ingredients,id'],
            'items.*.modifiers.*.action' => ['required', 'in:add,remove'],
            'items.*.ingredients' => ['nullable', 'array'], // FIX: Menerima urutan bahan dari react
        ]);

        $user = $request->user();
        $address = Address::query()->where('user_id', $user->id)->findOrFail($payload['address_id']);

        $result = DB::transaction(function () use ($payload, $user, $address) {
            $payment = Payment::query()->firstOrCreate(['method' => $payload['payment_method']]);

            $totalAmount = 0;
            $details = [];

            foreach ($payload['items'] as $item) {
                $menu = Menu::query()->with(['ingredients' => fn ($q) => $q->withPivot('quantity')])->findOrFail($item['menu_id']);

                $addModifierPrice = 0;
                $added = [];
                $removed = [];

                foreach ($item['modifiers'] ?? [] as $modifier) {
                    $ingredient = Ingredient::query()->findOrFail($modifier['ingredient_id']);

                    if ($modifier['action'] === 'add') {
                        $addModifierPrice += $ingredient->price;
                        $added[] = $ingredient->name;
                    } else {
                        $removed[] = $ingredient->name;
                    }
                }

                $snapshotPrice = $menu->price + $addModifierPrice;
                $quantity = (int) $item['quantity'];

                $totalAmount += $snapshotPrice * $quantity;

                $snapshotName = $menu->name;
                if ($added !== [] || $removed !== []) {
                    $parts = [];
                    foreach ($added as $name) $parts[] = 'ADD ' . $name;
                    foreach ($removed as $name) $parts[] = 'REMOVE ' . $name;
                    $snapshotName .= ' [' . implode(', ', $parts) . ']';
                }

                // Build snapshot modifiers for kitchen display
                $snapshotModifiers = null;
                if (!empty($item['ingredients'])) {
                    $snapshotModifiers = $item['ingredients'];
                } elseif ($added !== [] || $removed !== []) {
                    $snapshotModifiers = array_filter([
                        'add'    => $added ?: null,
                        'remove' => $removed ?: null,
                    ]);
                }

                $details[] = [
                    'menu_id'            => $menu->id,
                    'quantity'           => $quantity,
                    'snapshot_name'      => $snapshotName,
                    'snapshot_price'     => $snapshotPrice,
                    'snapshot_modifiers' => $snapshotModifiers ? json_encode($snapshotModifiers) : null,
                    // Keep reference to menu & modifiers for stock deduction below
                    '_menu'              => $menu,
                    '_modifiers'         => $item['modifiers'] ?? [],
                    '_ingredients_stack' => $item['ingredients'] ?? [],
                    '_quantity'          => $quantity,
                ];
            }

            $transaction = Transaction::query()->create([
                'id'                  => 'TRX-' . date('dmy') . '-' . mt_rand(1000, 9999),
                'payment_id'          => $payment->id,
                'address_id'          => $address->id,
                'destination_address' => $address->address,
                'user_id'             => $user->id,
                'amount'              => $totalAmount,
                'status'              => 'pending',
            ]);

            foreach ($details as $detail) {
                TransactionDetail::query()->create([
                    'transaction_id'     => $transaction->id,
                    'menu_id'            => $detail['menu_id'],
                    'quantity'           => $detail['quantity'],
                    'snapshot_name'      => $detail['snapshot_name'],
                    'snapshot_price'     => $detail['snapshot_price'],
                    'snapshot_modifiers' => $detail['snapshot_modifiers'],
                ]);

                // ── Deduct ingredient stock ────────────────────────────────
                /** @var Menu $menu */
                $menu = $detail['_menu'];
                $qty  = $detail['_quantity'];

                if ($menu->ingredients->isNotEmpty()) {
                    // Signature / recipe-based menu: deduct per recipe quantity × order qty
                    foreach ($menu->ingredients as $ingredient) {
                        $needed = ($ingredient->pivot->quantity ?? 1) * $qty;
                        $ingredient->decrement('stock', $needed);
                    }

                    // Also apply extra adds from modifiers
                    foreach ($detail['_modifiers'] as $mod) {
                        if ($mod['action'] === 'add') {
                            Ingredient::query()->where('id', $mod['ingredient_id'])->decrement('stock', $qty);
                        }
                    }
                } else {
                    // Custom burger: deduct 1 unit per ingredient in the stack × order qty
                    // Count occurrences of each ingredient name in the stack
                    $stackCounts = [];
                    foreach ($detail['_ingredients_stack'] as $ingName) {
                        $stackCounts[$ingName] = ($stackCounts[$ingName] ?? 0) + 1;
                    }
                    foreach ($stackCounts as $ingName => $count) {
                        Ingredient::query()
                            ->where('name', $ingName)
                            ->decrement('stock', $count * $qty);
                    }
                }
            }

            // ── Midtrans Integration ────────────────────────────────
            \Midtrans\Config::$serverKey = env('MIDTRANS_SERVER_KEY');
            // \Midtrans\Config::$isProduction = env('MIDTRANS_IS_PRODUCTION', false);
            \Midtrans\Config::$isProduction = false; // Harus false untuk Sandbox
            \Midtrans\Config::$isSanitized = true;
            \Midtrans\Config::$is3ds = true;
            \Midtrans\Config::$curlOptions = [
                CURLOPT_SSL_VERIFYHOST => 0,
                CURLOPT_SSL_VERIFYPEER => 0,
                CURLOPT_HTTPHEADER => [], // Tambahkan baris ini untuk mencegah error 10023
            ];

            $midtransParams = [
                'transaction_details' => [
                    'order_id' => $transaction->id,
                    'gross_amount' => (int) $totalAmount, // Pastikan menjadi integer
                ],
                'customer_details' => [
                    'first_name' => $user->name,
                    'email' => $user->email,
                    'phone' => $address->phone_number,
                ]
            ];

            $snapToken = \Midtrans\Snap::getSnapToken($midtransParams);
            // dd(env('MIDTRANS_SERVER_KEY'));
            // Return array berisi data transaksi dan snap token
            $transaction->snap_token = $snapToken;
            $transaction->save();
            return [
                'transaction' => $transaction->load(['details', 'payment']),
                'snap_token' => $snapToken
            ];
        });

        // Response dikembalikan sebagai JSON dengan HTTP status 201 Created
        return response()->json($result, 201);
    }

    public function storeAddress(Request $request): JsonResponse
    {
        $payload = $this->validateAddressPayload($request);

        $user = $request->user();
        $isFirstAddress = !$user->addresses()->exists();
        $shouldBeDefault = ($payload['is_default'] ?? false) || $isFirstAddress;

        if ($shouldBeDefault) {
            $user->addresses()->update(['is_default' => false]);
        }

        $address = Address::query()->create([
            ...$payload,
            'user_id' => $user->id,
            'is_default' => $shouldBeDefault,
        ]);

        return response()->json($address, 201);
    }

    public function updateAddress(Request $request, Address $address): JsonResponse
    {
        if ($address->user_id !== $request->user()->id) {
            abort(404);
        }

        $payload = $this->validateAddressPayload($request, true);

        if (($payload['is_default'] ?? false) === true) {
            $request->user()->addresses()->where('id', '!=', $address->id)->update(['is_default' => false]);
        }

        $address->update($payload);

        return response()->json($address->fresh());
    }

    public function destroyAddress(Request $request, Address $address): JsonResponse
    {
        if ($address->user_id !== $request->user()->id) {
            abort(404);
        }

        $address->delete();

        return response()->json(['message' => 'Address deleted.']);
    }

    private function validateAddressPayload(Request $request, bool $isUpdate = false): array
    {
        $payload = $request->validate([
            'recipient_name' => ['required', 'string', 'max:100'],
            'phone_number' => ['required', 'string', 'max:30'],
            'label' => ['nullable', 'string', 'in:Home,Work,Other'],
            'province' => ['required', 'string', 'max:100'],
            'city' => ['required', 'string', 'max:100'],
            'district' => ['required', 'string', 'max:100'],
            'postal_code' => ['required', 'string', 'max:20'],
            'street_address' => ['required', 'string'],
            'detail_address' => ['nullable', 'string'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'pin_source' => ['required', 'string', 'in:default,suggestion,current_location,manual_map,manual_adjusted'],
            'pin_confirmed' => ['required', 'boolean'],
            'is_default' => ['nullable', 'boolean'],
        ]);

        if ($payload['pin_source'] === 'default' || !$payload['pin_confirmed']) {
            abort(response()->json([
                'message' => 'Choose a location from the suggestions or set a map pin so the courier can find your address.',
            ], 422));
        }

        $payload['address'] = Address::composeLegacyAddress($payload);

        if (!$isUpdate && !isset($payload['is_default'])) {
            $payload['is_default'] = false;
        }

        return $payload;
    }
}