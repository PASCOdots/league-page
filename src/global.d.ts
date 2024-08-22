/// <reference types="@sveltejs/kit" />

interface ImportMetaEnv {
    readonly VITE_LEAGUE_ID: string;
    readonly VITE_LEAGUE_NAME: string;
    readonly VITE_HOMEPAGE_TEXT: string
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }