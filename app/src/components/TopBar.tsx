"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { formatDateTime } from "@/lib/dates";
import { signOutAndClearOptionalNigeriaData } from "@/lib/client-signout";

export default function TopBar() {
  const { data: session } = useSession();
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [label, setLabel] = useState("Last scan: —");

  function setLastScanLabel(value: string, newRecords?: number, changedRecords?: number) {
    const summary = typeof newRecords === "number" && typeof changedRecords === "number"
      ? ` · ${newRecords} new, ${changedRecords} changed`
      : "";
    setLabel(`Last scan: ${formatDateTime(value)}${summary}`);
  }

  useEffect(() => {
    let active = true;
    fetch("/api/scan")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.lastRun?.completedAt) {
          setLastScanLabel(data.lastRun.completedAt, data.lastRun.newRecords, data.lastRun.changedRecords);
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  async function scan() {
    setScanning(true);
    try {
      const res = await fetch("/api/scan", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Scan failed");
      setLastScanLabel(data.completedAt, data.newRecords, data.changedRecords);
      if (Array.isArray(data.errors) && data.errors.length) {
        setLabel(`Scan partially completed — ${data.errors.join("; ")}`);
      }
      router.refresh();
    } catch (error) {
      setLabel(`Scan failed — ${error instanceof Error ? error.message : "please retry"}`);
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
        <span className="pill" title={label}>{label}</span>
        <button type="button" className="btn btn-primary" onClick={scan} disabled={scanning}>
          {scanning ? "⟳ Scanning…" : "⟳ Scan Now"}
        </button>
        {session?.user?.email && (
          <>
            <span className="pill" title={session.user.email}>
              {session.user.name || session.user.email}
            </span>
            <button type="button" className="btn btn-ghost" onClick={() => void signOutAndClearOptionalNigeriaData()}>
              Sign out
            </button>
          </>
        )}
      </div>
    </div>
  );
}
