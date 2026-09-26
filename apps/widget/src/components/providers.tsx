import { Provider } from "jotai";
import type * as React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  return <Provider>{children}</Provider>;
}
