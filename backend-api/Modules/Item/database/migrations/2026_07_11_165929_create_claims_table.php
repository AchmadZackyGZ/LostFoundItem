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
        Schema::create('claims', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // Relasi ke barang yang diklaim dan siapa yang mengklaim
            $table->foreignUuid('item_id')->constrained('items')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();

            // Bukti dari pengklaim
            $table->text('proof_description');
            $table->string('proof_image_path')->nullable(); // Foto bukti tambahan

            // Status validasi Admin
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('claims');
    }
};
