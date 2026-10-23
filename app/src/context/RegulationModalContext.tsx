"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Regulation } from "@/lib/types";

interface RegulationModalContextValue {
  regulations: Regulation[];
  regulatorFilters: string[];
  openId: number | null;
  unreadCount: number;
  openModal: (id: number) => void;
  markAllRead: () => Promise<void>;
  closeModal: () => void;
}

const RegulationModalContext = createContext<RegulationModalContextValue | null>(null);

export function RegulationModalProvider({
  regulations,
  regulatorFilters = [],
  children,
}: {
  regulations: Regulation[];
  regulatorFilters?: string[];
  children: ReactNode;
}) {
  const [openId, setOpenId] = useState<number | null>(null);
  const [readIds, setReadIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    let active = true;
    fetch("/api/alert-reads")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && Array.isArray(data?.regulationIds)) {
          setReadIds(new Set(data.regulationIds.filter((id: unknown) => Number.isInteger(id))));
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const openModal = useCallback((id: number) => {
    setOpenId(id);
    if (readIds.has(id)) return;

    setReadIds((current) => new Set(current).add(id));
    void fetch("/api/alert-reads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ regulationId: id }),
    }).then((res) => {
      if (!res.ok) setReadIds((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
    }).catch(() => setReadIds((current) => {
      const next = new Set(current);
      next.delete(id);
      return next;
    }));
  }, [readIds]);

  const markAllRead = useCallback(async () => {
    const visibleIds = regulations.map((regulation) => regulation.id);
    // Acknowledgement is intentionally immediate in the UI; if the protected
    // write fails, reload the persisted state rather than leaving a false zero.
    setReadIds((current) => new Set([...current, ...visibleIds]));
    const response = await fetch("/api/alert-reads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark-all" }),
    }).catch(() => null);
    if (!response?.ok) {
      const persisted = await fetch("/api/alert-reads")
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => null);
      if (Array.isArray(persisted?.regulationIds)) {
        setReadIds(new Set(persisted.regulationIds.filter((id: unknown) => Number.isInteger(id))));
      }
      return;
    }

    const data = await response.json().catch(() => null);
    if (!Array.isArray(data?.regulationIds)) return;
    setReadIds((current) => new Set([...current, ...data.regulationIds.filter((id: unknown) => Number.isInteger(id))]));
  }, [regulations]);

  const unreadCount = regulations.filter((regulation) => !readIds.has(regulation.id)).length;

  const value = useMemo(
    () => ({
      regulations,
      regulatorFilters,
      openId,
      unreadCount,
      openModal,
      markAllRead,
      closeModal: () => setOpenId(null),
    }),
    [regulations, regulatorFilters, openId, unreadCount, openModal, markAllRead],
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
