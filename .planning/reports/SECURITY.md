# Moodscaparr Security Audit

**Audited:** 2026-07-06 | **Stack:** Next.js 16 + Better Auth 1.6 + Prisma 7 | **Status:** 0 critical, 2 high, 10 medium, 10 low findings

---

## Executive Summary

The codebase has a solid security foundation — all 22 API routes authenticate requests, Zod validation exists on most mutation endpoints, ownership checks are consistently applied, and error responses use generic messages. No critical vulnerabilities were identified.

**Two HIGH issues** need attention before production deployment: PII leakage in the feedback system and insufficient server-side protection on admin pages.

---

## Findings

### HIGH (2)

| # | Issue | File | Fix |
|---|-------|------|-----|
| H1 | User email leaked in GitHub issue URL body | `app/api/feedback/route.ts` | Remove email from feedback body sent to GitHub |
| H2 | Admin routes not in middleware; page relies on client-side role check | ~~`middleware.ts` + `app/admin/page.tsx`~~ | **✅ FIXED in v1.2** — See v1.2 audit for details. Server-side `requireAdmin()` in `app/(app)/admin/layout.tsx` replaces client-side check. |

### MEDIUM (10)

| # | Issue | File | Fix |
|---|-------|------|-----|
| M1 | No `.max(500)` on reflection strings in import schema | `app/api/user/import/route.ts` | Add `.max()` constraints to match create schema |
| M2 | User input in feedback URL params not sanitized | `app/api/feedback/route.ts` | Strip control characters, add length limits |
| M3 | No security headers (CSP, X-Frame-Options, HSTS) | ~~`middleware.ts`~~ | **Partially fixed:** CSP added in `next.config.ts` (v1.2). Still uses `unsafe-inline`/`unsafe-eval`. |
| M4 | No Zod validation on admin user update | `app/api/admin/users/[id]/route.ts` | **✅ Fixed** — Zod schema present |
| M5 | No Zod validation on invite code creation | `app/api/admin/invite-codes/route.ts` | **✅ Fixed** — Zod schema present |
| M6 | CSV formula injection risk | `components/history/csv-export.tsx` | Sanitize values starting with `=`, `+`, `-`, `@` |
| M7 | No rate limiting anywhere | All API routes | Implement on auth endpoints + data import |
| M8 | No CSRF protection for cookie-based auth | All API routes | Verify SameSite cookie config; consider CSRF tokens |
| M9 | No audit trail for sensitive operations | All API routes | **Partially fixed:** Audit logging added to admin mutation routes (v1.2) |
| M10 | No Content-Security-Policy | ~~`middleware.ts` / `next.config.ts`~~ | **✅ Fixed** — CSP added in `next.config.ts` (v1.2) |

### LOW (10)

| # | Issue | File | Fix |
|---|-------|------|-----|
| L1 | No explicit session cookie config | `lib/auth.ts` | Explicitly set httpOnly/sameSite/secure |
| L2 | No DATABASE_URL validation | `lib/prisma.ts` | Add env var check with clear error message |
| L3 | No Zod validation on SSO toggle | `app/api/admin/sso/route.ts` | **✅ Fixed** — Zod schema present |
| L4 | Import not wrapped in transaction | `app/api/user/import/route.ts` | Use `prisma.$transaction` |
| L5 | No max array size on import | `app/api/user/import/route.ts` | Add `z.array().max(1000)` |
| L6 | Silent error in CSV export catch block | `components/history/csv-export.tsx` | Show error toast |
| L7 | Full user object returned after soft-delete | `app/api/admin/users/[id]/route.ts` | Select only needed fields |
| L8 | Unused `@prisma/adapter-neon` dependency | `package.json` | Remove unused dep |
| L9 | New/unstable deps (better-invite 0.5.6, Zod 4.x, Prisma 7.x) | `package.json` | Monitor for security patches |
| L10 | No connection pool configuration | `lib/prisma.ts` | Configure pool limits |

### INFO (3)

| # | Issue | File | Notes |
|---|-------|------|-------|
| I1 | All 22 routes have auth checks | All API routes | Consistent pattern — good |
| I2 | Error responses use generic messages | All API routes | No stack trace leakage — good |
| I3 | Ownership checks return 404 (not 403) | `app/api/mood-entries/[id]/route.ts` | Prevents entry existence enumeration — good |

---

## Threat Model Verification

Planned threats from v1.2 phase plans (Phases 5–8) verified in `.planning/reports/SECURITY-v1.2.md`:

| Threat ID | Category | Status | Notes |
|-----------|----------|--------|-------|
| T-05-01 | Tampering — Directory names | ✅ CLOSED | Route group parentheses verified |
| T-05-02 | Tampering — NavItem interface | ✅ CLOSED | TS compile catches type errors |
| T-06-01 | Auth Bypass — requireAuth() | ✅ CLOSED | Server-side redirect before client code |
| T-06-02/03 | Spoofing/Info Disclosure — hydrateSession | ✅ N/A | Removed; not in API |
| T-06-04 | Info Disclosure — session leakage | ✅ CLOSED | No hydrateSession = no vector |
| T-07-01/04 | Spoofing — old directories | ✅ CLOSED | All 8 old dirs deleted |
| T-07-02 | Info Disclosure — settings metadata | ✅ CLOSED | No PII |
| T-07-03 | Priv Esc — Admin page | ✅ CLOSED | Server-side requireAdmin() layout |
| T-07-05 | Tampering — redundant requireAuth | ✅ CLOSED | Accepted; harmless |
| T-05/06/07-SC | Tampering — packages | ✅ CLOSED | Zero packages installed |

---

## Recommendations (Priority Order)

1. **H1** — Remove email from feedback body in `app/api/feedback/route.ts` (still open)
2. **M6** — Protect CSV export against formula injection
3. **M7** — Add rate limiting to auth endpoints
4. **M8** — CSRF protection
5. **M3 harden** — Add CSP nonces or tighten script-src in production
6. **L1-L10** — Address low-priority items as convenient

---

## v1.2 Audit Addendum

**Date:** 2026-07-14 | **Audit:** `.planning/reports/SECURITY-v1.2.md`

**Key changes verified:**
- **H2 FIXED:** Admin routes now have server-side `requireAdmin()` guard in `app/(app)/admin/layout.tsx` — replaces client-side `useEffect` role check
- **M3/M10 FIXED:** CSP headers added to `next.config.ts` (broad, not hardened)
- **M4/M5/L3 FIXED:** Zod validation added to admin mutation endpoints
- **M9 PARTIALLY FIXED:** Audit logging added to `/api/admin/users/[id]`, `/api/admin/invite-codes`, `/api/admin/sso`, `/api/admin/settings/[key]`

**Auth architecture (v1.2):**
- All authenticated pages under `app/(app)/` inherit `requireAuth()` from parent layout
- Admin pages additionally protected by `requireAdmin()` in nested layout
- All 8 old flat directories (that would bypass auth) deleted
- `components/header.tsx` fully removed with zero remaining imports
- Zero new API endpoints introduced
- Session handled via `authClient.useSession()` in client components only

**Verdict:** v1.2 introduces zero new vulnerabilities and fixes the critical H2 finding.

---

*Generated: 2026-07-06 | Updated: 2026-07-14 (v1.2 addendum)*
