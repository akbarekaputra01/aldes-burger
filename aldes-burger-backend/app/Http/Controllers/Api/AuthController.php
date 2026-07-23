<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Mail\OtpVerificationMail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class AuthController extends Controller
{
    // 1. Register
    // IMPORTANT: the submitted password is NOT written to the real
    // `password` column here. It is staged in `pending_password` and only
    // promoted to `password` after the OTP is successfully verified in
    // verifyRegisterOtp(). This is what prevents an unverified re-registration
    // from silently taking over the account's login credentials.
    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'password' => ['required', 'confirmed', 'min:6'],
        ]);

        $existingUser = User::query()->where('email', $request->email)->first();

        // Email already registered AND already verified -> reject
        if ($existingUser && $existingUser->email_verified_at !== null) {
            return response()->json([
                'message' => 'This email is already registered. Please log in or use a different email.'
            ], 422);
        }

        $otp = (string) rand(100000, 999999);

        // Email exists but is NOT verified yet -> update pending data only
        if ($existingUser && $existingUser->email_verified_at === null) {
            $existingUser->update([
                'name' => $request->name,
                'phone' => $request->phone,
                'pending_password' => Hash::make($request->password),
                'otp' => $otp,
                'otp_expires_at' => now()->addMinutes(10),
            ]);
            $user = $existingUser;
        } else {
            // Brand new email -> create the user.
            // No existing account for this email yet, so storing the real
            // password immediately is safe — it still can't be used to log
            // in until email_verified_at is set below.
            $user = User::query()->create([
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'password' => $request->password, // hashed automatically via 'hashed' cast
                'otp' => $otp,
                'otp_expires_at' => now()->addMinutes(10),
            ]);
        }

        Mail::to($user->email)->send(new OtpVerificationMail($otp));

        return response()->json([
            'message' => 'Registration successful. Please check your email for the OTP code.',
            'email' => $user->email
        ], 201);
    }
    public function verifyOtp(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
            'otp' => ['required', 'string'],
        ]);

        $user = User::query()->where('email', $request->email)->first();

        // Validasi OTP tanpa menghapusnya (set to null)
        if ($user->otp !== $request->otp || now()->greaterThan($user->otp_expires_at)) {
            return response()->json(['message' => 'Invalid or expired OTP code.'], 400);
        }

        // OTP Valid, kirim response sukses agar frontend bisa pindah ke step 'reset'
        return response()->json(['message' => 'OTP verified successfully.']);
    }
    // 2. Verify OTP after registration
    public function verifyRegisterOtp(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
            'otp' => ['required', 'string'],
        ]);

        $user = User::query()->where('email', $request->email)->first();

        if ($user->otp !== $request->otp || now()->greaterThan($user->otp_expires_at)) {
            return response()->json(['message' => 'Invalid or expired OTP code.'], 400);
        }

        $updateData = [
            'otp' => null,
            'otp_expires_at' => null,
            'email_verified_at' => now(),
        ];

        // Only now do we promote the staged password to the real one.
        if ($user->pending_password) {
            $updateData['password'] = $user->pending_password;
            $updateData['pending_password'] = null;
        }

        $user->update($updateData);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Email verified successfully.',
            'token' => $token,
            'user' => $user,
        ]);
    }

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::query()->where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        // Block login until the account has completed OTP verification.
        if (is_null($user->email_verified_at)) {
            return response()->json([
                'message' => 'This email has not been verified yet. Please check your email for the OTP code.'
            ], 403);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user,
        ]);
    }

    public function user(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }

    // 3. Request OTP for forgot password
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email']
        ]);

        $user = User::query()->where('email', $request->email)->first();

        if ($user) {
            $otp = (string) rand(100000, 999999);
            $user->update([
                'otp' => $otp,
                'otp_expires_at' => now()->addMinutes(10)
            ]);

            Mail::to($user->email)->send(new OtpVerificationMail($otp));
        }

        return response()->json([
            'message' => 'If an account with that email exists, an OTP code to reset your password has been sent.'
        ]);
    }

    // 3.5 Verify OTP for reset password (doesn't consume it)
    public function verifyResetOtp(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
            'otp' => ['required', 'string'],
        ]);

        $user = User::query()->where('email', $request->email)->first();

        if ($user->otp !== $request->otp || now()->greaterThan($user->otp_expires_at)) {
            return response()->json(['message' => 'Invalid or expired OTP code.'], 400);
        }

        return response()->json(['message' => 'OTP is valid.']);
    }

    // 4. Reset password using OTP
    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
            'otp' => ['required', 'string'],
            'password' => ['required', 'confirmed', 'min:6'],
        ]);

        $user = User::query()->where('email', $request->email)->first();

        if ($user->otp !== $request->otp || now()->greaterThan($user->otp_expires_at)) {
            return response()->json(['message' => 'Invalid or expired OTP code.'], 400);
        }

        // Langsung update password dan hapus OTP di sini
        $user->update([
            'password' => $request->password,
            'otp' => null,
            'otp_expires_at' => null,
        ]);

        // Hapus token aktif jika ada
        $user->tokens()->delete();

        return response()->json([
            'message' => 'Password reset successfully. Please log in with your new password.'
        ]);
    }

    // Change password while logged in (matches PUT /user/password route)
    public function updatePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', 'min:6', 'different:current_password'],
        ]);

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json([
            'message' => 'Password updated successfully.'
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }
}