# ChartKit docs mocks

Static HTML/CSS design mocks for the left-nav docs information architecture. **Draft only — not production.** They are here so the layout can be clicked through locally. They are not the ChartKit docs site and are not wired into the Next.js app under `docs/`.

## Click through locally

After checking out this branch:

```bash
git fetch origin
git checkout cursor/docs-mocks-html-6c6f
cd docs-mocks
python3 -m http.server 8766
# open http://127.0.0.1:8766/chartkit-mock-docs.html
```

`http://127.0.0.1:8766/` also lands on Overview (`index.html` redirects to `chartkit-mock-docs.html`).

## URLs

Production chartkit.dev must use extensionless URLs. These mocks keep `.html` filenames only so a static file server can open them. Do not copy the `.html` paths into the production docs routes.

## Links

Side-nav links between pages use relative `.html` hrefs. Serve the whole `docs-mocks/` folder as the web root (or open the files from this directory). Opening a single file from another folder, or rewriting the links to extensionless paths, will break navigation between pages.
