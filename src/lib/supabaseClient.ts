// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'
import process from "node:process"
const SUPABASE_PROJECT_URL = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
export const supabase = createClient(SUPABASE_PROJECT_URL, SUPABASE_ANON_KEY)
