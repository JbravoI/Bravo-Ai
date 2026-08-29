"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

interface RegulationModalContextValue {
  openId: number | null;
  openModal: (id: number) => void;
  closeModal: () => void;
}

const RegulationModalContext = createContext<RegulationModalContextValue | null>(null);

export function RegulationModalProvider({ children }: { children: ReactNode }) {
  const [openId, setOpenId] = useState<number | null>(null);

  const value = useMemo(
    () => ({
      openId,
      openModal: (id: number) => setOpenId(id),
      closeModal: () => setOpenId(null),
    }),
    [openId],
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
