// window._env_ under `--mode mock` — exactly the keys src/env.ts declares.
export const mockEnv = {
  USER_AUTH_CLIENT_ID: "mock-client",
  USER_AUTH_ISSUER: "https://mock-idp.test",
  USER_AUTH_JWKS_URL: "https://mock-idp.test/.well-known/jwks.json",
  USER_AUTH_SCOPES: "openid profile email group ou",
};
