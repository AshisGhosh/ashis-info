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

## Planned: hidden sections (`/research`, `/writing`, `/projects`)

These are **unlinked + noindex**: the homepage will not link to them, and they should be excluded from search engines. Anyone with the URL can still view them.

Decided shape:

1. **Content lives in `/content/{research,writing,projects}/*.{md,mdx}`.** Each file has frontmatter (`title`, `date`, optional `summary`, optional `link` for external posts, optional `publisher` for the venue badge). Body is the post or notes. **Always wrap `title` and `summary` in double quotes** so colons or other YAML-meaningful characters in the value don't break parsing. If `link` is set and `publisher` isn't, the lib will auto-infer from common hosts (forbes.com, substack.com, medium.com, github.com); add `publisher` explicitly for anything else or for a more precise label (e.g. `"Forbes Tech Council"`).
2. **Routes:** `app/research/page.tsx`, `app/writing/page.tsx`, `app/projects/page.tsx` for the section index. Per-post permalinks via `app/{section}/[slug]/page.tsx` with `generateStaticParams()` reading the content directory at build time.
3. **No-index:** each section's `page.tsx` (and per-post pages) exports
   ```ts
   export const metadata = { robots: { index: false, follow: false } }
   ```
   and `public/robots.txt` adds `Disallow: /research/`, `/writing/`, `/projects/`.
4. **No homepage links.** Sections are URL-only. (If a nav is added later, keep these out of it.)
5. **Suggested deps when this lands:** `gray-matter` for frontmatter, plus either `next-mdx-remote` or `@next/mdx` if MDX is wanted; if posts stay plain markdown, `remark` + `remark-html` is enough.

When implementing, prefer the smallest workable version: get one markdown post rendering through one section before generalizing.

## Things to avoid

- Adding server components that fetch at request time, API routes, or middleware. They break `output: 'export'`.
- Pushing to `main` with infra changes you haven't reviewed. CI applies them.
- Committing `terraform.tfvars` (gitignored) or any AWS/Cloudflare secrets.
- `git add -A` near the repo root, which easily sweeps in local tfstate or env files.
