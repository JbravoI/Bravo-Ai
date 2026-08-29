"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import "swagger-ui-dist/swagger-ui.css";

type SwaggerUIBundle = ((config: Record<string, unknown>) => void) & {
  presets: { apis: unknown };
  plugins: { DownloadUrl: unknown };
};

declare global {
  interface Window {
    SwaggerUIBundle?: SwaggerUIBundle;
  }
}

export default function ApiDocsPage() {
  const [bundleReady, setBundleReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bundleReady) return;
    const bundle = window.SwaggerUIBundle;
    if (!bundle || !containerRef.current) return;

    bundle({
      url: "/api/openapi.json",
      domNode: containerRef.current,
      presets: [bundle.presets.apis],
      plugins: [bundle.plugins.DownloadUrl],
      layout: "BaseLayout",
      deepLinking: true,
    });
  }, [bundleReady]);

  return (
    <>
      <div style={{ background: "#fff", minHeight: "100vh" }}>
        <div ref={containerRef} />
      </div>
      <Script src="/swagger-static/swagger-ui-bundle.js" strategy="afterInteractive" onReady={() => setBundleReady(true)} />
    </>
  );
}
