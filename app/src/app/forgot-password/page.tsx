"use client";

import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/password-reset/request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error ?? "Could not submit the request.");
      setMessage(data?.message ?? "Your request has been submitted.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not submit the request."); }
    finally { setBusy(false); }
  }

  return <div className="auth-wrap"><form className="auth-card" onSubmit={submit}>
    <div className="auth-title">Reset your password</div>
    <p className="auth-sub">Enter your account email. An administrator will verify the request and give you a one-time reset link.</p>
    <div className="auth-field"><label htmlFor="email">Account email</label><input id="email" type="email" className="qa-input" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></div>
    {message && <p className="auth-reset-message" role="status">{message}</p>}
    <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? "Submitting…" : "Request reset"}</button>
    <div className="auth-switch"><Link href="/login">Back to sign in</Link></div>
  </form></div>;
}
