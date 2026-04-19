/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 브라우저에서 OpenAI 호출 시 (프로덕션은 백엔드 프록시 권장) */
  readonly VITE_OPENAI_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
