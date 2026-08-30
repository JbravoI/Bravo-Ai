import type { Metadata } from "next";
import { DM_Mono, DM_Sans, Syne } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";
import { getJurisdictions, getRegulations, getRegulationsForSources } from "@/lib/data";
import { getUserPreferences } from "@/lib/preferences";
import { selectedJurisdictionCode, sourcesForJurisdiction } from "@/lib/jurisdictions";
import { auth } from "@/auth";

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
  const session = await auth();
  const jurisdictions = session?.user?.id ? await getJurisdictions() : [];
  const preferences = session?.user?.id ? await getUserPreferences(session.user.id) : null;
  const jurisdictionCode = selectedJurisdictionCode(preferences?.activeJurisdictionCodes, jurisdictions.map((jurisdiction) => jurisdiction.code));
  const regulations = session?.user?.id && jurisdictionCode
    ? await getRegulationsForSources(sourcesForJurisdiction(jurisdictionCode))
    : await getRegulations();

  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable} ${dmMono.variable}`}>
      <body suppressHydrationWarning>
        <AppShell regulations={regulations}>{children}</AppShell>
      </body>
    </html>
  );
}
