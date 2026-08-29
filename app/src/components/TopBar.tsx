"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";

export default function TopBar() {
  const { data: session } = useSession();
  const [scanning, setScanning] = useState(false);
  const [label, setLabel] = useState("Last scan: —");

  async function scan() {
    setScanning(true);
    try {
      const res = await fetch("/api/scan", { method: "POST" });
      const data = await res.json();
      const when = new Date(data.scannedAt).toLocaleTimeString();
      setLabel(data.simulated ? `Last scan: ${when} (simulated)` : `Last scan: ${when}`);
    } catch {
      setLabel("Last scan: failed");
    } finally {
      setScanning(false);
    }
  }

  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="logo-mark">Ω</div>
        <div className="logo-text">
          Bravo<span> Ai</span>
        </div>
      </div>
      <div className="topbar-right">
        <span className="pill live">LIVE</span>
        <span className="pill">{label}</span>
        <button type="button" className="btn btn-primary" onClick={scan} disabled={scanning}>
          {scanning ? "⟳ Scanning…" : "⟳ Scan Now"}
        </button>
        {session?.user?.email && (
          <>
            <span className="pill" title={session.user.email}>
              {session.user.email}
            </span>
            <button type="button" className="btn btn-ghost" onClick={() => signOut({ callbackUrl: "/" })}>
              Sign out
            </button>
          </>
        )}
      </div>
    </div>
  );
}
