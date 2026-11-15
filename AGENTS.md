<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# HireLoop Client

Next.js 16 (App Router) + React 19 frontend for the HireLoop job portal. No backend repo here yet — the only server-side code is better-auth's API route backed by MongoDB.

## Commands

- `npm run dev` / `build` / `start` — standard Next.js
- `npm run lint`, `npm run typecheck` — verification; there is no test runner or CI config
- `npm run format` — Prettier on `*.ts`/`*.tsx` only: no semicolons, double quotes, LF endings; `prettier-plugin-tailwindcss` sorts classes (`cn`/`cva` recognized)
- Add shadcn components with `npx shadcn@latest add <component>` (README documents this; style is `base-nova`, which uses `@base-ui/react`, **not** Radix — check Base UI props, not shadcn/Radix docs, when editing `components/ui/*`)

## Structure & conventions

- No `src/` — alias `@/*` maps to the repo root (`app/`, `components/`, `lib/`, `hooks/` currently empty)
- Tailwind v4 is CSS-first: theme tokens live in `app/globals.css` under `@theme inline`; there is no `tailwind.config` file
- Fonts come from `app/layout.tsx` as CSS variables `--font-sans` / `--font-mono`

## Auth (better-auth + MongoDB)

- Server config: `lib/auth.ts`; client: `lib/auth-client.ts`; catch-all handler at `app/api/auth/[...all]/route.ts`
- Requires a local MongoDB on `localhost:27017` — the connection string is hardcoded in `lib/auth.ts` (not read from `.env`), so auth calls fail without `mongod` running
- `.env` is gitignored with no `.env.example`; expected vars: `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- Quirk in `lib/auth-client.ts`: it creates the client twice — `authClient` (with `baseURL`) and a second default client destructured as `signIn`/`signUp`/`useSession`. Use the configured `authClient` in new code, or reconcile the duplication

## Project context

- Feature spec is the source of truth: `../hireloop-resources/Project requirements.md` (roles Seeker/Recruiter/Admin, planned routes `/jobs`, `/companies`, `/pricing`, `/jobs/:jobId`, and `/dashboard/{seeker,recruiter,admin}/...`); Framer Motion guidance in `../hireloop-resources/Framer-Motion-guide.md`
- `CLAUDE.md` is just `@AGENTS.md`; keep instructions here so both stay in sync
