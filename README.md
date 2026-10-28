# Malbec Labs Docs

## Local development

Install the required plugin so `mkdocs serve` works:

```bash
pip install mkdocs-static-i18n
pip install pymdown-extensions
pip install mkdocs-material
```

Then run:

```bash
mkdocs serve
```
## Translations

The `Auto-translate docs` workflow translates English pages under `docs/` into every locale in `mkdocs.yml`. `translations.json` records the git hash of the English source each translation was made from. A translation is redone when it is missing or its recorded hash no longer matches the source.

- Preview what would be translated: `python scripts/translate.py --dry-run` (add `--changed origin/main` to limit it to your branch's pages).
- Force a page to be redone, for example to repair a bad translation: run the workflow from the Actions tab with that page in `files`, or delete its entries from `translations.json`.

## CI

`docs` (`.github/workflows/mkdocs.yml`) builds the site on every pull request and push to `main`, and publishes `main` to GitHub Pages. `actions-lint` checks the workflows.

Vercel serves docs.doublezero.xyz and builds it from `main` itself, through its GitHub app: `vercel.json` runs `scripts/vercel-build.sh`, which is the same build with the same pinned packages. No Vercel token is stored in this repository, and branches do not build on Vercel. Preview locally with `mkdocs serve`.
