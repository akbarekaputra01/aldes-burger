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
        $payload = $request->validate([
            'address_id' => ['required', 'integer', 'exists:addresses,id'],
            'payment_method' => ['required', 'string', 'max:100'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.menu_id' => ['required', 'integer', 'exists:menus,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.modifiers' => ['nullable', 'array'],
            'items.*.modifiers.*.ingredient_id' => ['required', 'integer', 'exists:ingredients,id'],
            'items.*.modifiers.*.action' => ['required', 'in:add,remove'],
        ]);

        $user = $request->user();
        $address = Address::query()->where('user_id', $user->id)->findOrFail($payload['address_id']);

        $transaction = DB::transaction(function () use ($payload, $user, $address) {
            $payment = Payment::query()->firstOrCreate(['method' => $payload['payment_method']]);

            $totalAmount = 0;
            $details = [];

            foreach ($payload['items'] as $item) {
                $menu = Menu::query()->findOrFail($item['menu_id']);

                $addModifierPrice = 0;
                $modifierLabels = [];

                foreach ($item['modifiers'] ?? [] as $modifier) {
                    $ingredient = Ingredient::query()->findOrFail($modifier['ingredient_id']);

                    if ($modifier['action'] === 'add') {
                        $addModifierPrice += $ingredient->price;
                    }

                    $modifierLabels[] = sprintf('%s %s', strtoupper($modifier['action']), $ingredient->name);
                }

                $snapshotPrice = $menu->price + $addModifierPrice;
                $quantity = (int) $item['quantity'];

                $totalAmount += $snapshotPrice * $quantity;

                $snapshotName = $menu->name;
                if ($modifierLabels !== []) {
                    $snapshotName .= ' ['.implode(', ', $modifierLabels).']';
                }

                $details[] = [
                    'menu_id' => $menu->id,
                    'quantity' => $quantity,
                    'snapshot_name' => $snapshotName,
                    'snapshot_price' => $snapshotPrice,
                ];
            }

            $transaction = Transaction::query()->create([
                'id' => (string) Str::uuid(),
                'payment_id' => $payment->id,
                'address_id' => $address->id,
                'destination_address' => $address->address,
                'user_id' => $user->id,
                'amount' => $totalAmount,
                'status' => 'pending',
            ]);

            foreach ($details as $detail) {
                TransactionDetail::query()->create([
                    'transaction_id' => $transaction->id,
                    ...$detail,
                ]);
            }

            return $transaction->load(['details', 'payment']);
        });

        return response()->json($transaction, 201);
    }

    public function storeAddress(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'address' => ['required', 'string', 'max:255'],
        ]);

        $address = Address::query()->create([
            'user_id' => $request->user()->id,
            'address' => $payload['address'],
        ]);

        return response()->json($address, 201);
    }

    public function updateAddress(Request $request, Address $address): JsonResponse
    {
        if ($address->user_id !== $request->user()->id) {
            abort(404);
        }

        $payload = $request->validate([
            'address' => ['required', 'string', 'max:255'],
        ]);

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
}
