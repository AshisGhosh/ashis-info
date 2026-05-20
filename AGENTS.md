# AGENTS.md

Guidance for AI coding agents (Claude Code, etc.) working in this repo.

## What this is

`ashis.info` is a personal site. Single-page landing today; the longer-term plan is to add unlinked sections (`/research`, `/writing`, `/projects`) that hold blog posts and curated links.

## Stack

- **Next.js 14** (App Router) with `output: 'export'` in `next.config.mjs`. The site is a **fully static export**. No server components with runtime data, no route handlers, no `next/image` loader features that require a server, no middleware. Everything must work as plain HTML/CSS/JS in `out/`.
- **TypeScript**, strict mode. Path alias `@/*` → repo root.
- **TailwindCSS** + **shadcn/ui** (zinc base, CSS variables). New primitives go in `components/ui/` via `npx shadcn-ui@latest add ...`.
- **next-themes** for light/dark/system, wired in `app/layout.tsx` via `ThemeProvider`.
- Package manager: **pnpm** (lockfile is `pnpm-lock.yaml`; CI uses pnpm).

## Layout

```
app/
  layout.tsx          # Root layout, ThemeProvider, Inter font
  page.tsx            # Landing page
  globals.css         # Tailwind layers + shadcn CSS variables
components/
  footer-drawer.tsx   # "Say Hi" drawer (vaul)
  theme-provider.tsx  # next-themes wrapper
  ui/                 # shadcn primitives (alert, button, drawer, dropdown-menu, mode-toggle)
lib/utils.ts          # cn() helper (clsx + tailwind-merge)
public/               # Static assets
main.tf, variables.tf # OpenTofu infra (see below)
install.sh            # Bootstraps OpenTofu/AWS CLI + remote state bucket
.github/workflows/deploy.yml  # CI pipeline
```

## Local dev

```
pnpm install
pnpm dev      # http://localhost:3000
pnpm build    # produces out/ via next build (static export)
pnpm lint
```

If you change UI, **run the dev server and verify in a browser** before declaring done. Type-checking won't catch layout/style regressions.

## Deployment

Push to `main` triggers `.github/workflows/deploy.yml`:

1. `tofu init` / `plan` / `apply` (reconciles infra on every run; be aware that infra changes deploy automatically).
2. `pnpm install` → `pnpm build`.
3. `aws s3 sync out/ s3://ashis-info-website --delete`.
4. Cloudflare cache purge for the zone.

Secrets needed in GitHub Actions: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID`. Terraform state lives in `s3://my-terraform-state-bucket-851725260644` (us-west-2).

## Infra (`main.tf`)

- ACM cert in **us-east-1** for `ashis.info` + `www.ashis.info`, DNS-validated via Cloudflare records.
- S3 website bucket `ashis-info-website` in us-west-2 (public-read policy, website config with `index.html` / `404.html`).
- CloudFront distribution, aliased to apex + www, HTTPS redirect, default TTL 3600s.
- Cloudflare CNAMEs for apex and www → CloudFront, proxied.

Don't edit infra casually; every CI run applies it.

## Conventions

- **Static-export safe only.** Anything that requires Node at request time will break the build or silently no-op. Use build-time data, not runtime fetches.
- **shadcn style:** Tailwind utility classes, `cn(...)` for conditional merging. Components prefer `React.forwardRef` to match existing UI primitives.
- **Theme tokens** (`bg-primary`, `text-muted-foreground`, etc.) over raw colors, so light/dark parity stays in sync.
- **Don't add dependencies casually.** The bundle is small; new deps need a real reason.
- **No comments unless the *why* is non-obvious.** Names should carry the *what*.

## Hidden sections (`/research`, `/writing`, `/projects`)

These are **unlinked + noindex**: the homepage does not link to them, and they're excluded from search engines via per-page robots metadata and `public/robots.txt`. Anyone with the URL can still view them.

Implemented today: `/writing` (index only, all external-link entries) and `/research` (index + `[slug]` post renderer, currently one inline post). `/projects` is not scaffolded yet.

### Frontmatter

Each `content/<section>/*.md` file uses YAML frontmatter:

```yaml
---
title: "..."          # required, always quote
date: 2026-05-19      # required
summary: "..."        # optional, always quote (avoids YAML colon pitfalls)
link: https://...     # optional. If set, the index card opens this URL directly.
repo: https://...     # optional. Shown as "Code on GitHub" header on internal posts.
publisher: "..."      # optional. Renders as a small badge on the index card.
---
```

- `link` and body are mutually exclusive in intent: if `link` is set, the entry is treated as an external-link card (no internal permalink built). If the file has a body, an internal permalink at `/<section>/<slug>` is built and the index card opens that.
- `repo` is purely metadata for the post page header; it doesn't affect index card routing.
- `publisher` auto-infers from `link` or `repo` host (`forbes.com → Forbes`, `github.com → GitHub`, plus substack/medium). Extend `PUBLISHER_FROM_HOST` in `lib/content.ts` for new venues, or set explicitly for a precise label (e.g. `"Forbes Tech Council"`).

### Lib + routes

- `lib/content.ts` is section-aware: `getAllPosts(section)` and `getPost(section, slug)` for `"writing" | "research" | "projects"`. Markdown is parsed via `gray-matter`, rendered to HTML via `remark` + `remark-html` at build time.
- Each section has `app/<section>/page.tsx` (index) and exports `metadata.robots = { index: false, follow: false }`. The `[slug]/page.tsx` post renderer is only required when the section has at least one internal post. Next 14's static export errors if `generateStaticParams()` returns an empty array, so for link-only sections (today: `/writing`) the `[slug]` directory should not exist.

### Images for inline posts

Drop them in `public/<section>/<slug>/` and reference them in the markdown as `/<section>/<slug>/<file>.png`. They flow through to `out/<section>/<slug>/<file>.png` via the standard public-folder pass-through.

## Things to avoid

- Adding server components that fetch at request time, API routes, or middleware. They break `output: 'export'`.
- Pushing to `main` with infra changes you haven't reviewed. CI applies them.
- Committing `terraform.tfvars` (gitignored) or any AWS/Cloudflare secrets.
- `git add -A` near the repo root, which easily sweeps in local tfstate or env files.
