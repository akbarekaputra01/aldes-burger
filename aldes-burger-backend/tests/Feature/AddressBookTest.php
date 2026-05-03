<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AddressBookTest extends TestCase
{
    use RefreshDatabase;

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'recipient_name' => 'John Doe', 'phone_number' => '08123', 'label' => 'Home',
            'province' => 'DKI', 'city' => 'Jakarta', 'district' => 'Setiabudi', 'postal_code' => '12910',
            'street_address' => 'Jl. Sudirman 1', 'detail_address' => 'Tower A',
            'latitude' => -6.2, 'longitude' => 106.816666, 'pin_source' => 'suggestion', 'pin_confirmed' => true,
        ], $overrides);
    }

    public function test_create_with_valid_pin_succeeds(): void
    {
        $user = User::factory()->create(); Sanctum::actingAs($user);
        $res = $this->postJson('/api/addresses', $this->payload());
        $res->assertCreated()->assertJsonPath('pin_source', 'suggestion');
    }

    public function test_create_without_valid_pin_fails(): void
    {
        $user = User::factory()->create(); Sanctum::actingAs($user);
        $this->postJson('/api/addresses', $this->payload(['pin_source' => 'default', 'pin_confirmed' => false]))->assertStatus(422);
    }

    public function test_first_address_is_default(): void
    {
        $user = User::factory()->create(); Sanctum::actingAs($user);
        $this->postJson('/api/addresses', $this->payload())->assertJsonPath('is_default', true);
    }

    public function test_set_default_unsets_others(): void
    {
        $user = User::factory()->create(); Sanctum::actingAs($user);
        $a = Address::create(['user_id'=>$user->id, ...$this->payload(), 'address'=>'a', 'is_default'=>true]);
        $b = Address::create(['user_id'=>$user->id, ...$this->payload(['street_address'=>'b']), 'address'=>'b', 'is_default'=>false]);
        $this->putJson("/api/addresses/{$b->id}", $this->payload(['street_address'=>'b', 'is_default'=>true]))->assertOk();
        $this->assertFalse($a->fresh()->is_default); $this->assertTrue($b->fresh()->is_default);
    }

    public function test_user_cannot_modify_other_user_address(): void
    {
        $user = User::factory()->create(); $other = User::factory()->create(); Sanctum::actingAs($user);
        $address = Address::create(['user_id'=>$other->id, ...$this->payload(), 'address'=>'a']);
        $this->putJson("/api/addresses/{$address->id}", $this->payload())->assertNotFound();
        $this->deleteJson("/api/addresses/{$address->id}")->assertNotFound();
    }

    public function test_old_address_data_still_displayed(): void
    {
        $user = User::factory()->create(); Sanctum::actingAs($user);
        Address::create(['user_id' => $user->id, 'address' => 'Legacy address']);
        $this->getJson('/api/addresses')->assertOk()->assertJsonPath('0.address', 'Legacy address');
    }
}
