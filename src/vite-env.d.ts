/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_CLUB_SLUG?: string;
  // Deployed public onboarding-form host (sportsweb-onboarding.vercel.app).
  readonly VITE_ONBOARDING_URL?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
