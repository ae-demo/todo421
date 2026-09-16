import { useEffect, useState, type JSX } from "react";
import { Box, CircularProgress } from "@wso2/oxygen-ui";
import { currentUser, signIn } from "../auth";

/**
 * Gates every signed-in route. A signed-out visitor is redirected into
 * Thunder SSO before any todo data renders — no in-app login form, no todo
 * screen is reachable until `currentUser()` resolves a session.
 */
export default function AuthGate({ children }: { children: JSX.Element }): JSX.Element | null {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void currentUser().then((user) => {
      if (cancelled) return;
      if (user) {
        setReady(true);
      } else {
        void signIn();
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return children;
}
