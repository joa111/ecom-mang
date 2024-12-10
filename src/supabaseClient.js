import { createClient } from '@supabase/supabase-js';

// Add error checking
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing Supabase URL. Check your .env file.');
}

if (!supabaseAnonKey) {
  throw new Error('Missing Supabase Anon Key. Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey,{
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});