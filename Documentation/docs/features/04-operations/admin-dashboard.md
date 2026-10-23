# Feature: Admin Dashboard

## Product Intent

Give authorised administrators a scalable, safe view of platform access and password-reset requests without weakening the role, lockout or identity-verification controls.

## Current Behavior

- `/admin` is server-gated by `requireAdmin()`. It displays user totals, administrators, locked accounts and standard-access totals.
- The User access list supports email search; role (Admin, Analyst, Viewer) and account-status (Active, Locked) filters; sort by join date, recent sign-in or email; a clear action; and 10/20/30/50-row pagination.
- The Password reset requests list filters by pending/issued status, sorts by request date, supports clear filters and paginates at 10/20/30/50 rows.
- Role changes, account unlocks and reset-link issuance are still sent to authenticated administrator-only routes using the record id, not a page position or visible-row index.

## Related

- Traceability: `../../TRACEABILITY_MAP.md` → “Admin dashboard”
- Gherkin: `../../../features/04-operations/admin-dashboard.feature`
- Implementation: `../../../implementation/epic-08-information-navigation/`
