import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://gwwexjfpqjfaxkvshggn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3d2V4amZwcWpmYXhrdnNoZ2duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NjkzNTQsImV4cCI6MjA2MzM0NTM1NH0.6NA3nPAeq4DiYl64J5N5j9rtEJIe30RqNrnBXrrJhlU";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
