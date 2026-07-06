<!-- generated-by: gsd-doc-writer -->

# Development

## Local Setup

```bash
# Clone and install
git clone https://github.com/benharvey1985/moodscaparr
cd moodscaparr
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your local Postgres URL and a generated auth secret

# Generate Prisma client and run migrations
npx prisma generate
npx prisma migrate dev

# Start the development server
npm run dev
```

The app will be available at `http://localhost:3000`.

## Build Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server with Turbopack (hot reload) |
| `npm run build` | Build the app for production |
| `npm run start` | Start the production server (run `npm run build` first) |
| `npm run lint` | Run ESLint across the codebase |

## Code Style

- **ESLint** — configured in `eslint.config.mjs`. Uses `eslint-config-next` with TypeScript support. Run with `npm run lint`
- **TypeScript** — strict mode, target ES2017, configured in `tsconfig.json`. All source files are `.ts` or `.tsx`
- **Tailwind v4** — CSS utility framework with `tw-animate-css` for animations. Configured in `postcss.config.mjs` and `globals.css`
- **shadcn/ui** **(base-nova style)** — component library using Radix UI primitives. Component definitions in `components.json`

## Branch Conventions

No branch naming convention is documented. The default branch is `main`.

## PR Process

## Docker Build

To build and test the Docker image locally:

```bash
docker compose build
docker compose up -d
# Access at http://localhost:8080
```

The Dockerfile uses a three-stage multi-stage build (deps → builder → runner) with Alpine base. The `output: "standalone"` option in `next.config.ts` enables the Next.js standalone output mode, producing a minimal production image (~300-400 MB).

No pull request template or automation has been configured. When submitting changes:

1. Ensure `npm run lint` passes with no errors
2. Verify the build succeeds with `npm run build`
3. Describe what the change does and why in the PR description
