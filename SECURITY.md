# SECURITY.md

**Audit Date:** 2026-07-13

## Threat Verification

| Threat ID | Category | Disposition | Evidence | Status |
|-----------|----------|-------------|----------|--------|
| T-07 | Dockerfile — Prisma engine missing | mitigate | `Dockerfile:46` — `COPY --from=builder /app/node_modules/.prisma /app/node_modules/.prisma` present in runner stage | CLOSED |

## Summary

- **Total Threats:** 1
- **Closed:** 1
- **Open:** 0
- **ASVS Level:** 1
