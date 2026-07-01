# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

This is a **content-only** directory, not a software project. There is no build system, package manager, linter, or test suite — none exist and none should be assumed. It holds Romanian-language training materials for an internal "AI Fluency" program (transitioning a SQL developer team at SSP toward AI-assisted / full-stack development).

There are two content pieces:

- [`suport-curs-sesiunea-1.md`](suport-curs-sesiunea-1.md) — facilitator's guide for Session 1 ("Prima zi cu Claude: de la SQL developer la AI-assisted developer"). A run-of-show document: timings, live-demo scripts, copy-paste prompts for exercises, a facilitation notes section ("Note de facilitare — doar pentru Ionut") with pacing/pairing guidance, and an appendix on data-safety rules (Anexa 2 — never send real customer data, connection strings, credentials, or PROD dumps to Claude; the org is in the pharma distribution space).
- [`ai-fluency-trainer-kit.html`](ai-fluency-trainer-kit.html) — a single self-contained static HTML page (no external JS deps, Google Fonts only) that is a broader "trainer kit" reference for becoming an AI Fluency trainer/facilitator, built on the Anthropic AI Fluency framework (4D loop: Delegare/Descriere/Discernământ/Diligență) and adult-learning pedagogy. It's a long single-page site with anchor-linked sections (`#framework`, `#drum`, `#curs`, `#nisa`, `#pedagogie`, `#practic`), a light/dark theme toggle, and heavy inline CSS using custom properties for theming.

`excalidraw.log` is a stray MCP server log file, not part of the content — ignore it unless asked to clean it up.

## Working conventions

- **Language**: all course content is Romanian. Preserve Romanian when editing `suport-curs-sesiunea-1.md`; match existing terminology (e.g. "Delegare/Descriere/Discernământ/Diligență", "sql-enterprise" skill name, `SMT-FAT-SQLB01` / `BufferSap` as the example server/DB) rather than introducing new translations.
- **`ai-fluency-trainer-kit.html` is hand-authored, single-file HTML/CSS** — there's no template engine or bundler. Edit the `<style>` block and markup directly; keep it dependency-free (no new external scripts/CDNs) and keep the light/dark theme working by using the existing CSS custom properties (`--paper`, `--ink`, `--rust`, `--teal`, `--gold`, etc.) rather than hardcoded colors.
- **Data-safety rule referenced throughout the course material** (Anexa 2 in the session doc) also applies to work done in this repo: don't add real customer/patient data, credentials, connection strings, or PROD data dumps into any file here.
- There is no "run" or "preview" command beyond opening the `.html` file directly in a browser.
