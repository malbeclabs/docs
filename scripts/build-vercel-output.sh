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

# Moved pages: redirects.json maps old URLs to new ones. Each entry becomes a
# 308 for the page (with or without the trailing slash) and for its raw
# index.md, in every locale. They run before the trailing-slash route so an old
# URL lands on its new page in one hop. Old names with spaces match both the
# encoded and the decoded form.
#
# Prebuilt output ignores vercel.json-style "trailingSlash", so the redirect is
# an explicit route. Without it /hyperliquid is served as-is and relative links
# (edge/, ../setup/) resolve one directory too high. .well-known must stay
# unredirected. The error route serves mkdocs' 404.html.
python3 - redirects.json > .vercel/output/config.json <<'PY'
import json, re, sys
from urllib.parse import quote

LOCALE = "((?:zh|ja|ko|pt|es|fr|it)/)?"

def pattern(path):
    return "(?:%20| )".join(re.sub(r"([.^$*+?()\[\]{}|\\])", r"\\\1", part) for part in path.rstrip("/").split(" "))

routes = []
with open(sys.argv[1], encoding="utf-8") as fh:
    for old, new in json.load(fh).items():
        src, dest = pattern(old), quote(new, safe="/._-~")
        routes.append({"src": f"^/{LOCALE}{src}/index\\.md$", "headers": {"Location": f"/$1{dest}index.md"}, "status": 308})
        routes.append({"src": f"^/{LOCALE}{src}/?$", "headers": {"Location": f"/$1{dest}"}, "status": 308})
routes += [
    {"src": "^/(?!\\.well-known(?:/|$))((?:[^/]+/)*[^/.]+)$", "headers": {"Location": "/$1/"}, "status": 308},
    {"handle": "error"},
    {"src": "/.*", "status": 404, "dest": "/404.html"},
]
json.dump({"version": 3, "routes": routes}, sys.stdout, indent=2)
PY

echo "--- .vercel/output/static top level ---"
ls -a .vercel/output/static | head -20
test -d .vercel/output/static/.well-known || { echo "FATAL: .well-known missing"; exit 1; }
echo "OK: .well-known present"
