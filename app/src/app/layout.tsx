import type { Metadata } from "next";
import { DM_Mono, DM_Sans, Syne } from "next/font/google";
import "./globals.css";
import TopBar from "@/components/TopBar";
import Sidebar from "@/components/Sidebar";
import RegulationModal from "@/components/RegulationModal";
import { RegulationModalProvider } from "@/context/RegulationModalContext";
import { getRegulations } from "@/lib/data";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-syne",
});
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-sans",
});
const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
});

export const metadata: Metadata = {
  title: "Bravo Ai — Regulatory Intelligence",
  description: "UK financial regulatory monitoring and compliance dashboard.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const regulations = await getRegulations();

  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable} ${dmMono.variable}`}>
      <body suppressHydrationWarning>
        <RegulationModalProvider regulations={regulations}>
          <div className="app-shell">
            <TopBar />
            <div className="body">
              <Sidebar />
              <div className="content">{children}</div>
            </div>
          </div>
          <RegulationModal />
        </RegulationModalProvider>
      </body>
    </html>
  );
}
