import { LoaderIcon } from "lucide-react";
import { StrictMode, Suspense } from "react";
import ReactDOM from "react-dom/client";
import { Providers } from "@/components/providers";
import { App } from "./App";
import "./index.css";

const rootElement = document.getElementById("app");

if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <Providers>
        <Suspense
          fallback={
            <div className="flex min-h-[100dvh] w-full items-center justify-center bg-background text-muted-foreground">
              <LoaderIcon aria-hidden className="size-8 animate-spin" />
            </div>
          }
        >
          <App />
        </Suspense>
      </Providers>
    </StrictMode>,
  );
}
