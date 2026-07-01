# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

This holds Romanian-language training materials for an internal "AI Fluency" program (transitioning a SQL developer team at SSP toward AI-assisted / full-stack development), plus a small static website that publishes the course sessions. There is no build system, package manager, linter, or test suite — none exist and none should be assumed; the site is plain HTML/CSS/JS with zero build step and zero server dependency (open any `.html` file directly in a browser, or serve the directory as-is with any static file server). The directory is now a local git repo (it previously was not).

Content sources:

- [`suport-curs-sesiunea-1.md`](suport-curs-sesiunea-1.md) — facilitator's guide for Session 1 ("Prima zi cu Claude: de la SQL developer la AI-assisted developer"). A run-of-show document: timings, live-demo scripts, copy-paste prompts for exercises, a facilitation notes section ("Note de facilitare — doar pentru Ionut") with pacing/pairing guidance, and an appendix on data-safety rules (Anexa 2 — never send real customer data, connection strings, credentials, or PROD dumps to Claude; the org is in the pharma distribution space). **This facilitator-only content (including the "Note de facilitare" section) must never be copied into any public HTML page** — the public site is a participant-facing derivative, not a republish of the facilitator's guide.
- [`ai-fluency-trainer-kit.html`](ai-fluency-trainer-kit.html) — a single self-contained static HTML page (no external JS deps, Google Fonts only) that is a broader "trainer kit" reference for becoming an AI Fluency trainer/facilitator, built on the Anthropic AI Fluency framework (4D loop: Delegare/Descriere/Discernământ/Diligență) and adult-learning pedagogy. It's a long single-page site with anchor-linked sections (`#framework`, `#drum`, `#curs`, `#nisa`, `#pedagogie`, `#practic`), a light/dark theme toggle, and heavy inline CSS using custom properties for theming. It remains separate trainer-only material — it is not linked from or merged into the participant-facing site below, though its design system (colors, type, theme toggle) was extracted verbatim into `assets/` for reuse there.

The participant-facing site — file layout:

- `index.html` — course landing page listing all 4 sessions; only the Session 1 card is a live link (`<a>`), the Session 2–4 cards are inert `<div>`s (marked "În curând") since only Session 1 content exists so far.
- `sesiune-1.html` through `sesiune-4.html` — one HTML page per session, converted by hand from the corresponding session source material (no automated MD→HTML conversion). `sesiune-1.html` is the only page with real content; `sesiune-2.html`–`sesiune-4.html` are placeholders reachable by direct URL.
- `assets/styles.css` and `assets/theme.js` — the shared design system (CSS custom properties, layout, and the light/dark `toggleTheme()` logic), extracted from `ai-fluency-trainer-kit.html`. Both `index.html` and every `sesiune-N.html` page consume these via `<link rel="stylesheet" href="assets/styles.css">` / `<script src="assets/theme.js">` rather than inlining styles — this is the one shared dependency between all the site's pages, so changes to `assets/` affect every page at once.

`excalidraw.log` is a stray MCP server log file, not part of the content — ignore it unless asked to clean it up.

## Working conventions

- **Language**: all course content is Romanian, including the site pages. Preserve Romanian when editing `suport-curs-sesiunea-1.md` or any `sesiune-N.html`; match existing terminology (e.g. "Delegare/Descriere/Discernământ/Diligență", "sql-enterprise" skill name, `SMT-FAT-SQLB01` / `BufferSap` as the example server/DB) rather than introducing new translations.
- **`ai-fluency-trainer-kit.html` is hand-authored, single-file HTML/CSS** — there's no template engine or bundler. Edit the `<style>` block and markup directly; keep it dependency-free (no new external scripts/CDNs) and keep the light/dark theme working by using the existing CSS custom properties (`--paper`, `--ink`, `--rust`, `--teal`, `--gold`, etc.) rather than hardcoded colors.
- **`index.html` and `sesiune-N.html` are also hand-authored** — no template engine or bundler for these either. They link the shared `assets/styles.css` / `assets/theme.js` instead of inlining CSS; keep new pages consistent with that pattern rather than copy-pasting styles inline.
- **Facilitator-only content is never public**: anything scoped to the facilitator (pacing notes, internal pairing guidance, the "Note de facilitare" section of `suport-curs-sesiunea-1.md`) stays out of `index.html` and every `sesiune-N.html`. When converting session source material into a `sesiune-N.html` page, only carry over participant-facing content.
- **Data-safety rule referenced throughout the course material** (Anexa 2 in the session doc) also applies to work done in this repo: don't add real customer/patient data, credentials, connection strings, or PROD data dumps into any file here.
- There is no "run" or "preview" command beyond opening the `.html` files directly in a browser, or serving the directory with any static file server (e.g. any local HTTP static server) — no server-side logic is involved either way.
