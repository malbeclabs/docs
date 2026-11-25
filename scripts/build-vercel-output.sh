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

# RFC 8288 Link header surfacing the agent-orientation files to HTTP-only
# crawlers (the HTML pages already carry equivalent <link rel="alternate">
# tags). `continue: true` keeps the request flowing through the redirect and
# fallthrough routes below.
LINK_HEADER = ", ".join([
    '</llms.txt>; rel="alternate"; type="text/plain"',
    '</llms-full.txt>; rel="alternate"; type="text/plain"',
    '</.well-known/api-catalog>; rel="api-catalog"',
])

# The api-catalog file is written without an extension (RFC 9727 convention), so
# Vercel defaults it to application/octet-stream. Force the linkset Content-Type
# before the generic Link-header route so both headers land on the response.
routes = [
    {
        "src": "^/\\.well-known/api-catalog$",
        "headers": {
            "Content-Type": 'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"',
        },
        "continue": True,
    },
    # `Vary: Accept` is required because the Accept-based rewrite below returns
    # HTML or markdown for the same URL depending on the request Accept header.
    # Vercel's own cache keys on the rewritten destination path, but downstream
    # caches (browsers, Cloudflare, corporate proxies) would otherwise serve the
    # wrong body cross-client without this signal.
    {"src": "/.*", "headers": {"Link": LINK_HEADER, "Vary": "Accept"}, "continue": True},
]
with open(sys.argv[1], encoding="utf-8") as fh:
    for old, new in json.load(fh).items():
        src, dest = pattern(old), quote(new, safe="/._-~")
        routes.append({"src": f"^/{LOCALE}{src}/index\\.md$", "headers": {"Location": f"/$1{dest}index.md"}, "status": 308})
        routes.append({"src": f"^/{LOCALE}{src}/?$", "headers": {"Location": f"/$1{dest}"}, "status": 308})
routes += [
    # Content negotiation: agents that send `Accept: text/markdown` get the
    # sidecar `<page>/index.md` instead of the HTML. hooks/emit_markdown.py
    # writes the sidecar for every page in every locale, so matching any
    # trailing-slash path is safe. Browsers never advertise text/markdown,
    # so no risk of swapping HTML out from under a human. Positioned after
    # the per-file redirects above so a redirected old URL still 308s first
    # (the agent then re-requests the new URL with Accept intact and lands
    # on the right .md).
    {
        "src": "^/((?:[^/]+/)*)$",
        "has": [{"type": "header", "key": "accept", "value": ".*text/markdown.*"}],
        "dest": "/$1index.md",
    },
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
