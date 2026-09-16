import { currentUser } from "../auth";

/** The caller's opaque subject id — used only to tell "mine" apart from
 * "someone else's" in the UI (e.g. Owner vs Collaborator, Leave vs Remove).
 * The backend is the actual authority: it resolves the caller from the
 * bearer token via the gateway, never from a value this module hands it. */
export async function currentUserId(): Promise<string | null> {
  const user = await currentUser();
  return user?.profile?.sub ?? null;
}
