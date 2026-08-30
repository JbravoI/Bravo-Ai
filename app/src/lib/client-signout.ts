"use client";

import { signOut } from "next-auth/react";

export async function signOutAndClearOptionalNigeriaData() {
  try {
    await fetch("/api/session/optional-data", { method: "POST", credentials: "same-origin" });
  } finally {
    await signOut({ callbackUrl: "/" });
  }
}
