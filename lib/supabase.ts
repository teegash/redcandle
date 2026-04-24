import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { env, integrationStatus } from "@/lib/env";

export async function getSupabaseServerClient() {
  if (!integrationStatus.supabase) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL!,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components can read cookies but not always persist them.
          }
        },
      },
    },
  );
}
