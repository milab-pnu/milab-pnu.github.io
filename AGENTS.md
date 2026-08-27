## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

Convenience wrappers: `.\dev.ps1 [start|stop|status|logs|restart]` or the
`npm run dev:bg` / `dev:stop` / `dev:status` / `dev:logs` scripts. Dev server: http://localhost:4321/milab

## Lecture content

Lecture pages come from **separate GitHub repos** (one per course), not this repo.
`lectures.config.json` lists them; `scripts/sync-lectures.mjs` clones each into
`lectures/<slug>/` (gitignored) before every build/dev via the `prebuild`/`predev`
hooks (and `dev.ps1`). Not git submodules. Never edit under `lectures/` — work in the
course's own clone at `pnu/lectures/<semester>/<course>/`.

- **Authoring rules (canonical):** `docs/lecture-authoring.md` — frontmatter schemas,
  math/image conventions, new-course flow, gotchas. New rules get folded in there.
- **Design:** `docs/superpowers/specs/2026-08-27-lecture-content-repos-design.md`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
