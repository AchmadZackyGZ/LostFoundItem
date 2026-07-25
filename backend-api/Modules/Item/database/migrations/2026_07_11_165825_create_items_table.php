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
        Schema::create('items', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // Relasi ke pembuat post (mahasiswa) dan kategori
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('category_id')->constrained('categories')->restrictOnDelete();

            // Data Inti Barang
            $table->enum('type', ['lost', 'found']);
            $table->string('title');
            $table->text('description');
            $table->string('location');
            $table->date('date');
            $table->string('image_path')->nullable(); // Dari Cloudinary nanti

            // Fitur PRD: Status & Tag Urgent
            $table->enum('status', ['active', 'pending_claim', 'completed'])->default('active');
            $table->boolean('is_urgent')->default(false); // Hanya Admin yang bisa ubah ini

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('items');
    }
};
