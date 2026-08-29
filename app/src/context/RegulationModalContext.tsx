"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Regulation } from "@/lib/types";

interface RegulationModalContextValue {
  regulations: Regulation[];
  openId: number | null;
  openModal: (id: number) => void;
  closeModal: () => void;
}

const RegulationModalContext = createContext<RegulationModalContextValue | null>(null);

export function RegulationModalProvider({
  regulations,
  children,
}: {
  regulations: Regulation[];
  children: ReactNode;
}) {
  const [openId, setOpenId] = useState<number | null>(null);

  const value = useMemo(
    () => ({
      regulations,
      openId,
      openModal: (id: number) => setOpenId(id),
      closeModal: () => setOpenId(null),
    }),
    [regulations, openId],
  );

  return <RegulationModalContext.Provider value={value}>{children}</RegulationModalContext.Provider>;
}

export function useRegulationModal() {
  const ctx = useContext(RegulationModalContext);
  if (!ctx) {
    throw new Error("useRegulationModal must be used within a RegulationModalProvider");
  }
  return ctx;
}
