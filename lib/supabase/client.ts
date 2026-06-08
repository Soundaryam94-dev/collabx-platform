import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL = "https://wqvuekbbcltafvpvkmjh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxdnVla2JiY2x0YWZ2cHZrbWpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1NzI2ODIsImV4cCI6MjA5NjE0ODY4Mn0.w-ebbPCj_blnlD2ycUe-WVLe2SimYQoxSteD3uZLfuI";

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
