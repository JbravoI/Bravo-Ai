"use client";

import { useState } from "react";

export default function TopBar() {
  // Simulated — Phase 5 wires this to a real ingestion run and a real timestamp.
  const [scanning, setScanning] = useState(false);
  const [label, setLabel] = useState("Last scan: just now");

  function scan() {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setLabel("Last scan: just now");
    }, 2200);
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
      </div>
    </div>
  );
}
