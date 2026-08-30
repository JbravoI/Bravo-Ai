"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRegulationModal } from "@/context/RegulationModalContext";
import { useSession } from "next-auth/react";

const NAV = [
  {
    section: "Monitor",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: "◼" },
      { href: "/alerts", label: "Alerts", icon: "⚡" },
      { href: "/compliance", label: "Compliance", icon: "✓" },
    ],
  },
  {
    section: "Analysis",
    items: [
      { href: "/search", label: "Search & Q&A", icon: "⌕" },
      { href: "/impact", label: "Impact Map", icon: "◈" },
    ],
  },
  {
    section: "Settings",
    items: [
      { href: "/audit", label: "Audit Trail", icon: "≡" },
      { href: "/prefs", label: "Preferences", icon: "⚙" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { unreadCount } = useRegulationModal();
  const { data: session } = useSession();

  return (
    <nav className="sidebar" aria-label="Primary">
      {NAV.map((group) => (
        <div key={group.section}>
          <div className="sb-section">{group.section}</div>
          {group.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${pathname === item.href ? "active" : ""}`}
              aria-current={pathname === item.href ? "page" : undefined}
            >
              <span className="nav-icon">{item.icon}</span> {item.label}
              {item.href === "/alerts" && unreadCount > 0 && <span className="nav-badge">{unreadCount}</span>}
            </Link>
          ))}
        </div>
      ))}
      {session?.user.role === "admin" && <div><div className="sb-section">Administration</div><Link href="/admin" className={`nav-item ${pathname === "/admin" ? "active" : ""}`} aria-current={pathname === "/admin" ? "page" : undefined}><span className="nav-icon">♛</span> Admin dashboard</Link></div>}
    </nav>
  );
}
