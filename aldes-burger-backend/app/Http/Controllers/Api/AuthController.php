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
    // 1. Fungsi Register (Dimodifikasi)
    public function register(Request $request): JsonResponse
    {
        // 1. HAPUS aturan 'unique:users,email' agar kita bisa melakukan pengecekan manual
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'], 
            'phone' => ['nullable', 'string', 'max:30'],
            'password' => ['required', 'confirmed', 'min:6'],
        ]);

        $existingUser = User::query()->where('email', $request->email)->first();

        // 2. Jika email sudah ada DAN sudah diverifikasi -> TOLAK
        if ($existingUser && $existingUser->email_verified_at !== null) {
            return response()->json([
                'message' => 'The email has already been taken.'
            ], 422);
        }

        $otp = (string) rand(100000, 999999);

        // 3. Jika email sudah ada TAPI BELUM diverifikasi -> UPDATE datanya
        if ($existingUser && $existingUser->email_verified_at === null) {
            $existingUser->update([
                'name' => $request->name,
                'phone' => $request->phone,
                'password' => $request->password, // Laravel otomatis melakukan Hash sesuai setingan casts di Model
                'otp' => $otp,
                'otp_expires_at' => now()->addMinutes(10),
            ]);
            $user = $existingUser;
        } else {
            // 4. Jika email benar-benar baru -> CREATE
            $user = User::query()->create([
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'password' => $request->password,
                'otp' => $otp,
                'otp_expires_at' => now()->addMinutes(10),
            ]);
        }

        // Kirim Email via Brevo
        Mail::to($user->email)->send(new OtpVerificationMail($otp));

        return response()->json([
            'message' => 'Registrasi berhasil. Silakan cek email untuk kode OTP.',
            'email' => $user->email
        ], 201);
    }

    // 2. FUNGSI BARU: Verifikasi OTP setelah Register
    public function verifyRegisterOtp(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
            'otp' => ['required', 'string'],
        ]);

        $user = User::query()->where('email', $request->email)->first();

        // Cek apakah OTP salah atau sudah lewat dari 10 menit
        if ($user->otp !== $request->otp || now()->greaterThan($user->otp_expires_at)) {
            return response()->json(['message' => 'Kode OTP tidak valid atau sudah kadaluarsa.'], 400);
        }

        // Jika valid, bersihkan kolom OTP dan berikan token login
        $user->update([
            'otp' => null,
            'otp_expires_at' => null,
            'email_verified_at' => now(), // Opsional: jika kamu punya kolom ini di database
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Email berhasil diverifikasi.',
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
            return response()->json(['message' => 'Invalid credentials.'], 422);
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

    // 3. FUNGSI BARU: Request OTP untuk Lupa Password
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email', 'exists:users,email']
        ]);

        $user = User::query()->where('email', $request->email)->first();

        $otp = (string) rand(100000, 999999);
        $user->update([
            'otp' => $otp,
            'otp_expires_at' => now()->addMinutes(10)
        ]);

        Mail::to($user->email)->send(new OtpVerificationMail($otp));

        return response()->json([
            'message' => 'Kode OTP untuk reset password telah dikirim ke email kamu.'
        ]);
    }

    // 4. FUNGSI BARU: Ganti Password menggunakan OTP
    public function resetPasswordWithOtp(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
            'otp' => ['required', 'string'],
            'password' => ['required', 'confirmed', 'min:6'],
        ]);

        $user = User::query()->where('email', $request->email)->first();

        if ($user->otp !== $request->otp || now()->greaterThan($user->otp_expires_at)) {
            return response()->json(['message' => 'Kode OTP tidak valid atau sudah kadaluarsa.'], 400);
        }

        // Karena kamu menggunakan casts 'hashed' di Model, kita bisa langsung update
        $user->update([
            'password' => $request->password, 
            'otp' => null,
            'otp_expires_at' => null,
        ]);

        return response()->json([
            'message' => 'Password berhasil diubah. Silakan login kembali dengan password baru.'
        ]);
    }

    // Fungsi ganti password saat user sedang login (dipertahankan)
    public function updatePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'], 
            'password' => ['required', 'confirmed', 'min:6'],
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

        return response()->json(['message' => 'Logged out.']);
    }
}