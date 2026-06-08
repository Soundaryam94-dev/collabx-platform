import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const SUPABASE_URL = "https://wqvuekbbcltafvpvkmjh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxdnVla2JiY2x0YWZ2cHZrbWpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1NzI2ODIsImV4cCI6MjA5NjE0ODY4Mn0.w-ebbPCj_blnlD2ycUe-WVLe2SimYQoxSteD3uZLfuI";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}
