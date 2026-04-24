import { createClient } from "@supabase/supabase-js";
import { env, integrationStatus } from "@/lib/env";

export function getSupabaseAdminClient() {
  if (!integrationStatus.supabase) {
    return null;
  }

  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL!,
    env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}
