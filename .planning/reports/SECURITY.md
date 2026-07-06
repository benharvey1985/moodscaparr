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
| H2 | Admin routes not in middleware; page relies on client-side role check | `middleware.ts` + `app/admin/page.tsx` | Add `/admin/:path*` to middleware matcher; add server-side role redirect in admin layout |

### MEDIUM (10)

| # | Issue | File | Fix |
|---|-------|------|-----|
| M1 | No `.max(500)` on reflection strings in import schema | `app/api/user/import/route.ts` | Add `.max()` constraints to match create schema |
| M2 | User input in feedback URL params not sanitized | `app/api/feedback/route.ts` | Strip control characters, add length limits |
| M3 | No security headers (CSP, X-Frame-Options, HSTS) | `middleware.ts` | Add headers via middleware or next.config.ts |
| M4 | No Zod validation on admin user update | `app/api/admin/users/[id]/route.ts` | Add Zod schema for role/ban fields |
| M5 | No Zod validation on invite code creation | `app/api/admin/invite-codes/route.ts` | Add Zod validation for maxUses/expiresAt |
| M6 | CSV formula injection risk | `components/history/csv-export.tsx` | Sanitize values starting with `=`, `+`, `-`, `@` |
| M7 | No rate limiting anywhere | All API routes | Implement on auth endpoints + data import |
| M8 | No CSRF protection for cookie-based auth | All API routes | Verify SameSite cookie config; consider CSRF tokens |
| M9 | No audit trail for sensitive operations | All API routes | Add structured logging for auth/admin events |
| M10 | No Content-Security-Policy | `middleware.ts` / `next.config.ts` | Add CSP header |

### LOW (10)

| # | Issue | File | Fix |
|---|-------|------|-----|
| L1 | No explicit session cookie config | `lib/auth.ts` | Explicitly set httpOnly/sameSite/secure |
| L2 | No DATABASE_URL validation | `lib/prisma.ts` | Add env var check with clear error message |
| L3 | No Zod validation on SSO toggle | `app/api/admin/sso/route.ts` | Add simple Zod schema |
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

Planned threats from Phase 1 PLAN.md were verified against the implementation:

| Threat ID | Category | Status | Notes |
|-----------|----------|--------|-------|
| T-01-01 | Spoofing — Auth login | ✅ Mitigated | Better Auth handles password hashing |
| T-01-02 | Tampering — Auth middleware | ✅ Mitigated | Session validated on every request |
| T-01-03 | Repudiation — Registration | ✅ Accepted | Timestamps on user records |
| T-01-04 | Info Disclosure — Password reset | ✅ Mitigated | Generic success message |
| T-01-05 | DoS — Auth endpoints | ⚠️ Partial | No explicit rate limiting configured |
| T-01-06 | Priv Esc — Admin assignment | ✅ Mitigated | databaseHooks correctly limits to first user |
| T-01-07 | Tampering — Mood entry API | ✅ Mitigated | Zod validation + userId from session + ownership checks |
| T-01-08 | Info Disclosure — Entry list | ✅ Mitigated | Scoped to session.user.id |
| T-01-09 | Priv Esc — Edit/Delete | ✅ Mitigated | Ownership verified on every mutation |
| T-01-10 | Data Loss — Wizard close | ✅ Mitigated | localStorage draft buffer |
| T-01-11 | DoS — Seed endpoint | ✅ Mitigated | Admin-only access |
| T-01-12 | Data Loss — Clear seed | ✅ Accepted | Admin-only, logged |

---

## Recommendations (Priority Order)

1. **H1** — Remove email from feedback body in `app/api/feedback/route.ts`
2. **H2** — Add `/admin/:path*` to middleware matcher + server-side role check
3. **M4/M5/M3** — Add Zod validation to admin mutation endpoints + security headers
4. **M6** — Protect CSV export against formula injection
5. **M7** — Add rate limiting to auth endpoints
6. **M8/M9** — CSRF protection + audit logging
7. **L1-L10** — Address low-priority items as convenient

---

*Generated: 2026-07-06*
