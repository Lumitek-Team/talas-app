import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials missing. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.");
}

// Default client with anon key
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
});

// Cache for the authenticated client to prevent multiple instances
let authenticatedClient: ReturnType<typeof createClient> | null = null;
let lastToken: string | null = null;

/**
 * Creates or retrieves a memoized Supabase client with a custom auth token.
 * 
 * @param token - The JWT token from Clerk
 */
export const createClerkSupabaseClient = (token: string) => {
  // Return cached client if token is the same
  if (authenticatedClient && lastToken === token) {
    return authenticatedClient;
  }

  lastToken = token;
  authenticatedClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false, // Prevents "Multiple GoTrueClient instances" warning
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
  
  return authenticatedClient;
};
