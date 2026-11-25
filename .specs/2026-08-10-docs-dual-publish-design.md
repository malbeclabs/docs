# Dual-publish the docs site: GitHub Pages + Vercel

**Date:** 2026-08-10
**Status:** Approved design, not yet implemented
**Repo:** `malbeclabs/docs` (public)
**Lifetime:** Temporary. Delete once the change ships. Lives in `.specs/` rather than
`docs/` so it is never published to the public site.

## Goal

Serve the same MkDocs site at two hostnames at once:

- `docs.malbeclabs.com` stays on GitHub Pages, exactly as it works today.
- `docs.doublezero.xyz` becomes the canonical home, served by Vercel, with DNS in
  the Cloudflare `doublezero.xyz` zone.

A visitor who requests `docs.doublezero.xyz` stays on `docs.doublezero.xyz`. Nothing
redirects toward `docs.malbeclabs.com` in either direction.

## Why this shape

GitHub Pages allows exactly one custom domain per site, and it matches the incoming
`Host` header against that domain. Adding a second DNS record pointing at
`malbeclabs.github.io` does not work: GitHub sees an unrecognized `Host` and returns
404. So a second hostname needs a second origin, a `Host`-rewriting proxy, or a
change of the Pages domain.

Adding Vercel as a genuine second origin is the only one of those options that
requires no cutover. The existing Pages deploy is untouched, so the current hostname
has zero downtime and zero risk.

The usual objection to two origins is that they drift. Deploying a *prebuilt*
artifact removes that: one `mkdocs build`, two uploads of byte-identical output. No
second Python toolchain, no chance the two hosts disagree about content.

## Architecture

```
mkdocs build  ->  site/
   |
   +-- tar --> actions/upload-artifact --> actions/deploy-pages --> docs.malbeclabs.com
   |
   +-- cp ---> .vercel/output/static/ --> vercel deploy --prebuilt ---> docs.doublezero.xyz
```

Build once in `.github/workflows/mkdocs.yml`. Fan out to two deploy targets from the
same `site/` directory.

### Canonical URL

`site_url` moves to `https://docs.doublezero.xyz/`.

A single build carries a single `site_url`, which drives canonical `<link>` tags,
`sitemap.xml` entries, and the absolute URLs written into the `.well-known`
discovery files. Both origins therefore serve pages whose canonical tag points at
`docs.doublezero.xyz`. The legacy hostname keeps returning real 200 responses but
stops competing for search indexing.

This also makes retiring `docs.malbeclabs.com` cheap later: delete one workflow job
and add a Cloudflare redirect rule. No content changes, on our own schedule.

### Components

**1. Build job (existing, minor restructure)**

Currently one job builds and deploys. Split so the artifact is produced once and
consumed by both deploy paths, and so pull requests can build without deploying to
Pages.

**2. GitHub Pages deploy (unchanged behavior)**

Runs only on push to `main`. Keeps `docs/CNAME` as `docs.malbeclabs.com`. Keeps the
`tar --dereference -cvf` step, which is what preserves the hidden `.well-known`
directory in the uploaded artifact.

**3. Vercel deploy (new)**

- Vercel team/scope: `doublezero-foundation`
- Project name: `doublezero-docs`
- Project settings: no framework preset, no build command, no install command.
- Deploy through the Build Output API rather than letting Vercel build:
  copy `site/` into `.vercel/output/static/`, write `.vercel/output/config.json`,
  then `vercel deploy --prebuilt`.
- `config.json` sets `version: 3` and `trailingSlash: true`. MkDocs runs with
  `use_directory_urls` (the default), producing `setup/index.html`. Without
  `trailingSlash: true`, `/setup` and `/setup/` behave as two URLs.
- Production deploy (`--prod`) on push to `main`. Preview deploy on pull requests.
- Secrets required in the repo: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.

**4. DNS**

In the Cloudflare `doublezero.xyz` zone: `docs` as a CNAME to `cname.vercel-dns.com`,
**DNS-only (grey cloud)**. Vercel issues and renews the certificate.

Proxying through Cloudflare (orange cloud) is deliberately out of scope. It is a
separate decision with certificate and caching consequences, and it can be turned on
later without touching this repo.

The `malbeclabs.com` zone is not modified. `docs.malbeclabs.com` remains a DNS-only
CNAME to `malbeclabs.github.io`.

## Pull request previews and forks

The repo is public and takes PRs from forks (for example #192 and #189 from
`Jotatavo`). GitHub does not expose repository secrets to `pull_request`-triggered
workflows from forks, so a Vercel deploy step cannot authenticate there.

**Decision:** gate the Vercel preview step on the PR originating from this repo:

```yaml
if: github.event.pull_request.head.repo.full_name == github.repository
```

Fork PRs still run `mkdocs build`, which catches broken navigation and broken
internal links. They just do not get a preview URL.

`pull_request_target` is explicitly rejected. It would run untrusted PR code with
access to a Vercel deploy token in a public repo.

## Content links

Roughly 20 links inside the docs content are absolute to `https://docs.malbeclabs.com`.
Convert them to relative MkDocs links so they resolve on whichever hostname served
the page, and so a future rebrand does not break them again. Relative links also let
MkDocs validate them at build time.

Affected files, across all 8 locales:

- `docs/tenant.md` and `docs/tenant.{es,fr,it,ja,ko,pt,zh}.md`
- `docs/troubleshooting.md` and `docs/troubleshooting.{es,fr,it,ja,ko,pt,zh}.md`
- `docs/Validator Multicast Connection.md`

Note the existing absolute links are URL-encoded (`/DZ%20Mainnet-beta%20Connection/`)
because the page filenames contain spaces. The relative equivalents must keep working
from a localized page, where the current URL carries a locale prefix such as `/es/`.

## Hostname references outside content

| File | Line | Change |
|---|---|---|
| `mkdocs.yml` | 2 | `site_url` to `https://docs.doublezero.xyz/` |
| `docs/robots.txt` | 33 | `Sitemap:` to `https://docs.doublezero.xyz/sitemap.xml` |
| `hooks/emit_well_known.py` | 32 | `SITE_BASE` to `https://docs.doublezero.xyz` |
| `well-known/agent-skills/doublezero-docs/SKILL.md` | 9 occurrences | absolute URLs to doublezero |
| `docs/CNAME` | 1 | **unchanged**, stays `docs.malbeclabs.com` |

`hooks/emit_markdown.py` contains no hardcoded hostname and needs no change.

`SKILL.md` is hashed at build time by `emit_well_known.py`, which writes the SHA-256
into `.well-known/agent-skills/index.json`. Editing `SKILL.md` changes that digest by
design, so no manual digest update is needed, but the digest must match on both
origins after deploy.

## Assumptions to verify during implementation

These are likely fine but must be confirmed against the live deployment rather than
assumed:

1. **`.well-known/` survives the Vercel deploy.** On Pages it survives because of
   `tar -cvf .`. On Vercel it is a plain directory copy into
   `.vercel/output/static/`, so it should be served, but the dot-prefix makes this
   worth an explicit `curl`.
2. **`404.html` is wired to real 404 responses** on Vercel. MkDocs emits
   `site/404.html`. Confirm a missing path returns it with a 404 status, and add an
   explicit Build Output API route if it does not.
3. **Locale prefixes work.** All 8 `mkdocs-static-i18n` locales resolve on Vercel,
   including the default English at the root.

## Verification

After deploying, check both origins:

- Both hostnames serve the same commit, and `.well-known/agent-skills/index.json`
  reports identical digests on each.
- The canonical `<link>` on a page fetched from `docs.malbeclabs.com` points at
  `docs.doublezero.xyz`.
- `sitemap.xml` contains only `docs.doublezero.xyz` URLs, on both origins.
- `llms.txt` and `llms-full.txt` are reachable on both.
- `/.well-known/mcp/server-card.json` is reachable on both.
- A missing path returns the styled 404 with a 404 status on both.
- One page per locale loads on Vercel.
- Search works on Vercel (the MkDocs search index is fetched relative to the page).
- Requesting `/setup` (no trailing slash) on Vercel reaches `/setup/` rather than
  404ing or serving a duplicate.

## Out of scope

Noted while investigating, deliberately not part of this change:

- The root `CNAME` file is vestigial. Under `actions/deploy-pages`, only the `CNAME`
  inside the uploaded artifact matters, which comes from `docs/CNAME`.
- `site/` is committed to git despite being listed in `.gitignore`, so stale build
  output is tracked in the repo.
- Retiring `docs.malbeclabs.com` and adding a Cloudflare redirect rule.
- Putting Cloudflare's proxy in front of Vercel.
