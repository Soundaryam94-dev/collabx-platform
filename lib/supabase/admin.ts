import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://wqvuekbbcltafvpvkmjh.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxdnVla2JiY2x0YWZ2cHZrbWpoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDU3MjY4MiwiZXhwIjoyMDk2MTQ4NjgyfQ.vsAjWvVkAu7GVY7lFG84NENwSD6JPrxQK_xfdNv503w";

export const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);
