import { getSupabaseServerClient } from "@/lib/supabase";
import { demoProfile } from "@/lib/mock-data";
import { integrationStatus } from "@/lib/env";
import type { Profile } from "@/lib/types";

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function getCurrentProfile(): Promise<Profile> {
  if (!integrationStatus.supabase) {
    return demoProfile;
  }

  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    throw new HttpError(500, "Supabase client is unavailable.");
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new HttpError(401, "You must be signed in.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    throw new HttpError(403, "Profile not found.");
  }

  return profile as Profile;
}

export async function requireAdmin() {
  const profile = await getCurrentProfile();

  if (profile.role !== "admin") {
    throw new HttpError(403, "Admin access required.");
  }

  return profile;
}
