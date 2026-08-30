"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { signOutAndClearOptionalNigeriaData } from "@/lib/client-signout";

const IDLE_TIMEOUT_MS = 5 * 60 * 1000;
const SESSION_REFRESH_INTERVAL_MS = 60 * 1000;
const ACTIVITY_EVENTS = ["pointerdown", "pointermove", "keydown", "scroll", "touchstart", "focus"] as const;

export default function SessionTimeout() {
  const { status, update } = useSession();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const signingOutRef = useRef(false);
  const lastSessionRefreshRef = useRef(0);

  useEffect(() => {
    if (status !== "authenticated") return;

    const signOutForInactivity = () => {
      if (signingOutRef.current) return;
      signingOutRef.current = true;
      void signOutAndClearOptionalNigeriaData();
    };

    const resetIdleTimer = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(signOutForInactivity, IDLE_TIMEOUT_MS);
    };

    const recordActivity = () => {
      resetIdleTimer();

      if (Date.now() - lastSessionRefreshRef.current >= SESSION_REFRESH_INTERVAL_MS) {
        lastSessionRefreshRef.current = Date.now();
        void update();
      }
    };

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, recordActivity, { passive: true });
    }
    resetIdleTimer();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, recordActivity);
      }
    };
  }, [status, update]);

  return null;
}
