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
        Schema::create('lost_items', function (Blueprint $table) {
            $table->uuid();
            $table->uuid('user_id')->index(); // tidak pakai fk ke table users karena kita mengguanakn module monolith
            $table->string('title');
            $table->text('description');
            $table->string('category');
            $table->string('location_lost');
            $table->dateTime('incident_time');
            $table->string('photo_url')->nullable();
            $table->enum('status', ['pending_verification', 'published', 'rejected', 'resolved'])->default('pending_verification');
            $table->text('rejection_note')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lost_items');
    }
};
