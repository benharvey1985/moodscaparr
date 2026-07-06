# Pitfalls Research: Docker Deployment

## Critical Pitfalls

### 1. Prisma Migration at Runtime Needs node_modules
- `prisma migrate deploy` requires the Prisma CLI and engine binaries
- Next.js standalone output doesn't include these
- **Fix**: Copy `node_modules/prisma`, `node_modules/@prisma`, and `node_modules/.prisma` to runner stage

### 2. Alpine + Prisma Engine
- Prisma's default binary target is `linux-musl` for Alpine
- Need `openssl` and `libc6-compat` installed in runner
- **Fix**: `RUN apk add --no-cache openssl libc6-compat`

### 3. HOSTNAME Must Be 0.0.0.0
- Next.js standalone server defaults to `localhost` (loopback)
- Container only listens on loopback — unreachable from host
- **Fix**: `ENV HOSTNAME="0.0.0.0"` in runner stage

### 4. Missing public/ or .next/static
- Standalone output excludes `public/` and `.next/static/`
- Forgetting to copy them = missing CSS/images/favicon
- **Fix**: `COPY --from=builder /app/public ./public` and `COPY --from=builder /app/.next/static ./.next/static`

### 5. Database URL Points to Wrong Host
- Inside Docker, Postgres is at `db:5432` (service name), not `localhost:5432`
- The DATABASE_URL `.env` needs to use the service name
- **Fix**: Document `.env.example` with `DATABASE_URL=postgresql://moodscape:moodscape@db:5432/moodscape`

### 6. Secrets in Build Args
- Passing DATABASE_URL as `--build-arg` bakes it into image layers
- Anyone with `docker history` access can read it
- **Fix**: Pass secrets only at runtime via environment variables or `.env` file

### 7. RSC Pre-render at Build Time
- Next.js tries to statically pre-render pages during build
- If a page calls Prisma directly (not via auth/cookies/headers), build fails with missing DATABASE_URL
- **Fix**: Add `export const dynamic = "force-dynamic"` on any page that hits the DB directly

### 8. Tailwind CSS Missing in Standalone Output
- Tailwind v4 + @tailwindcss/postcss uses native binary (`lightningcss`, `@tailwindcss/oxide`)
- Standalone trace may miss these on some setups
- **Fix**: Add `outputFileTracingIncludes` in next.config.ts if styles are missing

## Moderate Pitfalls

### 9. Layer Caching Inefficiency
- Copying all source code before `npm run build` invalidates cache on every source change
- **Fix**: Copy `prisma/` dir before `npm run build` for schema change cache
- Order: `COPY package*.json ./` → `npm ci` → `COPY prisma/ ./` → `COPY . .` → `npm run build`

### 10. Volume Permissions (macOS vs Linux)
- Named volumes work fine on both, but bind mounts have permission differences
- Postgres container may fail to initialize if bind-mounted directory has wrong ownership
- **Fix**: Use named volumes for Postgres data, not bind mounts

### 11. Health Check Race
- Without health check, app starts before Postgres is ready → "connection refused"
- With health check but wrong `pg_isready` flags, check may never pass
- **Fix**: `pg_isready -U moodscape -d moodscape` with 5s interval, 20 retries

### 12. Middleware → Proxy Deprecation
- Next.js 16 warns about middleware → proxy convention
- This is informational — doesn't break anything
- **Fix**: Accept the warning, or migrate to `proxy.ts` convention later

## Phase Attribution
- Pitfalls 1-8 should be addressed during Docker implementation
- Pitfall 7 (RSC pre-render) needs checking existing pages for DB calls
- Pitfall 12 can be deferred (existing issue, not introduced by Docker)
