# Docs Dual-Publish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Serve the MkDocs site at `docs.doublezero.xyz` via Vercel as the new canonical home, while `docs.malbeclabs.com` keeps running on GitHub Pages unchanged.

**Architecture:** One `mkdocs build` in CI produces `site/`. That output is tarred once and uploaded as a single artifact, which both deploy jobs consume: `actions/deploy-pages` for GitHub Pages, and `vercel deploy --prebuilt` for Vercel. Consuming the same tar is what guarantees the two origins serve byte-identical content.

**Tech Stack:** MkDocs + mkdocs-material, mkdocs-static-i18n (8 locales), GitHub Actions, Vercel Build Output API v3, Cloudflare DNS.

**Spec:** `.specs/2026-08-10-docs-dual-publish-design.md`

## Global Constraints

- Canonical hostname is `https://docs.doublezero.xyz/`. Trailing slash included, exactly as written.
- `docs/CNAME` must remain `docs.malbeclabs.com`. Changing it breaks the live site.
- Vercel scope `doublezero-foundation`, project `doublezero-docs`.
- Vercel DNS record is **DNS-only (grey cloud)** in Cloudflare. Do not proxy.
- `pull_request_target` is forbidden. This is a public repo and the Vercel token must never be exposed to fork code.
- Python 3.12 in CI, matching the current workflow.
- Never commit `.vercel/` or `site/`. Both are build output.
- A visitor on `docs.doublezero.xyz` stays there. No redirect toward malbeclabs in either direction.

---

## Human-Only Prerequisites (do these in parallel with Tasks 1-3)

These need credentials or a browser and cannot be done from the repo. Tasks 1, 2, and 3 are pure repo changes and do not depend on any of them. Task 4 needs P1. Task 6 needs P2.

**P1. Mint a Vercel access token and store it as a GitHub secret.**

There is no CLI command that creates access tokens, so this step is unavoidably manual.

1. Go to https://vercel.com/account/tokens
2. Create a token. Scope it to the **DoubleZero Foundation** team, not your personal account.
3. Set it as a repo secret **from your terminal**, so the token never appears in a chat transcript or a browser form:

```bash
gh secret set VERCEL_TOKEN --repo malbeclabs/docs
# paste the token at the prompt, then press Ctrl+D
```

Verify it landed without revealing the value:

```bash
gh secret list --repo malbeclabs/docs
```

**P2. Create the Cloudflare DNS record.** Do this only after Task 4 confirms the Vercel project serves the site correctly on its `*.vercel.app` URL.

In the Cloudflare dashboard, `doublezero.xyz` zone:

| Field | Value |
|---|---|
| Type | `CNAME` |
| Name | `docs` |
| Target | `cname.vercel-dns.com` |
| Proxy status | **DNS only (grey cloud)** |
| TTL | Auto |

Grey cloud matters: an orange-cloud proxy puts Cloudflare's certificate in front of Vercel and interferes with Vercel's own certificate issuance. Proxying can be enabled later as a separate decision.

**What the agent handles instead of you:** creating the Vercel project, linking it, reading out `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` and setting those two as repo secrets (they are identifiers, not credentials), all repo changes, and the local prebuilt deploy test.

---

## File Structure

| File | Responsibility | Change |
|---|---|---|
| `mkdocs.yml` | Site config, canonical `site_url` | Modify line 2 |
| `docs/robots.txt` | Crawler policy, sitemap pointer | Modify line 33 |
| `hooks/emit_well_known.py` | Emits `.well-known` discovery files, hashes SKILL.md | Modify line 32 |
| `well-known/agent-skills/doublezero-docs/SKILL.md` | Agent Skill descriptor | Modify 9 URLs |
| `docs/tenant.md` + 7 locales | Tenant table with 2 cross-links each | Modify links |
| `docs/troubleshooting.md` + 7 locales | 1 cross-link each | Modify links |
| `docs/Validator Multicast Connection.md` | 2 cross-links | Modify links |
| `.github/workflows/mkdocs.yml` | Build once, deploy twice | Restructure |
| `.vercel/output/config.json` | Build Output API config | Generated in CI, never committed |
| `.gitignore` | Ignore `.vercel/` | Modify |

**Not changed:** `docs/CNAME`, `hooks/emit_markdown.py` (contains no hardcoded hostname).

---

## Task 1: Reproducible local build and baseline

Nothing can be verified until the site builds locally. `mkdocs` is not currently installed on this machine (confirmed: `python3 -c "import mkdocs"` fails; Python 3.12.7 is available).

**Files:**
- Create: `.venv/` (git-ignored, not committed)
- Modify: `.gitignore`

**Interfaces:**
- Produces: a working `mkdocs build` command, and `/tmp/docs-baseline/` holding the pre-change build for later diffing.

- [ ] **Step 1: Create the venv and install the exact CI dependency set**

The CI workflow installs `mkdocs-material mkdocs-static-i18n` with no version pins, so match that.

```bash
cd /Users/amcconnell/src/git/work/docs
python3 -m venv .venv
.venv/bin/pip install --quiet --upgrade pip
.venv/bin/pip install mkdocs-material mkdocs-static-i18n
.venv/bin/mkdocs --version
```

- [ ] **Step 2: Capture the baseline build and its warnings**

This is the reference point. Every later task diffs against it.

```bash
.venv/bin/mkdocs build --site-dir /tmp/docs-baseline 2>&1 | tee /tmp/docs-baseline-warnings.txt
echo "--- warning count ---"
grep -c "WARNING" /tmp/docs-baseline-warnings.txt || echo 0
```

- [ ] **Step 3: Decide whether `--strict` is adoptable**

`mkdocs build --strict` turns link warnings into build failures, which is the gate that makes the Task 2 link conversion safe. It is only adoptable if the baseline is already warning-free.

```bash
.venv/bin/mkdocs build --strict --site-dir /tmp/docs-strict-probe 2>&1 | tail -20
```

Record the outcome in your task notes:
- **Exit 0:** `--strict` is adoptable. Use it in Task 2 and add it to CI in Task 5.
- **Non-zero:** pre-existing warnings exist. Do **not** add `--strict` to CI in Task 5. Instead, Task 2 verifies links by grepping rendered HTML, and you report the pre-existing warnings to the user as a separate finding. Do not fix unrelated warnings in this change.

- [ ] **Step 4: Confirm the baseline contains the things we must not break**

```bash
test -f /tmp/docs-baseline/.well-known/agent-skills/index.json && echo "OK well-known"
test -f /tmp/docs-baseline/llms.txt && echo "OK llms.txt"
test -f /tmp/docs-baseline/404.html && echo "OK 404"
test -f /tmp/docs-baseline/CNAME && cat /tmp/docs-baseline/CNAME
test -f /tmp/docs-baseline/sitemap.xml && echo "OK sitemap"
ls -d /tmp/docs-baseline/{es,fr,it,ja,ko,pt,zh} && echo "OK 7 locale dirs + en at root"
```

All must pass. `CNAME` must print `docs.malbeclabs.com`.

- [ ] **Step 5: Ignore `.venv/` and `.vercel/`**

`.gitignore` already has `site/`. Add the other two build artifacts. Append:

```
.venv/
.vercel/
```

- [ ] **Step 6: Commit**

```bash
git add .gitignore
git commit -m "chore: ignore .venv and .vercel build artifacts"
```

---

## Task 2: Convert absolute content links to relative

26 links across 17 files hardcode `https://docs.malbeclabs.com`. Relative MkDocs links resolve on whichever hostname served the page and get validated at build time.

**Files:**
- Modify: `docs/tenant.md`, `docs/tenant.{es,fr,it,ja,ko,pt,zh}.md` (2 links each = 16)
- Modify: `docs/troubleshooting.md`, `docs/troubleshooting.{es,fr,it,ja,ko,pt,zh}.md` (1 link each = 8)
- Modify: `docs/Validator Multicast Connection.md` (2 links, both on line 11)

**Interfaces:**
- Consumes: the working `.venv/bin/mkdocs` and `/tmp/docs-baseline/` from Task 1.
- Produces: no code interface. Later tasks depend only on the build still succeeding.

**Two assumptions this task must prove, not assume:**

1. **Link destination syntax.** Target filenames contain spaces (`DZ Mainnet-beta Connection.md`). Two candidate forms exist: angle brackets `[text](<DZ Mainnet-beta Connection.md>)`, or percent-encoding `[text](DZ%20Mainnet-beta%20Connection.md)`. MkDocs resolves `.md` links by filesystem lookup, and it is genuinely unclear whether it URL-decodes `%20` before that lookup. Step 1 settles it empirically. Do not skip it.

2. **Locale resolution.** With `mkdocs-static-i18n` in `docs_structure: suffix` mode, a link inside `tenant.es.md` should be written against the **default-language** filename (`setup.md`, not `setup.es.md`) and the plugin rewrites it to the localized URL. All 8 locale variants of every target file exist, so this should work. Step 4 verifies the rendered `href` per locale rather than trusting it.

- [ ] **Step 1: Settle the link syntax question with a single-file probe**

Change only one link in one file, build, and inspect the rendered HTML.

Edit `docs/Validator Multicast Connection.md` line 11. Replace:

```markdown
If you are not already connected to DoubleZero please complete [Setup](https://docs.malbeclabs.com/setup/), and [Mainnet-Beta](https://docs.malbeclabs.com/DZ%20Mainnet-beta%20Connection/) validator connection documentation.
```

with the angle-bracket form:

```markdown
If you are not already connected to DoubleZero please complete [Setup](<setup.md>), and [Mainnet-Beta](<DZ Mainnet-beta Connection.md>) validator connection documentation.
```

- [ ] **Step 2: Build the probe and read the actual href**

```bash
.venv/bin/mkdocs build --site-dir /tmp/docs-probe 2>&1 | grep -iE "warning|Validator" | head -20
grep -o 'href="[^"]*"' "/tmp/docs-probe/Validator Multicast Connection/index.html" | grep -iE "setup|mainnet"
```

Expected: hrefs resolve to `../setup/` and `../DZ%20Mainnet-beta%20Connection/`, with no warning naming this file.

If the angle-bracket form produced a warning or a literal unresolved `setup.md` href, switch that one link to the percent-encoded form `[Setup](setup.md)` / `[Mainnet-Beta](DZ%20Mainnet-beta%20Connection.md)`, rebuild, and re-check. **Whichever form works here is the form used for all 26 links.** Record which one won.

- [ ] **Step 3: Apply the winning form to the remaining 25 links**

Using the syntax proven in Step 2, replace across the remaining files. The three distinct replacements are:

| Old absolute URL | New relative destination |
|---|---|
| `https://docs.malbeclabs.com/setup/` | `setup.md` |
| `https://docs.malbeclabs.com/DZ%20Mainnet-beta%20Connection/` | `DZ Mainnet-beta Connection.md` |
| `https://docs.malbeclabs.com/DZ%20Testnet%20Connection/` | `DZ Testnet Connection.md` |

Wrap each destination in the form Step 2 proved. Exact locations, verified by grep:

| File | Line(s) | Links |
|---|---|---|
| `docs/tenant.md` | 15, 16 | Mainnet-beta, Testnet |
| `docs/tenant.es.md` | 13, 14 | Mainnet-beta, Testnet |
| `docs/tenant.fr.md` | 13, 14 | Mainnet-beta, Testnet |
| `docs/tenant.it.md` | 13, 14 | Mainnet-beta, Testnet |
| `docs/tenant.ja.md` | 13, 14 | Mainnet-beta, Testnet |
| `docs/tenant.ko.md` | 13, 14 | Mainnet-beta, Testnet |
| `docs/tenant.pt.md` | 13, 14 | Mainnet-beta, Testnet |
| `docs/tenant.zh.md` | 13, 14 | Mainnet-beta, Testnet |
| `docs/troubleshooting.md` | 128 | setup |
| `docs/troubleshooting.es.md` | 120 | setup |
| `docs/troubleshooting.fr.md` | 121 | setup |
| `docs/troubleshooting.it.md` | 121 | setup |
| `docs/troubleshooting.ja.md` | 121 | setup |
| `docs/troubleshooting.ko.md` | 120 | setup |
| `docs/troubleshooting.pt.md` | 121 | setup |
| `docs/troubleshooting.zh.md` | 121 | setup |
| `docs/Validator Multicast Connection.md` | 11 | already done in Step 1 |

That is 24 links here, plus the 2 converted in Step 1, totaling 26.

Edit the link destinations only. Do not touch the surrounding translated link text or table cells. Line numbers may shift by a line if an earlier edit in the same file changes line count; the Step 4 grep is the authority on completeness, not these numbers.

- [ ] **Step 4: Verify no absolute links remain in content, and locale resolution works**

```bash
echo "--- remaining absolute refs in docs/ (expect only docs/CNAME and robots.txt) ---"
grep -rn "docs\.malbeclabs\.com" docs/

echo "--- rebuild ---"
.venv/bin/mkdocs build --site-dir /tmp/docs-relative 2>&1 | grep -i warning | head -20

echo "--- English tenant page hrefs ---"
grep -o 'href="[^"]*Connection/"' /tmp/docs-relative/tenant/index.html | sort -u

echo "--- per-locale resolution: each must stay inside its own locale prefix ---"
for loc in es fr it ja ko pt zh; do
  printf "%s: " "$loc"
  grep -o 'href="[^"]*Connection/"' "/tmp/docs-relative/$loc/tenant/index.html" | head -1
done
```

Expected: `grep -rn` returns only `docs/CNAME` and `docs/robots.txt`. Every locale line resolves to a real target, and the relative path from `/es/tenant/` reaches `/es/DZ%20Mainnet-beta%20Connection/` rather than escaping to the English page.

If any locale resolves to the English page instead of its own, stop and report it. That is a real mkdocs-static-i18n behavior question and it changes the approach.

- [ ] **Step 5: Confirm no other page changed**

The link conversion should alter only the 17 edited pages. Anything else means a side effect.

```bash
diff -rq /tmp/docs-baseline /tmp/docs-relative 2>&1 | grep -v "sitemap.xml" | head -30
```

Expected: only the 17 edited pages plus their locale variants differ. `search/search_index.json` will also differ, which is fine since it embeds page content.

- [ ] **Step 6: Commit**

```bash
git add docs/
git commit -m "docs: convert absolute cross-links to relative mkdocs links"
```

---

## Task 3: Move the canonical hostname to docs.doublezero.xyz

**Files:**
- Modify: `mkdocs.yml:2`
- Modify: `docs/robots.txt:33`
- Modify: `hooks/emit_well_known.py:32`
- Modify: `well-known/agent-skills/doublezero-docs/SKILL.md` (9 occurrences)

**Interfaces:**
- Consumes: the working build from Task 1.
- Produces: a build whose `sitemap.xml`, canonical tags, and `.well-known` URLs all reference `https://docs.doublezero.xyz`.

- [ ] **Step 1: Change `site_url`**

In `mkdocs.yml` line 2, replace:

```yaml
site_url: https://docs.malbeclabs.com/
```

with:

```yaml
site_url: https://docs.doublezero.xyz/
```

- [ ] **Step 2: Change the sitemap pointer in robots.txt**

In `docs/robots.txt` line 33, replace:

```
Sitemap: https://docs.malbeclabs.com/sitemap.xml
```

with:

```
Sitemap: https://docs.doublezero.xyz/sitemap.xml
```

- [ ] **Step 3: Change `SITE_BASE` in the well-known hook**

In `hooks/emit_well_known.py` line 32, replace:

```python
SITE_BASE = "https://docs.malbeclabs.com"
```

with:

```python
SITE_BASE = "https://docs.doublezero.xyz"
```

- [ ] **Step 4: Update the 9 URLs in SKILL.md**

In `well-known/agent-skills/doublezero-docs/SKILL.md`, replace every `https://docs.malbeclabs.com` with `https://docs.doublezero.xyz`. Leave surrounding prose, the `license:` field structure, and all paths after the hostname untouched.

```bash
grep -c "docs\.doublezero\.xyz" well-known/agent-skills/doublezero-docs/SKILL.md
grep -c "docs\.malbeclabs\.com" well-known/agent-skills/doublezero-docs/SKILL.md
```

Expected: 9 and 0.

The SHA-256 digest in `.well-known/agent-skills/index.json` is computed at build time by the hook, so editing SKILL.md updates it automatically. Never hand-edit a digest.

- [ ] **Step 5: Rebuild and verify every generated reference moved**

```bash
.venv/bin/mkdocs build --site-dir /tmp/docs-canonical 2>&1 | grep -i warning | head

echo "--- sitemap must be 100% doublezero ---"
grep -c "docs\.doublezero\.xyz" /tmp/docs-canonical/sitemap.xml
grep -c "docs\.malbeclabs\.com" /tmp/docs-canonical/sitemap.xml

echo "--- canonical tag on the homepage ---"
grep -o '<link rel="canonical"[^>]*>' /tmp/docs-canonical/index.html

echo "--- well-known index URLs and digests ---"
cat /tmp/docs-canonical/.well-known/agent-skills/index.json

echo "--- CNAME must still be malbeclabs ---"
cat /tmp/docs-canonical/CNAME
```

Expected: sitemap has zero malbeclabs references and a nonzero doublezero count. Canonical tag points at `https://docs.doublezero.xyz/`. The well-known index shows doublezero URLs and a `sha256:` digest. `CNAME` still reads `docs.malbeclabs.com`.

- [ ] **Step 6: Confirm no malbeclabs references survive anywhere except CNAME**

```bash
grep -rn "docs\.malbeclabs\.com" --include="*.yml" --include="*.py" --include="*.md" --include="*.txt" --include="*.json" . \
  | grep -v "^./site/" | grep -v "^./.venv/" | grep -v "^./.specs/"
```

Expected output: only `docs/CNAME`. The `.specs/` design docs legitimately discuss the old hostname and are excluded.

- [ ] **Step 7: Commit**

```bash
git add mkdocs.yml docs/robots.txt hooks/emit_well_known.py well-known/
git commit -m "docs: move canonical site url to docs.doublezero.xyz"
```

---

## Task 4: Create the Vercel project and prove a prebuilt deploy works

This task exists to settle the three open assumptions from the spec **before** any CI wiring, using a throwaway preview URL. Requires prerequisite P1 only if run from CI; run locally it uses your existing CLI session (`vercel whoami` already returns `armcconnell`).

**Files:**
- Create: `scripts/build-vercel-output.sh`
- Modify: none

**Interfaces:**
- Consumes: `site/` from a completed `mkdocs build`.
- Produces: `scripts/build-vercel-output.sh`, which takes a tar of the site and populates `.vercel/output/`. Task 5 calls this script from CI, so its path and argument contract are fixed here: `build-vercel-output.sh <path-to-site-tar>`.

- [ ] **Step 1: Create the Vercel project**

```bash
vercel project add doublezero-docs --scope doublezero-foundation
vercel project ls --scope doublezero-foundation | grep doublezero-docs
```

- [ ] **Step 2: Write the Build Output API packaging script**

This script is the single definition of how `site/` becomes a Vercel deployment. CI reuses it, so the two paths cannot diverge.

Create `scripts/build-vercel-output.sh`:

```bash
#!/usr/bin/env bash
# Populate .vercel/output/ from a tar of the mkdocs site directory.
#
# Takes the SAME tar that is uploaded to GitHub Pages, so both origins are
# guaranteed to serve byte-identical content.
#
# Usage: scripts/build-vercel-output.sh <path-to-site-tar>
set -euo pipefail

SITE_TAR="${1:?usage: build-vercel-output.sh <path-to-site-tar>}"

rm -rf .vercel/output
mkdir -p .vercel/output/static

# The tar is created with `-C site .`, so it extracts as the site root.
# Using tar (not cp) is deliberate: it preserves the .well-known dot-directory,
# which shell globs and some copy tools silently skip.
tar -xf "$SITE_TAR" -C .vercel/output/static

# trailingSlash matches mkdocs use_directory_urls, so /setup and /setup/ do not
# become two distinct URLs. The error route serves mkdocs' own 404.html.
cat > .vercel/output/config.json <<'JSON'
{
  "version": 3,
  "trailingSlash": true,
  "routes": [
    { "handle": "error" },
    { "src": "/.*", "status": 404, "dest": "/404.html" }
  ]
}
JSON

echo "--- .vercel/output/static top level ---"
ls -a .vercel/output/static | head -20
test -d .vercel/output/static/.well-known || { echo "FATAL: .well-known missing"; exit 1; }
echo "OK: .well-known present"
```

Make it executable:

```bash
chmod +x scripts/build-vercel-output.sh
```

- [ ] **Step 3: Build the site and package it exactly as CI will**

```bash
.venv/bin/mkdocs build
mkdir -p /tmp/vercel-test
tar --dereference -cf /tmp/vercel-test/artifact.tar -C site .
scripts/build-vercel-output.sh /tmp/vercel-test/artifact.tar
```

Expected: the script prints `OK: .well-known present`. If it exits with `FATAL`, the dot-directory did not survive, and the tar step is wrong. Fix before continuing.

- [ ] **Step 4: Deploy a preview and capture its URL**

```bash
vercel deploy --prebuilt --scope doublezero-foundation --yes 2>&1 | tee /tmp/vercel-deploy.log
PREVIEW_URL=$(grep -oE 'https://[a-z0-9-]+\.vercel\.app' /tmp/vercel-deploy.log | tail -1)
echo "preview: $PREVIEW_URL"
```

If `vercel deploy --prebuilt` complains about missing project linkage, run `vercel link --project doublezero-docs --scope doublezero-foundation --yes` and retry. Do not commit the `.vercel/` directory it creates; Task 1 already git-ignored it.

- [ ] **Step 5: Settle all three open assumptions against the live preview**

This is the payoff of the whole task. Every check must pass before CI is touched.

```bash
echo "--- 1. .well-known served (spec assumption 1) ---"
curl -sS -o /dev/null -w "%{http_code}\n" "$PREVIEW_URL/.well-known/agent-skills/index.json"
curl -sS "$PREVIEW_URL/.well-known/mcp/server-card.json" | head -5

echo "--- 2. 404.html returns a real 404 status (spec assumption 2) ---"
curl -sS -o /dev/null -w "%{http_code}\n" "$PREVIEW_URL/definitely-not-a-real-page/"

echo "--- 3. all 8 locales resolve (spec assumption 3) ---"
for loc in "" es/ fr/ it/ ja/ ko/ pt/ zh/; do
  printf "/%s -> " "$loc"
  curl -sS -o /dev/null -w "%{http_code}\n" "$PREVIEW_URL/$loc"
done

echo "--- 4. trailing slash behavior ---"
curl -sS -o /dev/null -w "no-slash: %{http_code} -> %{redirect_url}\n" "$PREVIEW_URL/setup"
curl -sS -o /dev/null -w "with-slash: %{http_code}\n" "$PREVIEW_URL/setup/"

echo "--- 5. canonical tag points at doublezero, not the vercel.app URL ---"
curl -sS "$PREVIEW_URL/" | grep -o '<link rel="canonical"[^>]*>'

echo "--- 6. llms.txt and sitemap ---"
curl -sS -o /dev/null -w "llms.txt: %{http_code}\n" "$PREVIEW_URL/llms.txt"
curl -sS -o /dev/null -w "llms-full.txt: %{http_code}\n" "$PREVIEW_URL/llms-full.txt"
curl -sS -o /dev/null -w "sitemap: %{http_code}\n" "$PREVIEW_URL/sitemap.xml"

echo "--- 7. search index loads (material search is client-side) ---"
curl -sS -o /dev/null -w "search_index: %{http_code}\n" "$PREVIEW_URL/search/search_index.json"
```

Required results: check 1 returns `200` and valid JSON. Check 2 returns `404`, not `200`. All 8 locales return `200`. `/setup` either `200` or a `3xx` to `/setup/`; `/setup/` returns `200`. Canonical shows `docs.doublezero.xyz`. Checks 6 and 7 all `200`.

If check 2 returns `200`, the error route is wrong. If it returns a bare Vercel 404 page rather than the styled MkDocs one, adjust the `routes` block and redeploy. Report the final working config.

- [ ] **Step 6: Record the project identifiers as repo secrets**

These are identifiers rather than credentials, so the agent can set them directly.

```bash
ORG_ID=$(python3 -c "import json;print(json.load(open('.vercel/project.json'))['orgId'])")
PROJ_ID=$(python3 -c "import json;print(json.load(open('.vercel/project.json'))['projectId'])")
echo "org=$ORG_ID project=$PROJ_ID"
gh secret set VERCEL_ORG_ID --repo malbeclabs/docs --body "$ORG_ID"
gh secret set VERCEL_PROJECT_ID --repo malbeclabs/docs --body "$PROJ_ID"
gh secret list --repo malbeclabs/docs
```

Expected: `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, and (from P1) `VERCEL_TOKEN` all listed.

- [ ] **Step 7: Commit the packaging script**

```bash
git add scripts/build-vercel-output.sh
git commit -m "ci: add vercel build output packaging script"
```

---

## Task 5: Restructure the workflow to build once and deploy twice

**Files:**
- Modify: `.github/workflows/mkdocs.yml`

**Interfaces:**
- Consumes: `scripts/build-vercel-output.sh <path-to-site-tar>` from Task 4. Secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
- Produces: the final CI topology. No later task depends on its internals.

**Key design points, each of which is a trap if ignored:**

- Both deploy jobs consume the **same** `github-pages` artifact (a tar). That is what makes byte-identical output provable rather than aspirational.
- Extracting from the tar sidesteps `actions/upload-artifact`'s `include-hidden-files: false`, which would otherwise silently drop `.well-known` if `site/` were uploaded as a directory.
- The fork gate on the Vercel job is a security control, not a convenience.
- Top-level `permissions` drops to `contents: read`; the Pages job re-grants what it needs. The old workflow's `contents: write` was never used.

- [ ] **Step 1: Replace the workflow**

Write `.github/workflows/mkdocs.yml`:

```yaml
name: docs
on:
  push:
    branches:
      - main
  pull_request:

# Least privilege at the top; the pages job re-grants what it needs.
permissions:
  contents: read

concurrency:
  group: docs-${{ github.ref }}
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - run: pip install mkdocs-material mkdocs-static-i18n
      - run: mkdocs build
      # tar --dereference is what preserves the hidden .well-known directory.
      # Both deploy jobs consume this one artifact, so the two origins cannot drift.
      - name: Package site
        run: |
          mkdir -p /tmp/pages
          tar --dereference -cf /tmp/pages/artifact.tar -C site .
      - uses: actions/upload-artifact@v4
        with:
          name: github-pages
          path: /tmp/pages/artifact.tar
          retention-days: 1
          if-no-files-found: error

  deploy-pages:
    needs: build
    if: github.event_name == 'push'
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
        with:
          artifact_name: github-pages

  deploy-vercel:
    needs: build
    # Fork PRs cannot receive secrets, so skip rather than fail. They still get
    # the build job above as validation. pull_request_target is deliberately
    # NOT used: it would expose the Vercel token to untrusted PR code.
    if: >-
      github.event_name == 'push' ||
      github.event.pull_request.head.repo.full_name == github.repository
    runs-on: ubuntu-latest
    env:
      VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
      VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with:
          name: github-pages
          path: /tmp/pages
      - run: npm install --global vercel@latest
      - name: Package for Vercel
        run: scripts/build-vercel-output.sh /tmp/pages/artifact.tar
      - name: Deploy (production)
        if: github.event_name == 'push'
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
      - name: Deploy (preview)
        if: github.event_name == 'pull_request'
        run: vercel deploy --prebuilt --token=${{ secrets.VERCEL_TOKEN }}
```

- [ ] **Step 2: Add `--strict` only if Task 1 Step 3 said it was adoptable**

If the Task 1 probe exited 0, change the build line to `mkdocs build --strict` so broken links fail CI. If it exited non-zero, leave `mkdocs build` as-is and note the pre-existing warnings for the user. Do not fix unrelated warnings here.

- [ ] **Step 3: Validate the YAML parses**

```bash
python3 -c "import yaml,sys; yaml.safe_load(open('.github/workflows/mkdocs.yml')); print('YAML OK')"
```

- [ ] **Step 4: Confirm the removed pieces were genuinely unused**

The old workflow had a "Configure Git Credentials" step and `contents: write`. Neither is needed: `actions/deploy-pages` uploads an artifact rather than pushing a branch.

```bash
git show HEAD:.github/workflows/mkdocs.yml | grep -nE "git config|contents: write"
grep -rn "gh-pages" .github/ || echo "no gh-pages branch usage, confirming deploy-pages is artifact-based"
```

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/mkdocs.yml
git commit -m "ci: build docs once and deploy to both pages and vercel"
```

- [ ] **Step 6: Push and verify CI on a real PR**

```bash
git push -u origin HEAD
gh pr create --fill
gh pr checks --watch
```

Required: `build` and `deploy-vercel` both pass; `deploy-pages` is skipped (it is gated on `push`). Fetch the preview URL from the job log and re-run the Task 4 Step 5 checks against it. **Do not merge until those pass.**

---

## Task 6: Attach the domain and verify both origins in production

Requires prerequisite P2. Run only after Task 5's PR is merged to `main` and the production deploy has succeeded.

**Files:** none. This is infrastructure plus verification.

- [ ] **Step 1: Attach the domain to the Vercel project**

```bash
vercel domains add docs.doublezero.xyz doublezero-docs --scope doublezero-foundation
```

Vercel then reports whether it can see the DNS record from P2. If it reports the domain as unverified, confirm the Cloudflare record is grey-cloud, not orange.

- [ ] **Step 2: Wait for DNS and the certificate**

```bash
dig +short CNAME docs.doublezero.xyz
vercel domains inspect docs.doublezero.xyz --scope doublezero-foundation
```

Expected: the CNAME resolves toward `cname.vercel-dns.com`, and Vercel reports a valid certificate. Certificate issuance usually takes under a minute after DNS propagates.

- [ ] **Step 3: Verify the new canonical origin**

```bash
NEW=https://docs.doublezero.xyz
curl -sS -o /dev/null -w "root: %{http_code}\n" "$NEW/"
curl -sS -o /dev/null -w "well-known: %{http_code}\n" "$NEW/.well-known/agent-skills/index.json"
curl -sS -o /dev/null -w "404 path: %{http_code}\n" "$NEW/nope/"
curl -sS "$NEW/" | grep -o '<link rel="canonical"[^>]*>'
for loc in "" es/ fr/ it/ ja/ ko/ pt/ zh/; do
  printf "/%s -> " "$loc"; curl -sS -o /dev/null -w "%{http_code}\n" "$NEW/$loc"
done
```

- [ ] **Step 4: Verify the legacy origin is completely unaffected**

This is the whole point of the design. `docs.malbeclabs.com` must still serve its own content, not redirect.

```bash
OLD=https://docs.malbeclabs.com
curl -sS -o /dev/null -w "root: %{http_code} (expect 200, NOT 301/302)\n" "$OLD/"
curl -sS -o /dev/null -w "well-known: %{http_code}\n" "$OLD/.well-known/agent-skills/index.json"
echo "--- canonical on the OLD host must point at the NEW host ---"
curl -sS "$OLD/" | grep -o '<link rel="canonical"[^>]*>'
echo "--- CNAME still intact ---"
curl -sS "$OLD/CNAME"
```

Expected: `200` on the old host with no redirect. Its canonical tag points at `docs.doublezero.xyz`. `CNAME` still reads `docs.malbeclabs.com`.

- [ ] **Step 5: Prove both origins serve identical content**

```bash
for path in .well-known/agent-skills/index.json llms.txt sitemap.xml; do
  a=$(curl -sS "https://docs.doublezero.xyz/$path" | shasum -a 256 | cut -d' ' -f1)
  b=$(curl -sS "https://docs.malbeclabs.com/$path" | shasum -a 256 | cut -d' ' -f1)
  [ "$a" = "$b" ] && echo "MATCH   $path" || echo "DIFFER  $path"
done
```

All three must report `MATCH`. A mismatch means the two origins are serving different builds and the single-artifact guarantee has broken somewhere in Task 5.

- [ ] **Step 6: Report completion**

Summarize for the user: both hostnames live, canonical consolidated on doublezero, the old host serving 200s rather than redirecting, and the digest comparison from Step 5. Note that retiring `docs.malbeclabs.com` later means deleting the `deploy-pages` job and adding a Cloudflare redirect rule, whenever they choose.

---

## Deliberately Out of Scope

Carried over from the spec. Do not do these:

- Removing the vestigial root `CNAME` file (only `docs/CNAME` reaches the artifact).
- Untracking the committed `site/` build output.
- Any Cloudflare redirect rule, or retiring `docs.malbeclabs.com`.
- Enabling Cloudflare's orange-cloud proxy in front of Vercel.
- Fixing pre-existing mkdocs build warnings unrelated to these links.
