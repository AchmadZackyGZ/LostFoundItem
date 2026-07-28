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
        Schema::create('item_claim_and_infos', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // PERUBAHAN: Tanpa constrained ke tabel users, lost_items, atau found_items
            $table->uuid('submitted_by_user_id')->index();
            $table->uuid('lost_item_id')->nullable()->index();
            $table->uuid('found_item_id')->nullable()->index();

            $table->text('message');
            $table->string('contact_info');
            $table->enum('status', ['pending', 'accepted', 'rejected'])->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('item_claim_and_infos');
    }
};
