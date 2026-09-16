import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { OxygenUIThemeProvider, OxygenTheme } from "@wso2/oxygen-ui";
import App from "./App";

// Dev-only, dynamic-import-guarded. `import.meta.env.DEV` is statically false
// in a production build, so this branch and the msw chunk are both eliminated.
async function enableMocking(): Promise<void> {
  if (!import.meta.env.DEV || import.meta.env.MODE !== "mock") return;
  const { startMockWorker } = await import("../mock/browser");
  await startMockWorker();
}

void enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <OxygenUIThemeProvider theme={OxygenTheme}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </OxygenUIThemeProvider>
    </StrictMode>,
  );
});
