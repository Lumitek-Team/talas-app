import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials missing. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.");
}

// Default client with anon key
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Creates a Supabase client with a custom auth token.
 * Useful for integrating Clerk with Supabase RLS.
 * 
 * @param token - The JWT token (e.g., from Clerk's getToken({ template: 'supabase' }))
 */
export const createClerkSupabaseClient = (token: string) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
};
