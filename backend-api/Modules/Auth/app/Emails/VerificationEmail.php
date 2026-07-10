<?php

namespace Modules\Auth\Emails;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;

class VerificationEmail extends Mailable
{
    use Queueable, SerializesModels;

    public string $otpCode;

    /**
     * Create a new message instance.
     */
    public function __construct(string $otpCode)
    {
        $this->otpCode = $otpCode;
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->subject('Kode Verifikasi Lost & Found UISI')->html("
                        <h2>Halo, Mahasiswa UISI!</h2>
                        <p>Terima kasih telah mendaftar di Aplikasi Lost & Found UISI.</p>
                        <p>Kode verifikasi (OTP) Anda adalah: <strong>{$this->otpCode}</strong></p>
                        <p>Kode ini hanya berlaku selama 10 menit. Jangan berikan kode ini kepada siapapun.</p>
                    ");
    }
}
