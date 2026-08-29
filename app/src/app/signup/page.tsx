"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setBusy(false);
      setError(data?.error ?? "Signup failed.");
      return;
    }

    // Let Auth.js handle the post-sign-in redirect itself, same as the
    // login page — see the comment there for why the manual
    // redirect:false + router.push pattern didn't reliably navigate away.
    await signIn("credentials", { email, password, callbackUrl: "/dashboard" });
  }

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-title">Create your Bravo Ai account</div>
        <div className="auth-sub">Password must be at least 8 characters.</div>
        {error && <div className="error-msg">⚠ {error}</div>}
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
            minLength={8}
            autoComplete="new-password"
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? "Creating account…" : "Create account"}
        </button>
        <div className="auth-switch">
          Already have an account? <Link href="/login">Sign in</Link>
        </div>
      </form>
    </div>
  );
}
