import { useEffect, type JSX } from "react";
import { useNavigate } from "react-router";
import { Box, CircularProgress } from "@wso2/oxygen-ui";
import { handleCallback } from "../auth";

/** The SPA's `/callback` route — Thunder redirects here after sign-in. */
export default function CallbackPage(): JSX.Element {
  const navigate = useNavigate();

  useEffect(() => {
    void handleCallback()
      .catch(() => undefined)
      .then(() => navigate("/", { replace: true }));
  }, [navigate]);

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <CircularProgress />
    </Box>
  );
}
