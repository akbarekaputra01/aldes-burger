<!DOCTYPE html>
<html>
<head>
    <title>Kode OTP Aldes Burger</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #ff9900; text-align: center;">Aldes Burger</h2>
        <p>Halo,</p>
        <p>Kamu menerima email ini karena ada permintaan kode verifikasi (OTP) untuk akun kamu.</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; background: #f4f4f4; padding: 10px 20px; border-radius: 5px; border: 1px dashed #ccc;">
                {{ $otp }}
            </span>
        </div>

        <p>Kode OTP ini berlaku selama **10 menit**. Jangan membagikan kode ini kepada siapa pun demi keamanan akun kamu.</p>
        <p>Jika kamu tidak merasa melakukan permintaan ini, abaikan saja email ini.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #777; text-align: center;">&copy; {{ date('Y') }} Aldes Burger. All rights reserved.</p>
    </div>
</body>
</html>