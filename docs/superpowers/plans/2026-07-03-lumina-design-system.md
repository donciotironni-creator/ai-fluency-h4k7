# Lumina Design System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reskin the AI Fluency static site (14 HTML pages, minus the orphaned `01-program-10-saptamani.html`) with the Lumina design system's visual language (colors, typography, spacing/radius, component treatments) while keeping the existing static-page architecture unchanged.

**Architecture:** No new frameworks, no build step, no JS logic changes. This is a CSS + `<head>`/markup reskin across three style surfaces: the shared `assets/style.css` (used by `index.html` + `s0.html`–`s10.html`), and two self-contained inline `<style>` blocks (`dictionar.html`). `assets/main.js` already toggles classes generically (`.tab`/`.role-btn`, `.panel`/`.role-panel`) so no JS changes are needed.

**Tech Stack:** Plain HTML/CSS/JS (no build tooling). Fonts via Google Fonts (`Spectral` + `Hanken Grotesk`, replacing `Fraunces` + `DM Mono`). Visual verification via the `preview_*` browser tools (no automated test suite exists for this static site).

## Global Constraints

- Full source design reference: `Design sistem e-learning-handoff/design-sistem-e-learning/project/Lumina Design System.dc.html` — exact hex values below are taken from it.
- Spec: `docs/superpowers/specs/2026-07-03-lumina-design-system-design.md` — read the "Corecție de scop" section before starting; `01-program-10-saptamani.html` is explicitly OUT of scope (orphaned, not linked from any page).
- No gamification elements (streak/XP/level/leaderboard) — confirmed out of scope with the user.
- Keep `assets/main.js` and `assets/glossary.js` untouched — no class renames that would break `initTabs()`/`highlightNav()` in `assets/main.js:16-42`.
- Dark mode must be derived for every new token (Lumina has no native dark mode) — every `:root` token added in Task 1 needs a `[data-theme="dark"]` counterpart.

---

### Task 1: Rewrite `assets/style.css` with Lumina tokens, typography, and components

**Files:**
- Modify: `assets/style.css` (full rewrite, same file, same class names — see "No renames" below)

**Interfaces:**
- Consumes: nothing (leaf CSS file, no dependencies on other tasks)
- Produces: every CSS custom property and class selector used by `index.html`, `s0.html`–`s10.html` in Task 2. Class names are **unchanged** from the current file (`.card`, `.tag`, `.badge-p0..p3`, `.callout`/`.callout-blue`/`.callout-green`, `.tabs`/`.tab`, `.role-switch`/`.role-btn`, `.session-card`, `.sc-phase.p0..p3`, `.agenda*`, `.exercise*`, `.success-box*`, `.prompt-box*`, `.warning-card`, `.checklist`, `.diag-grid`, `.diag-row`, `.diag-num`, `.diag-score`, `.template-block`, `.page-nav`, `.section-label`, `.glossary-link`, `.site-nav`, `.nav-logo`, `.nav-sessions`, `.nav-pill`, `.nav-divider`, `.nav-toggle`, `.coming-soon-wrap`) — only their new addition is `.nav-logo-mark` / `.nav-logo-ring` (new inner spans for the logo icon, added in Task 2's markup change).

- [ ] **Step 1: Replace the entire contents of `assets/style.css`**

```css
/* AI Fluency — shared design system (Lumina) */

:root {
  --paper: #F7F5F0;
  --paper-2: #F1EEE7;
  --surface: #FFFFFF;
  --ink: #1A211E;
  --ink-soft: #6B746E;
  --ink-mute: #A3A79E;
  --line: #E5E1D8;
  --accent: #1F5C4B;
  --accent-dark: #163F33;
  --accent-soft: #E4EFEA;
  --gold: #C67B2E;
  --gold-dark: #9A5C1E;
  --gold-soft: #FBEEDD;
  --success: #2E7D5B;
  --success-soft: #E7F1EC;
  --warning: #D9A036;
  --warning-soft: #FBF3E1;
  --danger: #C24B3F;
  --danger-soft: #FDF3F1;
  --info: #3A6EA5;
  --info-soft: #EAF0F7;
  --radius: 10px;
  --radius-lg: 14px;
  --shadow-sm: 0 1px 2px rgba(26,33,30,.06);
  --shadow-md: 0 4px 14px rgba(26,33,30,.09);
  --nav-h: 60px;
}

[data-theme="dark"] {
  --paper: #171D1A;
  --paper-2: #1E2521;
  --surface: #212925;
  --ink: #EDEAE2;
  --ink-soft: #A9B0AA;
  --ink-mute: #7C857F;
  --line: #333B36;
  --accent: #4FA98A;
  --accent-dark: #1F5C4B;
  --accent-soft: rgba(79,169,138,.16);
  --gold: #E0A059;
  --gold-dark: #C67B2E;
  --gold-soft: rgba(224,160,89,.16);
  --success: #4CAF82;
  --success-soft: rgba(76,175,130,.14);
  --warning: #E0B84D;
  --warning-soft: rgba(224,184,77,.14);
  --danger: #E07A6E;
  --danger-soft: rgba(224,122,110,.14);
  --info: #6FA0D6;
  --info-soft: rgba(111,160,214,.14);
  --shadow-sm: 0 1px 2px rgba(0,0,0,.25);
  --shadow-md: 0 6px 18px rgba(0,0,0,.35);
}

*, *::before, *::after { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--paper);
  color: var(--ink);
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  transition: background .3s, color .3s;
  padding-top: var(--nav-h);
}

/* ── NAV ── */

.site-nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: var(--nav-h);
  background: var(--surface);
  border-bottom: 1px solid var(--line);
  z-index: 100;
  display: flex;
  align-items: center;
  padding: 0 22px;
  gap: 10px;
  transition: background .3s;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 9px;
  font-family: 'Spectral', Georgia, serif;
  font-weight: 700;
  font-size: 15px;
  color: var(--ink);
  text-decoration: none;
  letter-spacing: -.01em;
  white-space: nowrap;
  margin-right: 4px;
}

.nav-logo-mark {
  width: 26px;
  height: 26px;
  border-radius: 7px;
  background: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
}

.nav-logo-ring {
  width: 11px;
  height: 11px;
  border: 2px solid #fff;
  border-radius: 50%;
  border-right-color: transparent;
}

.nav-sessions {
  display: flex;
  gap: 3px;
  overflow-x: auto;
  flex: 1;
  scrollbar-width: none;
}
.nav-sessions::-webkit-scrollbar { display: none; }

.nav-pill {
  font-family: 'Hanken Grotesk', sans-serif;
  font-weight: 600;
  font-size: 12px;
  padding: 5px 12px;
  border-radius: 999px;
  color: var(--ink-soft);
  text-decoration: none;
  white-space: nowrap;
  border: 1px solid transparent;
  transition: all .15s;
}
.nav-pill:hover { background: var(--paper-2); border-color: var(--line); color: var(--ink); }
.nav-pill.active { background: var(--accent); color: #fff; }

.nav-divider {
  width: 1px;
  height: 20px;
  background: var(--line);
  flex-shrink: 0;
}

.nav-toggle {
  font-family: ui-monospace, Menlo, 'Cascadia Code', monospace;
  font-size: 12px;
  background: var(--surface);
  color: var(--ink-soft);
  border: 1.5px solid var(--line);
  border-radius: 999px;
  padding: 5px 12px;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all .15s;
}
.nav-toggle:hover { border-color: var(--accent); color: var(--accent); }

/* ── LAYOUT ── */

.wrap { max-width: 920px; margin: 0 auto; padding: 40px 28px 80px; }

/* ── TYPOGRAPHY ── */

.kicker {
  font-family: ui-monospace, Menlo, 'Cascadia Code', monospace;
  font-size: 12px;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: var(--accent);
  display: block;
}

h1 { font-family: 'Spectral', Georgia, serif; font-weight: 700; font-size: 2.5rem; letter-spacing: -.015em; margin: 6px 0 10px; line-height: 1.08; }
h2 { font-family: 'Spectral', Georgia, serif; font-weight: 700; font-size: 1.75rem; letter-spacing: -.01em; margin-top: 0; margin-bottom: 12px; }
h3 { font-size: 1.2rem; font-weight: 700; margin: 0 0 4px; }
h4 { font-size: 1rem; font-weight: 700; margin: 20px 0 6px; }

.sub { color: var(--ink-soft); font-size: 1.05rem; max-width: 660px; line-height: 1.6; margin-bottom: 28px; }
p { line-height: 1.65; margin-top: 0; }
ul, ol { padding-left: 20px; margin: 8px 0 12px; }
li { margin-bottom: 5px; line-height: 1.55; }
strong { font-weight: 700; }

/* ── CARDS ── */

.card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  padding: 20px 24px;
  margin-bottom: 16px;
}

/* ── TABS (unified pill pattern — shared by overview tabs and role tabs) ── */

.tabs, .role-switch {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  background: var(--paper-2);
  padding: 4px;
  border-radius: 12px;
  margin-bottom: 28px;
}
.role-switch { display: inline-flex; }

.tab, .role-btn {
  font-family: 'Hanken Grotesk', sans-serif;
  font-weight: 600;
  font-size: 13.5px;
  padding: 9px 18px;
  cursor: pointer;
  color: var(--ink-soft);
  background: transparent;
  border: none;
  border-radius: 9px;
  transition: all .15s;
  white-space: nowrap;
}
.tab:hover, .role-btn:not(.active):hover { color: var(--ink); }
.tab.active, .role-btn.active { background: var(--surface); color: var(--accent); box-shadow: var(--shadow-sm); }

.panel { display: none; }
.panel.active { display: block; }

.role-panel { display: none; }
.role-panel.active { display: block; }

/* ── SESSION CARDS GRID ── */

.sessions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 10px;
  margin-bottom: 44px;
}

.session-card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  padding: 15px 16px;
  text-decoration: none;
  color: var(--ink);
  display: block;
  transition: border-color .15s, box-shadow .15s;
}
.session-card:hover {
  border-color: var(--accent);
  box-shadow: var(--shadow-md);
}
.session-card.done { border-left: 3px solid var(--success); }
.session-card.coming-soon { opacity: .55; pointer-events: none; }

.sc-num {
  font-family: ui-monospace, Menlo, 'Cascadia Code', monospace;
  font-size: 10px;
  color: var(--ink-soft);
  text-transform: uppercase;
  letter-spacing: .08em;
  margin-bottom: 5px;
}
.sc-title {
  font-size: .92rem;
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 8px;
}
.sc-phase {
  font-family: ui-monospace, Menlo, 'Cascadia Code', monospace;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: .07em;
}
.sc-phase.p0 { color: var(--ink-mute); }
.sc-phase.p1 { color: var(--info); }
.sc-phase.p2 { color: var(--success); }
.sc-phase.p3 { color: var(--gold); }

/* ── BADGES & TAGS ── */

.tag {
  display: inline-block;
  font-family: ui-monospace, Menlo, 'Cascadia Code', monospace;
  font-size: 11px;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 2px 9px;
  margin: 2px 4px 2px 0;
  color: var(--ink-soft);
}

.badge {
  display: inline-block;
  font-family: ui-monospace, Menlo, 'Cascadia Code', monospace;
  font-size: 11px;
  border-radius: 999px;
  padding: 3px 10px;
  font-weight: 600;
}
.badge-p0 { background: var(--paper-2); color: var(--ink-soft); border: 1px solid var(--line); }
.badge-p1 { background: var(--info-soft); color: var(--info); border: 1px solid color-mix(in srgb, var(--info) 35%, transparent); }
.badge-p2 { background: var(--success-soft); color: var(--success); border: 1px solid color-mix(in srgb, var(--success) 35%, transparent); }
.badge-p3 { background: var(--gold-soft); color: var(--gold-dark); border: 1px solid color-mix(in srgb, var(--gold) 35%, transparent); }

/* ── CURRICULUM ROWS ── */

.week {
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid var(--line);
}
.week:last-child { border-bottom: none; }
.week-num { font-family: ui-monospace, Menlo, 'Cascadia Code', monospace; font-size: 13px; color: var(--ink-soft); padding-top: 3px; }

.phase-title {
  font-family: ui-monospace, Menlo, 'Cascadia Code', monospace;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: .1em;
  color: var(--info);
  margin: 36px 0 12px;
}

.artefact {
  font-family: ui-monospace, Menlo, 'Cascadia Code', monospace;
  font-size: 12px;
  color: var(--success);
  margin: 8px 0 2px;
  line-height: 1.5;
}
.artefact::before { content: "◆ artefact  "; opacity: .7; }

/* ── CALLOUTS (full alert-box treatment) ── */

.callout {
  background: var(--accent-soft);
  border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
  border-radius: var(--radius-lg);
  padding: 14px 18px;
  margin: 16px 0;
  color: var(--ink);
  font-size: .95rem;
  line-height: 1.6;
}
.callout strong { color: var(--accent-dark); }
.callout-blue { background: var(--info-soft); border-color: color-mix(in srgb, var(--info) 30%, transparent); }
.callout-blue strong { color: var(--info); }
.callout-green { background: var(--success-soft); border-color: color-mix(in srgb, var(--success) 30%, transparent); }
.callout-green strong { color: var(--success); }

/* ── TABLE ── */

table { width: 100%; border-collapse: collapse; margin: 12px 0; }
th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid var(--line); font-size: .95rem; vertical-align: top; }
th { font-family: ui-monospace, Menlo, 'Cascadia Code', monospace; font-size: 11px; text-transform: uppercase; letter-spacing: .06em; color: var(--ink-soft); }

/* ── CODE ── */

code {
  font-family: ui-monospace, Menlo, 'Cascadia Code', monospace;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: 4px;
  padding: 1px 6px;
  font-size: .87em;
}
pre {
  background: var(--paper-2);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  padding: 16px 18px;
  overflow-x: auto;
  margin: 12px 0;
}
pre code { background: none; border: none; padding: 0; font-size: .9em; }

/* ── SESSION PAGE HERO ── */

.session-hero { margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid var(--line); }
.session-hero h1 { margin-bottom: 12px; }
.session-hero .meta { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }

/* ── TIMING TABLE ── */

.agenda {
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin: 12px 0 20px;
}
.agenda-row {
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 0;
  border-bottom: 1px solid var(--line);
}
.agenda-row:last-child { border-bottom: none; }
.agenda-time {
  font-family: ui-monospace, Menlo, 'Cascadia Code', monospace;
  font-size: 12px;
  color: var(--ink-soft);
  padding: 10px 12px;
  background: var(--paper-2);
  border-right: 1px solid var(--line);
}
.agenda-content { padding: 10px 14px; font-size: .93rem; line-height: 1.5; }

/* ── EXERCISES ── */

.exercise {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  padding: 20px 24px;
  margin-bottom: 16px;
}
.exercise-header {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}
.ex-num { font-family: ui-monospace, Menlo, 'Cascadia Code', monospace; font-size: 11px; color: var(--ink-soft); }
.ex-time { font-family: ui-monospace, Menlo, 'Cascadia Code', monospace; font-size: 11px; color: var(--info); background: var(--info-soft); padding: 1px 8px; border-radius: 999px; }
.ex-trains { font-family: ui-monospace, Menlo, 'Cascadia Code', monospace; font-size: 11px; color: var(--ink-soft); font-style: italic; }

.success-box {
  background: var(--success-soft);
  border: 1px solid color-mix(in srgb, var(--success) 25%, transparent);
  border-radius: var(--radius);
  padding: 12px 16px;
  margin-top: 14px;
  font-size: .92rem;
  line-height: 1.55;
}
.success-box-label {
  font-family: ui-monospace, Menlo, 'Cascadia Code', monospace;
  font-size: 11px;
  color: var(--success);
  font-weight: 600;
  display: block;
  margin-bottom: 4px;
}

.prompt-box {
  background: var(--paper);
  border: 1px solid var(--line);
  border-left: 3px solid var(--info);
  border-radius: 0 var(--radius) var(--radius) 0;
  padding: 12px 16px;
  margin: 12px 0;
  font-size: .93rem;
  line-height: 1.6;
  font-style: italic;
  color: var(--ink-soft);
}
.prompt-box-label {
  font-family: ui-monospace, Menlo, 'Cascadia Code', monospace;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: .08em;
  color: var(--info);
  display: block;
  margin-bottom: 5px;
  font-style: normal;
}

/* ── SECTION SEPARATOR ── */

.section-label {
  font-family: ui-monospace, Menlo, 'Cascadia Code', monospace;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: .1em;
  color: var(--ink-soft);
  margin: 32px 0 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.section-label::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--line);
}

/* ── CAPCANE / WARNING ── */

.warning-card {
  border: 1px solid color-mix(in srgb, var(--danger) 30%, transparent);
  background: var(--danger-soft);
  border-radius: var(--radius-lg);
  padding: 16px 20px;
  margin-bottom: 12px;
}
.warning-card h4 { color: var(--danger); margin-top: 0; }

/* ── CHECKLIST ── */

.checklist { list-style: none; padding: 0; margin: 8px 0; }
.checklist li {
  padding: 6px 0 6px 28px;
  position: relative;
  border-bottom: 1px solid var(--line);
  font-size: .93rem;
}
.checklist li:last-child { border-bottom: none; }
.checklist li::before {
  content: '☐';
  font-family: monospace;
  position: absolute;
  left: 4px;
  color: var(--ink-soft);
}

/* ── TEMPLATE BLOCK ── */

.template-block {
  background: var(--paper-2);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  padding: 16px 18px;
  font-family: ui-monospace, Menlo, 'Cascadia Code', monospace;
  font-size: .85em;
  line-height: 1.7;
  white-space: pre-wrap;
  overflow-x: auto;
}

/* ── PREV / NEXT NAV ── */

.page-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 0;
  border-top: 1px solid var(--line);
  margin-top: 48px;
}
.page-nav a {
  font-family: ui-monospace, Menlo, 'Cascadia Code', monospace;
  font-size: 12px;
  color: var(--accent);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 5px;
}
.page-nav a:hover { text-decoration: underline; }
.page-nav .spacer { flex: 1; }

/* ── COMING SOON ── */

.coming-soon-wrap {
  text-align: center;
  padding: 60px 28px;
  max-width: 500px;
  margin: 0 auto;
}
.coming-soon-wrap .icon { font-size: 2.5rem; margin-bottom: 16px; }

/* ── DIAGNOSTIC GRID ── */

.diag-grid {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0;
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin: 12px 0;
}
.diag-row { display: contents; }
.diag-row > * {
  padding: 9px 14px;
  border-bottom: 1px solid var(--line);
  font-size: .9rem;
  line-height: 1.45;
}
.diag-row:last-child > * { border-bottom: none; }
.diag-num {
  font-family: ui-monospace, Menlo, 'Cascadia Code', monospace;
  font-size: 11px;
  color: var(--ink-soft);
  background: var(--paper-2);
  border-right: 1px solid var(--line);
  white-space: nowrap;
}
.diag-score {
  font-family: ui-monospace, Menlo, 'Cascadia Code', monospace;
  font-size: 11px;
  color: var(--info);
  white-space: nowrap;
  border-left: 1px solid var(--line);
  background: var(--paper-2);
}

/* ── GLOSSARY LINKS ── */

.glossary-link {
  color: inherit;
  text-decoration: none;
  border-bottom: 1px dotted var(--accent);
  transition: background .12s, border-color .12s;
  border-radius: 2px;
}
.glossary-link:hover {
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  border-bottom-style: solid;
}

/* ── RESPONSIVE ── */

@media (max-width: 600px) {
  h1 { font-size: 1.9rem; }
  .wrap { padding: 28px 16px 60px; }
  .site-nav { padding: 0 12px; gap: 6px; }
  .week { grid-template-columns: 1fr; gap: 4px; }
  .week-num { padding-top: 0; }
  .sessions-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
  .agenda-row { grid-template-columns: 70px 1fr; }
}
```

- [ ] **Step 2: Verify no leftover old-palette hex codes remain**

Run: `grep -in "f4efe4\|ece4d4\|2a251f\|5b5348\|d9cdb6\|b5502f\|4f6b53\|3a5a78" "assets/style.css"`
Expected: no output (empty match — all old hex values replaced)

- [ ] **Step 3: Commit**

```bash
git add "assets/style.css"
git commit -m "feat: apply Lumina design system tokens and components to shared stylesheet"
```

---

### Task 2: Update fonts and nav-logo markup on the 12 shared-CSS pages

**Files:**
- Modify: `index.html`, `s0.html`, `s1.html`, `s2.html`, `s3.html`, `s4.html`, `s5.html`, `s6.html`, `s7.html`, `s8.html`, `s9.html`, `s10.html` (all 12 currently have the identical `<link href="https://fonts.googleapis.com/css2?family=Fraunces...">` line and the identical `<a href="index.html" class="nav-logo">AI Fluency</a>` line)

**Interfaces:**
- Consumes: `.nav-logo-mark` / `.nav-logo-ring` classes produced in Task 1
- Produces: nothing consumed by later tasks (dictionar.html in Task 3 is a fully separate file)

- [ ] **Step 1: Replace the Google Fonts `<link>` on all 12 pages in one pass**

Run:
```bash
cd "C:/SSP Projects/AI Fluency"
for f in index.html s0.html s1.html s2.html s3.html s4.html s5.html s6.html s7.html s8.html s9.html s10.html; do
  python3 -c "
import sys
path = sys.argv[1]
content = open(path, encoding='utf-8').read()
old = '<link href=\"https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=DM+Mono:wght@400;500&display=swap\" rel=\"stylesheet\">'
new = '<link href=\"https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Hanken+Grotesk:wght@400;500;600;700;800&display=swap\" rel=\"stylesheet\">'
assert old in content, f'old font link not found in {path}'
content = content.replace(old, new)
open(path, 'w', encoding='utf-8').write(content)
print('OK:', path)
" "$f"
done
```
Expected: `OK: <filename>` printed 12 times, no `AssertionError`

- [ ] **Step 2: Replace the nav-logo markup on all 12 pages in one pass**

Run:
```bash
cd "C:/SSP Projects/AI Fluency"
for f in index.html s0.html s1.html s2.html s3.html s4.html s5.html s6.html s7.html s8.html s9.html s10.html; do
  python3 -c "
import sys
path = sys.argv[1]
content = open(path, encoding='utf-8').read()
old = '<a href=\"index.html\" class=\"nav-logo\">AI Fluency</a>'
new = '<a href=\"index.html\" class=\"nav-logo\"><span class=\"nav-logo-mark\"><span class=\"nav-logo-ring\"></span></span>AI Fluency</a>'
assert old in content, f'old nav-logo markup not found in {path}'
content = content.replace(old, new)
open(path, 'w', encoding='utf-8').write(content)
print('OK:', path)
" "$f"
done
```
Expected: `OK: <filename>` printed 12 times, no `AssertionError`

- [ ] **Step 3: Visual check on index.html**

Start the dev server (`preview_start` on a static file server, or open `index.html` directly if the existing `.claude/launch.json` config already serves this project — reuse whatever config is already configured). Then:
- `preview_screenshot` on `index.html`: confirm the nav shows a small rounded evergreen square with a white ring icon before "AI Fluency", the wordmark renders in a serif font (Spectral), and the "Cum funcționează" tab row shows a pill-track with the active tab on a white background.
- `preview_resize` with `colorScheme: "dark"`: confirm nav background switches to the dark surface color and text stays legible.

- [ ] **Step 4: Visual check on a session page (s0.html)**

`preview_screenshot` on `s0.html`: confirm the "Ghid facilitare / Exerciții echipă" role-switch renders identically to the overview tabs on index.html (same pill-track pattern), the callout boxes have a full soft-colored background (not just a left border), and the diagnostic grid / agenda / exercise cards use the new evergreen + warm-stone palette.

- [ ] **Step 5: Commit**

```bash
git add index.html s0.html s1.html s2.html s3.html s4.html s5.html s6.html s7.html s8.html s9.html s10.html
git commit -m "feat: swap fonts to Spectral/Hanken Grotesk and add Lumina logo mark to nav"
```

---

### Task 3: Rebuild `dictionar.html`'s inline styles with Lumina tokens

**Files:**
- Modify: `dictionar.html` (lines 8–131 — the Google Fonts `<link>` and the entire inline `<style>` block; nav markup at lines 135–155 gets the same logo-mark treatment as Task 2)

**Interfaces:**
- Consumes: nothing (fully self-contained page, does not load `assets/style.css`)
- Produces: nothing (leaf page)

- [ ] **Step 1: Replace the Google Fonts `<link>` (same swap as Task 2)**

In `dictionar.html`, replace:
```html
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
```
with:
```html
<link href="https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Hanken+Grotesk:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

- [ ] **Step 2: Replace the `:root` and `[data-theme="dark"]` token blocks**

Replace the existing `:root{...}` block (current lines 12–22) with:
```css
:root{
  --bg:#F7F5F0; --surface:#FFFFFF; --surface-2:#F1EEE7;
  --ink:#1A211E; --ink-soft:#6B746E; --ink-faint:#A3A79E;
  --line:#E5E1D8; --line-soft:#EEEBE3;
  --accent:#1F5C4B; --warm:#1F5C4B;
  --cat-fundamente:#3A6EA5; --cat-prompting:#5A3E8C; --cat-rag:#1F5C4B;
  --cat-agenti:#C67B2E; --cat-harness:#9A7420; --cat-guardrails:#C24B3F;
  --cat-evaluare:#3A6EA5; --cat-productie:#2E7D5B; --cat-deployment:#4A63B0;
  --cat-multimodal:#7A3B6B; --cat-training:#3A6B8A; --cat-ecosistem:#6B746E;
  --shadow:0 1px 2px rgba(26,33,30,.05), 0 8px 24px -12px rgba(26,33,30,.14);
}
```

Replace the existing `[data-theme="dark"]{...}` block (current lines 23–33) with:
```css
[data-theme="dark"]{
  --bg:#171D1A; --surface:#212925; --surface-2:#1E2521;
  --ink:#EDEAE2; --ink-soft:#A9B0AA; --ink-faint:#7C857F;
  --line:#333B36; --line-soft:#2A302B;
  --accent:#4FA98A; --warm:#4FA98A;
  --cat-fundamente:#6FA0D6; --cat-prompting:#B39BEF; --cat-rag:#4FA98A;
  --cat-agenti:#E0A059; --cat-harness:#D9AB5F; --cat-guardrails:#E07A6E;
  --cat-evaluare:#6FA0D6; --cat-productie:#8FCBA8; --cat-deployment:#8BA0E0;
  --cat-multimodal:#D68FC0; --cat-training:#79AACB; --cat-ecosistem:#A9B0AA;
  --shadow:0 1px 2px rgba(0,0,0,.25), 0 10px 28px -14px rgba(0,0,0,.5);
}
```

- [ ] **Step 3: Update font-family references in the same `<style>` block**

- Replace `font-family:system-ui,sans-serif;` on `body` (current line 38) with `font-family:'Hanken Grotesk',system-ui,sans-serif;`
- Replace every `font-family:'DM Mono',monospace;` occurrence in the file (`.nav-logo`, `.nav-pill`, `.eyebrow`, `.count`, `button.toggle,.nav-toggle`, `.chips .chip`, `.term`, `.tag`, `.empty`, `footer code`) with `font-family:ui-monospace,Menlo,'Cascadia Code',monospace;`
- Replace every `font-family:'Fraunces',serif;` occurrence (`h1`, `.group-head h2`) with `font-family:'Spectral',Georgia,serif;`

- [ ] **Step 4: Update the nav-logo markup (same pattern as Task 2)**

Replace:
```html
<a href="index.html" class="nav-logo">AI Fluency</a>
```
with:
```html
<a href="index.html" class="nav-logo"><span class="nav-logo-mark"><span class="nav-logo-ring"></span></span>AI Fluency</a>
```

Add the matching CSS to the same `<style>` block (next to the existing `.nav-logo{...}` rule):
```css
.nav-logo{display:flex;align-items:center;gap:9px;font-family:'Spectral',Georgia,serif;font-size:15px;font-weight:700;color:var(--ink);text-decoration:none;letter-spacing:-.01em;white-space:nowrap;margin-right:4px;}
.nav-logo-mark{width:26px;height:26px;border-radius:7px;background:var(--accent);display:flex;align-items:center;justify-content:center;flex:none;}
.nav-logo-ring{width:11px;height:11px;border:2px solid #fff;border-radius:50%;border-right-color:transparent;}
```
(This replaces the old `.nav-logo{font-family:'DM Mono',monospace; font-size:13px; font-weight:500; ...}` rule at current lines 51–55 entirely — don't leave both.)

- [ ] **Step 5: Update radius values for cards/inputs to match Lumina (`--radius-lg` equivalent)**

`dictionar.html` doesn't define a `--radius` token; its component radii are hardcoded (`border-radius:12px` on `#q`, `20px` on pills/chips). Leave the hardcoded pixel values as-is — they already fall inside Lumina's radius scale (12px ≈ `--radius-lg`, 20px = pill). No change needed here; this step is a no-op confirmation, not a code change.

- [ ] **Step 6: Verify no leftover old-palette hex codes remain**

Run: `grep -in "f4efe4\|ece4d4\|2a251f\|5b5348\|9e9285\|d9cdb6\|e8dece\|b5502f" "dictionar.html"`
Expected: no output

- [ ] **Step 7: Visual check**

`preview_screenshot` on `dictionar.html` in both light and dark mode: confirm nav matches the other 12 pages exactly (same logo mark, same fonts), the search box and category chips use the new palette, and category-colored term tags (`--cat-*`) are still visually distinct from each other.

- [ ] **Step 8: Commit**

```bash
git add dictionar.html
git commit -m "feat: apply Lumina design system to dictionar.html inline styles"
```

---

### Task 4: Final cross-page visual QA

**Files:** none modified — verification only. If this task finds a defect, fix it in the relevant file from Task 1–3 and re-run this task's checks.

**Interfaces:**
- Consumes: the completed state of Tasks 1–3
- Produces: nothing (terminal task)

- [ ] **Step 1: Light-mode sweep**

`preview_screenshot` on `index.html`, `s0.html`, and `dictionar.html`. Confirm: consistent nav across all three, no leftover Fraunces/DM Mono rendering (headings should look like a serif with more contrast/less quirky than Fraunces — Spectral), pill tabs render identically on `index.html` and `s0.html`.

- [ ] **Step 2: Dark-mode sweep**

`preview_resize` with `colorScheme: "dark"` (or trigger `toggleTheme()` via `preview_eval`) on the same three pages. Confirm: no unreadable text (check `--ink` vs `--surface`/`--paper` contrast), callout/alert boxes remain legible, category tag colors in `dictionar.html` remain distinguishable from each other on the dark background.

- [ ] **Step 3: Interaction check**

On `s0.html`: `preview_click` the "Exerciții echipă" role-switch button, confirm the panel swaps and the active pill visually matches the active tab style on `index.html`. On `index.html`: `preview_click` through the 4 overview tabs, confirm each panel swaps correctly.

- [ ] **Step 4: Responsive check**

`preview_resize` to `mobile` (375×812) on `index.html` and `s0.html`. Confirm the nav pills row scrolls horizontally without layout breakage and cards/grids stack to single column per the existing `@media (max-width: 600px)` rules (unchanged from Task 1).

- [ ] **Step 5: No commit needed for this task** — it's verification-only. If any check in Steps 1–4 fails, fix the specific file and commit the fix with a message like `fix: correct <specific issue> from Lumina reskin QA`.

---

## Self-Review Notes

- **Spec coverage:** Task 1 covers tokens/typography/nav/components/tab-unification (spec sections 1–4 for the shared stylesheet). Task 2 covers font `<link>` + logo markup for the 12 shared pages (spec section "shell/navigare"). Task 3 covers `dictionar.html`'s separate stylesheet (spec's scope-correction addendum). Task 4 covers the spec's "Testare/verificare" section. `01-program-10-saptamani.html` is explicitly excluded per the user's decision, matching the spec's scope-correction addendum.
- **No placeholders:** every step has literal code/commands, no "add appropriate styling" language.
- **Type/name consistency:** `.nav-logo-mark`/`.nav-logo-ring` are defined identically in Task 1 (CSS) and consumed identically in Task 2/3 (HTML markup) — same class names, same structure (`span.nav-logo-mark > span.nav-logo-ring`).
