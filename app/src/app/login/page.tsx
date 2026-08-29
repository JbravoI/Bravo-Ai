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
    await signIn("credentials", { email, password, callbackUrl: "/" });
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
        <input
          id="password"
          type="password"
          className="qa-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </div>
      <button type="submit" className="btn btn-primary" disabled={busy}>
        {busy ? "Signing in…" : "Sign in"}
      </button>
      <div className="auth-switch">
        No account? <Link href="/signup">Create one</Link>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="auth-wrap">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
