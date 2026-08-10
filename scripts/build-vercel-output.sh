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
