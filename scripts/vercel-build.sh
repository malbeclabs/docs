#!/usr/bin/env bash
# The build Vercel runs for docs.doublezero.xyz, from vercel.json. It is the
# docs workflow's build: the same pinned packages, the same allowed warning, and
# the same site tar handed to build-vercel-output.sh.
set -euo pipefail

# requirements.txt carries hashes for Python 3.12 only.
python3.12 -m venv .venv
.venv/bin/pip install --require-hashes -r requirements.txt

.venv/bin/mkdocs build 2>&1 | tee mkdocs-build.log
allowed='mkdocs_static_i18n: mkdocs-material language switcher contextual link is not compatible with theme.features = navigation.instant'
unexpected=$(grep -E '^WARNING' mkdocs-build.log | grep -vF "$allowed" || true)
if [ -n "$unexpected" ]; then
  echo "Unexpected mkdocs WARNING(s):" >&2
  echo "$unexpected" >&2
  exit 1
fi

tar --dereference -cf site.tar -C site .
scripts/build-vercel-output.sh site.tar
