// Typed read of window._env_, the platform's runtime config (mounted as
// /env-config.js — see index.html). Never build-time (import.meta.env.VITE_*
// etc.); the platform injects this at request time and it differs per
// environment. Throw on a missing key rather than default it — a silent
// fallback hides a missing OIDC issuer.
type Env = {
  // user-auth (thunder-app platform-resource) — see thunder-authentication
  USER_AUTH_CLIENT_ID: string;
  USER_AUTH_ISSUER: string;
  USER_AUTH_JWKS_URL: string;
  USER_AUTH_SCOPES: string;
};

declare global {
  interface Window {
    _env_: Env;
  }
}

if (!window._env_) {
  throw new Error(
    "window._env_ not set — /env-config.js failed to load. " +
      "The platform mounts this file; if you see this locally, host " +
      "/env-config.js from your dev server.",
  );
}

export const env: Env = window._env_;
