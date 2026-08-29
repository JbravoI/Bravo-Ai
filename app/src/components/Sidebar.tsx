"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  {
    section: "Monitor",
    items: [
      { href: "/", label: "Dashboard", icon: "◼" },
      { href: "/alerts", label: "Alerts", icon: "⚡", badge: "7" },
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
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}
