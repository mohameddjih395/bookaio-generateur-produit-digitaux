import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fail fast with a clear error if env vars are missing
if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
        '[BookAIO] Variables d\'environnement Supabase manquantes. ' +
        'Vérifiez que VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont définis dans votre fichier .env.local'
    );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        // Persist session in localStorage (standard for SPAs)
        persistSession: true,
        autoRefreshToken: true,
    },
});
