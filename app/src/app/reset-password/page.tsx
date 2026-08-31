"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (password !== confirmPassword) { setMessage("Passwords do not match."); return; }
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/password-reset/confirm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error ?? "Could not reset password.");
      setMessage("Password reset successfully. You can now sign in.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not reset password."); }
    finally { setBusy(false); }
  }

  if (!token) return <div className="auth-wrap"><div className="auth-card"><div className="auth-title">Invalid reset link</div><p className="auth-sub">Request a new password reset link from the sign-in page.</p><div className="auth-switch"><Link href="/forgot-password">Request reset</Link></div></div></div>;
  return <div className="auth-wrap"><form className="auth-card" onSubmit={submit}>
    <div className="auth-title">Choose a new password</div><p className="auth-sub">This one-time link expires 30 minutes after an administrator issues it.</p>
    <div className="auth-field"><label htmlFor="password">New password</label><input id="password" type="password" minLength={8} className="qa-input" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="new-password" /></div>
    <div className="auth-field"><label htmlFor="confirmPassword">Confirm new password</label><input id="confirmPassword" type="password" minLength={8} className="qa-input" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required autoComplete="new-password" /></div>
    {message && <p className="auth-reset-message" role="status">{message}</p>}
    <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? "Resetting…" : "Reset password"}</button>
    <div className="auth-switch"><Link href="/login">Back to sign in</Link></div>
  </form></div>;
}

export default function ResetPasswordPage() { return <Suspense fallback={null}><ResetPasswordForm /></Suspense>; }
