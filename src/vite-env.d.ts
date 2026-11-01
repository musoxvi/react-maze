/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly REACT_APP_FIREBASE_KEY: string;
  readonly REACT_APP_FIREBASE_AUTH_DOMAIN: string;
  readonly REACT_APP_FIREBASE_PROYECT_ID: string;
  readonly REACT_APP_FIREBASE_STORAGE_BUKET: string;
  readonly REACT_APP_FIREBASE_MESSAGING_SENDER_ID: string;
  readonly REACT_APP_FIREBASE_APP_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.mov" {
  const src: string;
  export default src;
}
