"use client";

import { ReactNode } from "react";
import { ClerkProvider } from "./clerk-provider";
import { ConvexProvider } from "./convex-provider";
import { AnalyticsProvider } from "./analytics-provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <ConvexProvider>
        <AnalyticsProvider>{children}</AnalyticsProvider>
      </ConvexProvider>
    </ClerkProvider>
  );
}
