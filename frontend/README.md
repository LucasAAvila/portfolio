# Frontend — Portfolio

Next.js 16 app that powers [lucasavila.dev](https://www.lucasavila.dev). Server-first rendering with the App Router, bilingual via next-intl, styled with Tailwind CSS 4.

## Stack

- Next.js 16 (App Router, standalone output)
- React 19, TypeScript 5 (strict)
- Tailwind CSS 4
- next-intl for i18n (`en`, `pt-BR`)
- react-hook-form + Zod for the contact form
- ISR via `fetch` cache tags, on-demand revalidation endpoint

## Setup

The frontend runs inside Docker Compose alongside the backend and database. See [../README.md](../README.md) for the top-level setup.

To run only the frontend against a remote API:

```bash
cd frontend
npm install
NEXT_PUBLIC_API_URL=http://localhost:8000 npm run dev
```

The dev server listens on http://localhost:3000.

## Scripts

| Command                | Description                |
| ---------------------- | -------------------------- |
| `npm run dev`          | Start the dev server       |
| `npm run build`        | Production build           |
| `npm run start`        | Serve the production build |
| `npm run lint`         | ESLint                     |
| `npm run typecheck`    | `tsc --noEmit`             |
| `npm run format`       | Prettier write             |
| `npm run format:check` | Prettier check             |

## Project layout

```
frontend/
├── app/
│   ├── [locale]/             # locale-scoped routes
│   │   ├── layout.tsx        # <html>, metadata, JSON-LD Person schema
│   │   ├── page.tsx          # home (hero, projects, about, stack, contact)
│   │   ├── projects/[slug]/  # project detail page
│   │   ├── opengraph-image.tsx, twitter-image.tsx
│   │   ├── error.tsx, not-found.tsx, loading.tsx
│   ├── api/revalidate/       # on-demand ISR webhook
│   ├── favicon.ico, globals.css, robots.ts, sitemap.ts
├── components/               # server components (+ a few client ones)
│   ├── ui/                   # shadcn-style primitives
│   ├── navbar.tsx, hero.tsx, projects-section.tsx, tech-section.tsx,
│   │   project-card.tsx, contact-form.tsx
├── i18n/
│   ├── routing.ts            # next-intl routing config
│   ├── request.ts            # getRequestConfig — loads messages per locale
│   └── navigation.ts         # locale-aware Link, useRouter, usePathname
├── lib/
│   ├── api.ts                # backend client (Zod-validated)
│   ├── contact.ts            # shared email/social handles
│   ├── contact-schema.ts     # Zod schema mirrored on the backend
│   └── utils.ts              # cn(), gradientIndexForSlug()
├── messages/
│   ├── en.json, pt-BR.json   # all user-visible strings
├── public/                   # CV PDFs and other static assets
├── proxy.ts                  # next-intl edge middleware (Next.js 16 file name)
├── next.config.ts            # standalone output + next-intl plugin
└── tsconfig.json             # strict, path alias @/ -> .
```

## i18n

- Locales: `en` (default) and `pt-BR`. Routing is prefix-based (`/en`, `/pt-BR`).
- Translations live in [messages/en.json](messages/en.json) and [messages/pt-BR.json](messages/pt-BR.json).
- Server components use `getTranslations()`; client components use `useTranslations()`.
- Never hardcode user-facing strings in a component — always add a key to the messages files.

## Data fetching

- Server components call helpers in [lib/api.ts](lib/api.ts), which issue `fetch` against `NEXT_PUBLIC_API_URL` with `next: { revalidate: 3600, tags: [...] }`.
- Responses are parsed with Zod before being returned, so the component tree works with validated, typed data.
- On-demand revalidation: `POST /api/revalidate` with header `x-revalidate-secret: $REVALIDATION_SECRET` and body `{ "tag": "projects" | "skills" }`.

## SEO

- Per-route `generateMetadata` with title templates, canonical URLs, and `hreflang` alternates including `x-default`.
- Dynamic OG and Twitter images via `opengraph-image.tsx` / `twitter-image.tsx`.
- JSON-LD `Person` schema on the home page, `BreadcrumbList` + `CreativeWork` on project pages.
- `sitemap.ts` and `robots.ts` at the app root.

## Conventions

- Server components by default; `"use client"` only where interactivity requires it (navbar, contact form, error boundary).
- Strict TypeScript. Runtime validation with Zod for any data crossing the boundary.
- Path alias `@/` resolves to `frontend/` root.
- Tailwind design tokens are defined in [app/globals.css](app/globals.css) (dark-only palette with a single amber accent).
