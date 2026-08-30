"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRegulationModal } from "@/context/RegulationModalContext";
import { useSession } from "next-auth/react";

const ITEMS = [
  ["/dashboard", "Dashboard"], ["/alerts", "Alerts"], ["/compliance", "Compliance"],
  ["/search", "Search & Q&A"], ["/impact", "Impact Map"], ["/audit", "Audit Trail"], ["/prefs", "Preferences"],
] as const;

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { unreadCount } = useRegulationModal();
  const { data: session } = useSession();
  const items = session?.user.role === "admin" ? [...ITEMS, ["/admin", "Admin"] as const] : ITEMS;

  return (
    <div className="mobile-nav">
      <button type="button" className="mobile-nav-toggle" aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen((value) => !value)}>
        {open ? "Close menu" : "Menu"}
      </button>
      {open && (
        <nav id="mobile-navigation" className="mobile-nav-panel" aria-label="Mobile primary navigation">
          {items.map(([href, label]) => (
            <Link key={href} href={href} className={`mobile-nav-link ${pathname === href ? "active" : ""}`} onClick={() => setOpen(false)}>
              {label}{href === "/alerts" && unreadCount > 0 && <span className="nav-badge">{unreadCount}</span>}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
