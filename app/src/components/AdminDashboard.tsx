"use client";

import { useMemo, useState } from "react";
import type { ManagedUser, UserRole } from "@/lib/users";
import type { ManagedPasswordResetRequest } from "@/lib/password-reset";
import { formatDateTime } from "@/lib/dates";

const ROLE_LABEL: Record<UserRole, string> = { admin: "Admin", analyst: "Analyst", viewer: "Viewer" };

export default function AdminDashboard({ initialUsers, initialPasswordResetRequests }: { initialUsers: ManagedUser[]; initialPasswordResetRequests: ManagedPasswordResetRequest[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [passwordResetRequests, setPasswordResetRequests] = useState(initialPasswordResetRequests);
  const [issuedResetLink, setIssuedResetLink] = useState("");
  const filtered = useMemo(() => users.filter((user) => user.email.includes(query.trim().toLowerCase())), [users, query]);
  const locked = users.filter((user) => user.locked).length;
  const admins = users.filter((user) => user.role === "admin").length;

  async function updateUser(id: string, body: { role?: UserRole; unlock?: boolean }) {
    setBusyId(id); setMessage("");
    try {
      const response = await fetch(`/api/admin/users/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error ?? "Could not update user.");
      setUsers(data.users);
      setMessage(body.unlock ? "Account unlocked." : "Role updated.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not update user."); }
    finally { setBusyId(null); }
  }

  async function issueResetLink(requestId: string) {
    setBusyId(requestId); setMessage("");
    try {
      const response = await fetch("/api/admin/password-resets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ requestId }) });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error ?? "Could not issue reset link.");
      const copied = await navigator.clipboard.writeText(data.resetUrl).then(() => true).catch(() => false);
      setPasswordResetRequests((current) => current.map((item) => item.id === requestId ? { ...item, status: "issued", expiresAt: data.expiresAt } : item));
      setIssuedResetLink(data.resetUrl);
      setMessage(copied ? "One-time reset link copied. Verify the requester’s identity before sharing it." : "One-time reset link issued. Copy it from the field below after verifying identity.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not issue reset link."); }
    finally { setBusyId(null); }
  }

  return <div className="page admin-page">
    <div className="section-header"><div><h1 className="admin-title">Administration</h1><p className="admin-subtitle">Platform access, account security, and user roles.</p></div><span className="pill live">Admin console</span></div>
    <div className="stats-grid">
      <div className="stat-card"><span className="stat-label">Total users</span><strong className="stat-value">{users.length}</strong><span className="stat-delta">Registered accounts</span></div>
      <div className="stat-card"><span className="stat-label">Administrators</span><strong className="stat-value">{admins}</strong><span className="stat-delta up">Role holders</span></div>
      <div className="stat-card"><span className="stat-label">Locked accounts</span><strong className="stat-value">{locked}</strong><span className={`stat-delta ${locked ? "warn" : "up"}`}>{locked ? "Needs review" : "None"}</span></div>
      <div className="stat-card"><span className="stat-label">Analysts & viewers</span><strong className="stat-value">{users.length - admins}</strong><span className="stat-delta">Standard access</span></div>
    </div>
    <section className="admin-card">
      <div className="section-header"><div><h2 className="section-title">User access</h2><span className="section-sub">Manage roles and unlock accounts after three failed sign-in attempts.</span></div><input className="admin-search" aria-label="Search users" placeholder="Search email…" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
      {message && <p className="admin-message" role="status">{message}</p>}
      <div className="table-wrap"><table><thead><tr><th>User</th><th>Role</th><th>Account status</th><th>Last sign-in</th><th>Actions</th></tr></thead><tbody>
        {filtered.map((user) => <tr key={user.id}><td><strong>{user.email}</strong><br /><span className="admin-muted">Joined {formatDateTime(user.createdAt)}</span></td><td><select className="admin-role-select" value={user.role} disabled={busyId === user.id} onChange={(event) => updateUser(user.id, { role: event.target.value as UserRole })}>{Object.entries(ROLE_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></td><td>{user.locked ? <span className="badge badge-high">Locked · {user.failedLoginAttempts} attempts</span> : <span className="badge badge-impl">Active</span>}</td><td className="admin-muted">{user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "Never"}</td><td>{user.locked && <button className="btn btn-primary" disabled={busyId === user.id} onClick={() => updateUser(user.id, { unlock: true })}>{busyId === user.id ? "…" : "Unlock"}</button>}</td></tr>)}
        {!filtered.length && <tr><td colSpan={5} className="admin-muted">No users match that search.</td></tr>}
      </tbody></table></div>
    </section>
    <section className="admin-card">
      <div className="section-header"><div><h2 className="section-title">Password reset requests</h2><span className="section-sub">Verify identity outside the product before issuing and sharing a one-time link.</span></div><span className="pill">{passwordResetRequests.length} open</span></div>
      <div className="table-wrap"><table><thead><tr><th>Account</th><th>Requested</th><th>Status</th><th>Action</th></tr></thead><tbody>
        {passwordResetRequests.map((request) => <tr key={request.id}><td><strong>{request.email}</strong></td><td className="admin-muted">{formatDateTime(request.requestedAt)}</td><td>{request.status === "pending" ? <span className="badge badge-pending">Awaiting verification</span> : <span className="badge badge-impl">Link active until {request.expiresAt ? formatDateTime(request.expiresAt) : "—"}</span>}</td><td>{request.status === "pending" && <button className="btn btn-primary" disabled={busyId === request.id} onClick={() => issueResetLink(request.id)}>{busyId === request.id ? "Issuing…" : "Issue & copy link"}</button>}</td></tr>)}
        {!passwordResetRequests.length && <tr><td colSpan={4} className="admin-muted">No open password reset requests.</td></tr>}
      </tbody></table></div>
      {issuedResetLink && <div className="admin-reset-link"><label htmlFor="issued-reset-link">Latest one-time reset link</label><input id="issued-reset-link" readOnly value={issuedResetLink} onFocus={(event) => event.currentTarget.select()} /></div>}
    </section>
  </div>;
}
