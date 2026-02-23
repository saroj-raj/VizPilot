import { createClient } from '@supabase/supabase-js'

// Lazy initialize supabase only in browser to avoid build-time errors when env vars are unset
let supabaseInstance: ReturnType<typeof createClient> | null = null

export function getSupabase() {
  if (typeof window === 'undefined') {
    // Server-side: return a placeholder to prevent errors during build
    throw new Error('Supabase client should not be used on the server side')
  }

  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('supabaseUrl and supabaseAnonKey are required')
    }

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  }

  return supabaseInstance
}

// For backwards compatibility, provide a lazy-loaded export
export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get: (_target, prop) => {
    return getSupabase()[prop as keyof ReturnType<typeof createClient>]
  },
})
