"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

const ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: "Invalid email or password.",
};

function LoginForm() {
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    // Let Auth.js handle the redirect itself (the default) instead of
    // parsing the response and navigating manually — the manual path
    // (redirect: false + router.push) left the user stuck on this page
    // with a valid session already set, since the client-side navigation
    // never actually fired. This is the same redirect flow already
    // verified via direct HTTP calls in Epic 03.
    await signIn("credentials", { email, password, callbackUrl: "/dashboard" });
  }

  return (
    <form className="auth-card" onSubmit={handleSubmit}>
      <div className="auth-title">Sign in to Bravo Ai</div>
      {urlError && <div className="error-msg">⚠ {ERROR_MESSAGES[urlError] ?? "Sign-in failed."}</div>}
      <div className="auth-field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          className="qa-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>
      <div className="auth-field">
        <label htmlFor="password">Password</label>
        <div className="password-input-wrap">
          <input
            id="password"
            type={passwordVisible ? "text" : "password"}
            className="qa-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <button
            type="button"
            className="password-visibility-toggle"
            aria-label={passwordVisible ? "Hide password" : "Show password"}
            aria-pressed={passwordVisible}
            onClick={() => setPasswordVisible((visible) => !visible)}
          >
            {passwordVisible ? (
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 4.2A10.8 10.8 0 0 1 12 4c5.4 0 9.2 5 10 8-0.3 1.1-1.1 2.6-2.4 4M6.1 6.1C3.9 7.7 2.5 10.2 2 12c0.8 3 4.6 8 10 8 1.3 0 2.5-0.3 3.6-0.8" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-8 10-8 10 8 10 8-3.6 8-10 8S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>
            )}
          </button>
        </div>
      </div>
      <button type="submit" className="btn btn-primary" disabled={busy}>
        {busy ? "Signing in…" : "Sign in"}
      </button>
      <div className="auth-switch">
        <Link href="/forgot-password">Forgot password?</Link><br />No account? <Link href="/signup">Create one</Link>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="auth-layout">
      <aside className="auth-intro" aria-label="About Bravo Ai">
        <div className="auth-brand"><span>Ω</span> Bravo <b>Ai</b></div>
        <p className="auth-eyebrow"><i /> Regulatory intelligence for financial services</p>
        <h1>Turn regulatory change into <em>confident action.</em></h1>
        <p className="auth-lead">Bravo Ai brings official regulatory updates, impact analysis and an audit trail into one focused workspace.</p>
        <div className="auth-benefits">
          <div><span>◈</span><p><strong>Stay ahead of change</strong>Monitor the bodies and jurisdictions relevant to your firm.</p></div>
          <div><span>↗</span><p><strong>Understand the impact</strong>Turn incoming publications into practical compliance work.</p></div>
          <div><span>✓</span><p><strong>Keep decisions traceable</strong>Maintain a clear record of alerts, scans and actions.</p></div>
        </div>
      </aside>
      <div className="auth-wrap">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
