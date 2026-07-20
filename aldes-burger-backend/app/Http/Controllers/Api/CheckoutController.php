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

        // --- OPTIMIZATION: Pre-fetch Menus and Ingredients to avoid N+1 queries ---
        $menuIds = collect($payload['items'])->pluck('menu_id')->unique();
        $menus = Menu::query()->with(['ingredients' => fn ($q) => $q->withPivot('quantity')])->whereIn('id', $menuIds)->get()->keyBy('id');

        $modifierIngredientIds = collect($payload['items'])
            ->pluck('modifiers')->flatten(1)->filter()
            ->pluck('ingredient_id')->unique();
            
        $stackIngredientNames = collect($payload['items'])
            ->pluck('ingredients')->flatten(1)->filter()
            ->unique();

        $ingredientsById = Ingredient::query()->whereIn('id', $modifierIngredientIds)->get()->keyBy('id');
        $ingredientsByName = Ingredient::query()->whereIn('name', $stackIngredientNames)->get()->keyBy('name');

        $recipeIngredientIds = [];
        foreach ($menus as $menu) {
            foreach ($menu->ingredients as $ing) {
                $recipeIngredientIds[] = $ing->id;
            }
        }
        $recipeIngredients = Ingredient::query()->whereIn('id', $recipeIngredientIds)->get()->keyBy('id');

        // All ingredients that might be used
        $allIngredients = $ingredientsById->merge($recipeIngredients)->concat($ingredientsByName->values())->keyBy('id');
        // -------------------------------------------------------------------------

        $transaction = DB::transaction(function () use ($payload, $user, $address, $menus, $ingredientsById, $ingredientsByName, $allIngredients) {
            $payment = Payment::query()->firstOrCreate(['method' => $payload['payment_method']]);

            $totalAmount = 0;
            $details = [];

            foreach ($payload['items'] as $item) {
                $menu = $menus->get($item['menu_id']);
                if (!$menu) abort(404, "Menu not found");

                $addModifierPrice = 0;
                $added = [];
                $removed = [];

                foreach ($item['modifiers'] ?? [] as $modifier) {
                    $ingredient = $ingredientsById->get($modifier['ingredient_id']);
                    if (!$ingredient) abort(404, "Ingredient not found");

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

            // ─── Stock Validation & Deduction ───
            $requiredMenuStock = [];
            $requiredIngredientStock = [];

            foreach ($details as $detail) {
                $menu = $detail['_menu'];
                $qty  = $detail['quantity'];

                if ($menu->ingredients->isNotEmpty()) {
                    // Signature / recipe-based menu: check ingredients stock
                    foreach ($menu->ingredients as $ingredient) {
                        $needed = ($ingredient->pivot->quantity ?? 1) * $qty;
                        $requiredIngredientStock[$ingredient->id] = ($requiredIngredientStock[$ingredient->id] ?? 0) + $needed;
                    }

                    // Apply extra adds from modifiers
                    foreach ($detail['_modifiers'] as $mod) {
                        if ($mod['action'] === 'add') {
                            $requiredIngredientStock[$mod['ingredient_id']] = ($requiredIngredientStock[$mod['ingredient_id']] ?? 0) + $qty;
                        }
                    }
                } else {
                    if ($menu->is_custom) {
                        // Custom burger: check ingredient stack stock
                        foreach ($detail['_ingredients_stack'] as $ingName) {
                            $ingredient = $ingredientsByName->get($ingName);
                            if ($ingredient) {
                                $requiredIngredientStock[$ingredient->id] = ($requiredIngredientStock[$ingredient->id] ?? 0) + $qty;
                            }
                        }
                    } else {
                        // Regular menu with no ingredients (e.g. Side/Drink): checks menu stock
                        $requiredMenuStock[$menu->id] = ($requiredMenuStock[$menu->id] ?? 0) + $qty;
                    }
                }
            }

            // Verify and Deduct Menu Stocks
            foreach ($requiredMenuStock as $menuId => $reqQty) {
                $menu = $menus->get($menuId);
                if ($menu->stock < $reqQty) {
                    abort(response()->json([
                        'message' => "Stok untuk menu '{$menu->name}' tidak mencukupi (Tersedia: {$menu->stock})."
                    ], 422));
                }
                // DEDUCT MENU STOCK
                $menu->decrement('stock', $reqQty);
            }

            // Verify and Deduct Ingredient Stocks
            foreach ($requiredIngredientStock as $ingredientId => $reqQty) {
                $ingredient = $allIngredients->get($ingredientId);
                if ($ingredient->stock < $reqQty) {
                    abort(response()->json([
                        'message' => "Stok untuk bahan '{$ingredient->name}' tidak mencukupi (Tersedia: {$ingredient->stock})."
                    ], 422));
                }
                // DEDUCT INGREDIENT STOCK
                $ingredient->decrement('stock', $reqQty);
            }

            $trx = Transaction::query()->create([
                'id'                  => 'TRX-' . date('dmy') . '-' . mt_rand(1000, 9999),
                'payment_id'          => $payment->id,
                'address_id'          => $address->id,
                'destination_address' => $address->address,
                'user_id'             => $user->id,
                'amount'              => $totalAmount,
                'status'              => ($payload['payment_method'] === 'cash') ? 'pending' : 'waiting_for_payment',
            ]);

            foreach ($details as $detail) {
                TransactionDetail::query()->create([
                    'transaction_id'     => $trx->id,
                    'menu_id'            => $detail['menu_id'],
                    'quantity'           => $detail['quantity'],
                    'snapshot_name'      => $detail['snapshot_name'],
                    'snapshot_price'     => $detail['snapshot_price'],
                    'snapshot_modifiers' => $detail['snapshot_modifiers'],
                ]);
            }

            return $trx;
        });

        // ── Midtrans Integration (Dipindah ke luar DB::transaction) ──
        $snapToken = null;
        if ($payload['payment_method'] !== 'cash') {
            try {
                \Midtrans\Config::$serverKey = env('MIDTRANS_SERVER_KEY');
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
                        'gross_amount' => (int) $transaction->amount, // Pastikan menjadi integer
                    ],
                    'customer_details' => [
                        'first_name' => $user->name,
                        'email' => $user->email,
                        'phone' => $address->phone_number,
                    ]
                ];

                $snapToken = \Midtrans\Snap::getSnapToken($midtransParams);
                $transaction->snap_token = $snapToken;
                $transaction->save();
            } catch (\Exception $e) {
                // Ignore exception to let the checkout succeed even if Midtrans sandbox is slow/down
                // Di aplikasi nyata, lebih baik log errornya.
                \Illuminate\Support\Facades\Log::error('Midtrans Snap Token Error: ' . $e->getMessage());
            }
        }

        // Response dikembalikan sebagai JSON dengan HTTP status 201 Created
        return response()->json([
            'transaction' => $transaction->load(['details', 'payment']),
            'snap_token' => $snapToken
        ], 201);
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