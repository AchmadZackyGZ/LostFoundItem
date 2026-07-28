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
        Schema::table('app_notifications', function (Blueprint $table) {
            if (!Schema::hasColumn('app_notifications', 'type')) {
                $table->string('type')->default('info')->after('message');
            }
            if (!Schema::hasColumn('app_notifications', 'action_url')) {
                $table->string('action_url')->nullable()->after('type');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('app_notifications', function (Blueprint $table) {
            $table->dropColumn(['type', 'action_url']);
        });
    }
};
