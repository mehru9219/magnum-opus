"use client";

import { ConvexProvider as BaseConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, useMemo } from "react";

export function ConvexProvider({ children }: { children: ReactNode }) {
  const convex = useMemo(
    () =>
      new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL as string),
    []
  );

  return <BaseConvexProvider client={convex}>{children}</BaseConvexProvider>;
}
