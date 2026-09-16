import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "./generated/todo-api";
import { getAccessToken, signIn } from "./auth";

const authMiddleware: Middleware = {
  async onRequest({ request }) {
    const token = await getAccessToken();
    if (token) {
      request.headers.set("Authorization", `Bearer ${token}`);
    }
    return request;
  },
  async onResponse({ response }) {
    if (response.status === 401) {
      await signIn();
    }
    return response;
  },
};

export const todoApi = createClient<paths>({ baseUrl: "/api" });
todoApi.use(authMiddleware);

// Every todo-api operation declares `X-User-Id` as a required path-level
// parameter, documented as "caller identity injected by the gateway from the
// validated token" — the gateway overwrites whatever a client sends (nginx's
// `/api` proxy explicitly blanks any inbound X-User-* header before the
// request ever reaches it, per react-webapp's Same-origin API proxy). The
// value below is therefore a required-but-discarded placeholder to satisfy
// the generated client's type, never a value anything trusts.
export const CALLER_HEADER = { "X-User-Id": "browser" } as const;
