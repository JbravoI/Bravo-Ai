"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { Regulation } from "@/lib/types";
import AuthSessionProvider from "./AuthSessionProvider";
import RegulationModal from "./RegulationModal";
import SessionTimeout from "./SessionTimeout";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import TopBar from "./TopBar";
import { RegulationModalProvider } from "@/context/RegulationModalContext";

const PUBLIC_PATHS = new Set(["/", "/login", "/signup", "/api-docs"]);

export default function AppShell({ children, regulations }: { children: ReactNode; regulations: Regulation[] }) {
  const pathname = usePathname();

  if (PUBLIC_PATHS.has(pathname)) return <>{children}</>;

  return (
    <AuthSessionProvider>
      <SessionTimeout />
      <RegulationModalProvider regulations={regulations}>
        <div className="app-shell">
          <TopBar />
          <MobileNav />
          <div className="body">
            <Sidebar />
            <main className="content">{children}</main>
          </div>
        </div>
        <RegulationModal />
      </RegulationModalProvider>
    </AuthSessionProvider>
  );
}
