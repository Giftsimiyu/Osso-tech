import "server-only";
import { createClient } from "./supabase/server";

export async function isAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return !error && user?.app_metadata.role === "admin";
}
