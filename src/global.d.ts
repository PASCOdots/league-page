/// <reference types="@sveltejs/kit" />

interface ImportMetaEnv {
  readonly VITE_LEAGUE_ID_PAP: string;
  readonly VITE_LEAGUE_ID_PI: string;
  readonly VITE_LEAGUE_NAME: string;
  readonly VITE_HOMEPAGE_TEXT: string;
  readonly VITE_BACKEND_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
