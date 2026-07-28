<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE items DROP CONSTRAINT IF EXISTS items_status_check;");
        DB::statement("ALTER TABLE items ADD CONSTRAINT items_status_check CHECK (status::text = ANY (ARRAY['pending'::text, 'active'::text, 'is_pending'::text, 'pending_claim'::text, 'completed'::text]));");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE items DROP CONSTRAINT IF EXISTS items_status_check;");
        DB::statement("ALTER TABLE items ADD CONSTRAINT items_status_check CHECK (status::text = ANY (ARRAY['active'::text, 'pending_claim'::text, 'completed'::text]));");
    }
};
