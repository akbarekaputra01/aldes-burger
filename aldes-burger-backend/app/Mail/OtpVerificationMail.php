<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OtpVerificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $otp;

    // Menerima kode OTP saat mail ini dipanggil
    public function __construct($otp)
    {
        $this->otp = $otp;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Kode OTP Verifikasi - Aldes Burger',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.otp', // Mengarah ke file template blade nanti
        );
    }

    public function attachments(): array
    {
        return [];
    }
}