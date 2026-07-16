<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // Relasi ke Ruang Obrolan (Tabel conversations)
            $table->foreignUuid('conversation_id')->constrained('conversations')->cascadeOnDelete();

            // Relasi siapa yang mengirim pesan ini
            $table->foreignUuid('sender_id')->constrained('users')->cascadeOnDelete();

            // Teks isi pesannya
            $table->text('message');

            // Status dibaca atau belum
            $table->boolean('is_read')->default(false);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
