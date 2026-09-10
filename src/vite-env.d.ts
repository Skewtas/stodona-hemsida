/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** "true" slår på chattbubblan. Sätts i Vercel, se api/chat.ts. */
  readonly VITE_CHAT_ENABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
