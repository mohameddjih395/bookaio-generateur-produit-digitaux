/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string
    readonly VITE_SUPABASE_ANON_KEY: string
    readonly VITE_BASE_WEBHOOK_URL: string
    readonly VITE_CLOUDINARY_URL: string
    readonly VITE_CLOUDINARY_UPLOAD_PRESET: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
