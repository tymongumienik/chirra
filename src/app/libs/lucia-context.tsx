"use client";

import { createContext, useContext } from "react";
import type { LuciaContextValue } from "@/types/database";

export const LuciaContext = createContext<LuciaContextValue>({
  user: null,
  session: null,
});

export function LuciaProvider({
  value,
  children,
}: {
  value: LuciaContextValue;
  children: React.ReactNode;
}) {
  return (
    <LuciaContext.Provider value={value}>{children}</LuciaContext.Provider>
  );
}

export const useLuciaContext = () => useContext(LuciaContext);
