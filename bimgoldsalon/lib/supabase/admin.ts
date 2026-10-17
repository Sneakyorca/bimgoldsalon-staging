import "server-only";
import { createClient } from "@supabase/supabase-js";

// Bypasses RLS. Only ever import this from server-only code (Data/*).
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}