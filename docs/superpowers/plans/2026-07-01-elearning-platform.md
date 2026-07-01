# Platformă e-learning AI Fluency — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** O platformă statică de e-learning (vitrină de conținut) pentru cursul intern AI Fluency: un index cu 4 sesiuni + pagina completă a Sesiunii 1, reutilizând limbajul vizual din `ai-fluency-trainer-kit.html`.

**Architecture:** Site static multi-pagină, fără build, fără server, fără dependențe externe noi (doar Google Fonts, ca în sursă). CSS + tema light/dark extrase într-un `assets/styles.css` + `assets/theme.js` comune, incluse de fiecare pagină. O pagină per sesiune; index-ul le leagă.

**Tech Stack:** HTML5 static, CSS3 (custom properties pentru teme), un fișier JS mic pentru toggle temă și smooth-scroll. Zero framework, zero bundler.

## Global Constraints

- Limba conținutului: **română**. Se păstrează terminologia existentă (Delegare/Descriere/Discernământ/Diligență, `sql-enterprise`, `SMT-FAT-SQLB01`, `BufferSap`).
- **Fără dependențe externe noi** în afară de Google Fonts (Fraunces, Hanken Grotesk, DM Mono) — deja folosite în `ai-fluency-trainer-kit.html`. Fără CDN JS, fără framework, fără build step.
- Se reutilizează design tokens și componentele din `ai-fluency-trainer-kit.html`: variabilele CSS (`--paper`, `--paper-2`, `--paper-3`, `--ink`, `--ink-soft`, `--ink-faint`, `--line`, `--line-soft`, `--rust`, `--rust-soft`, `--teal`, `--teal-soft`, `--gold`, `--shadow`, `--radius`), plus clasele `.topbar`, `.card`, `.note`, `.warn`, `.check`, `.pill`, `.grid-2`, `.grid-3`, `table`, `code`, `button.toggle`.
- **Exclus din paginile publice:** secțiunea „Note de facilitare — doar pentru Ionut" din `suport-curs-sesiunea-1.md`. Rămâne doar în `.md`, nu ajunge în niciun `.html`.
- **Fără git:** acest folder NU e repo git (`git` indisponibil aici). Pașii de „Commit" din template se ÎNLOCUIESC cu verificare în browser. Nu rula comenzi git.
- Fișiere scrise cu encoding UTF-8 (diacritice românești corecte).

## File Structure

```
index.html              # landing: hero + card per sesiune (titlu, temă 4D, status, link)
sesiune-1.html          # conținut complet participant-facing (din suport-curs-sesiunea-1.md)
sesiune-2.html          # placeholder "În curând" — Agenți & subagenți
sesiune-3.html          # placeholder "În curând" — Evaluare, cost/latență
sesiune-4.html          # placeholder "În curând" — Securitate/GDPR + Playbook
assets/styles.css       # tokens + componente comune (extrase din ai-fluency-trainer-kit.html)
assets/theme.js         # toggle light/dark + respectă prefers-color-scheme + smooth-scroll ancore
```

Nemodificate: `ai-fluency-trainer-kit.html`, `suport-curs-sesiunea-1.md`, `CLAUDE.md`.

---

### Task 1: Fundația comună — `assets/styles.css` + `assets/theme.js`

**Files:**
- Create: `assets/styles.css`
- Create: `assets/theme.js`

**Interfaces:**
- Produces: un stylesheet cu toate variabilele de temă și componentele (`.topbar`, `.brand`, `.loop-mark`, `.navlinks`, `button.toggle`, `.wrap`, `.col`, `header.hero`, `.eyebrow`, `.pill`, `section`, `.sec-head`, `.sec-num`, `.card`, `.card.flat`, `.grid-2`, `.grid-3`, `.check`, `.note`, `.warn`, `.label`, `table`, `code`) — consumate de toate paginile prin `<link rel="stylesheet" href="assets/styles.css">`.
- Produces: `theme.js` expune `toggleTheme()` global (apelat de `button.toggle` prin `onclick`), aplică `prefers-color-scheme` la load, și atașează smooth-scroll pe `a[href^="#"]`. Inclus prin `<script src="assets/theme.js"></script>` înainte de `</body>`.

- [ ] **Step 1: Creează `assets/styles.css`**

Copiază verbatim TOT conținutul dintre `<style>` și `</style>` din `ai-fluency-trainer-kit.html` (liniile 10–185 — de la blocul `:root{...}` până la finalul regulilor `.kolb`). Nu modifica valorile. Acesta devine stylesheet-ul partajat. (Regulile `.loop-wrap`, `.comp`, `.mode`, `.phase`, `.kolb`, `.res` pot rămâne — sunt inofensive dacă nu sunt folosite și utile dacă vor fi refolosite ulterior.)

- [ ] **Step 2: Creează `assets/theme.js`**

Copiază verbatim conținutul dintre `<script>` și `</script>` din `ai-fluency-trainer-kit.html` (liniile 728–748):

```javascript
function toggleTheme(){
  const h=document.documentElement;
  h.dataset.theme = h.dataset.theme==='dark' ? 'light' : 'dark';
}
// respect system preference on first load
if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches){
  document.documentElement.dataset.theme='dark';
}
// robust in-page navigation (works inside embedded/preview iframes too)
document.querySelectorAll('a[href^="#"]').forEach(function(a){
  a.addEventListener('click', function(e){
    var href = this.getAttribute('href');
    if(href === '#') return;
    var target = (href === '#top') ? document.getElementById('top') : document.querySelector(href);
    if(target){
      e.preventDefault();
      var y = target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    }
  });
});
```

- [ ] **Step 3: Verificare (browser)**

Nu se poate testa izolat (nu există încă o pagină). Verificare amânată la Task 2. Confirmă doar că ambele fișiere există și `styles.css` conține blocul `:root{ --paper:#f3ede1; ...}` și `[data-theme="dark"]{...}`.

---

### Task 2: `index.html` — landing cu carduri de sesiune

**Files:**
- Create: `index.html`

**Interfaces:**
- Consumes: `assets/styles.css`, `assets/theme.js` (Task 1).
- Produces: pagina de intrare cu 4 carduri; cardul S1 linkează la `sesiune-1.html`, cardurile S2–S4 sunt marcate „În curând" (fără link activ). Definește pattern-ul de `<head>` + `<nav class="topbar">` reutilizat de paginile de sesiune.

- [ ] **Step 1: Scrie `index.html`**

Structură completă (schelet + conținut). `<head>` identic ca sursă (fonturi Google + link către `assets/styles.css`). Nav sticky cu brand + toggle. Hero. Grid de 4 carduri.

```html
<!DOCTYPE html>
<html lang="ro">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AI Fluency — Platforma de curs</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Hanken+Grotesk:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/styles.css">
</head>
<body>

<nav class="topbar">
  <div class="topbar-inner">
    <a class="brand" href="index.html">
      <svg class="loop-mark" viewBox="0 0 24 24"><circle cx="12" cy="4" r="3"/><circle cx="20" cy="12" r="3"/><circle cx="12" cy="20" r="3"/><circle cx="4" cy="12" r="3"/></svg>
      AI FLUENCY · CURS
    </a>
    <button class="toggle" onclick="toggleTheme()">☾ / ☀</button>
  </div>
</nav>

<div class="wrap" id="top">
  <header class="hero">
    <div class="col">
      <div class="eyebrow">Program intern · echipa Dev SQL</div>
      <h1>De la SQL developer la <em>AI-assisted developer</em>.</h1>
      <p class="lede">Patru sesiuni aplicate cu Claude, pe munca ta reală. Înveți un mod de a lucra cu AI care rămâne valabil indiferent ce model sau buton se schimbă — bucla celor 4D: delegare, descriere, discernământ, diligență.</p>
      <div class="hero-meta">
        <span class="pill">4 sesiuni</span>
        <span class="pill">framework 4D</span>
        <span class="pill">correctness &gt; performance &gt; cleverness</span>
      </div>
    </div>
  </header>

  <section>
    <div class="col">
      <div class="sec-head"><span class="sec-num">01</span><h2>Sesiunile cursului</h2></div>
      <p class="sec-intro">Parcurgem sesiunile în ordine. Fiecare produce un artefact real din munca ta. Prima e disponibilă; restul vin pe rând.</p>
    </div>
    <div class="col">
      <div class="grid-2">

        <a class="card" href="sesiune-1.html" style="text-decoration:none;color:inherit;display:block;">
          <span class="label" style="color:var(--rust)">Sesiunea 1 · Disponibilă</span>
          <h3 style="margin-top:6px">Prima zi cu Claude: Skills, MCP &amp; Plugins</h3>
          <p style="font-size:.95rem;color:var(--ink-soft);margin:8px 0 0">Bucla 4D pe un exemplu SQL, comenzile de bază, și cum Claude cunoaște standardele echipei. Exerciții aplicate pe procedura ta reală.</p>
          <p style="font-family:'DM Mono',monospace;font-size:11px;color:var(--teal);margin:12px 0 0">Description + Delegation (platform)</p>
        </a>

        <div class="card" style="opacity:.62">
          <span class="label" style="color:var(--ink-faint)">Sesiunea 2 · În curând</span>
          <h3 style="margin-top:6px">Agenți &amp; subagenți</h3>
          <p style="font-size:.95rem;color:var(--ink-soft);margin:8px 0 0">Deleghezi fluxuri, nu doar întrebări: un agent de code-review pe standardele echipei, un subagent de documentare.</p>
          <p style="font-family:'DM Mono',monospace;font-size:11px;color:var(--teal);margin:12px 0 0">Delegation (task) + Discernment</p>
        </div>

        <div class="card" style="opacity:.62">
          <span class="label" style="color:var(--ink-faint)">Sesiunea 3 · În curând</span>
          <h3 style="margin-top:6px">Evaluare output, cost &amp; când NU folosești AI</h3>
          <p style="font-size:.95rem;color:var(--ink-soft);margin:8px 0 0">Seturi de teste pe output propriu, vânătoarea de halucinații, alegerea modelului potrivit sarcinii.</p>
          <p style="font-family:'DM Mono',monospace;font-size:11px;color:var(--teal);margin:12px 0 0">Discernment (product) + Delegation</p>
        </div>

        <div class="card" style="opacity:.62">
          <span class="label" style="color:var(--ink-faint)">Sesiunea 4 · În curând</span>
          <h3 style="margin-top:6px">Securitate, GDPR &amp; playbook-ul de echipă</h3>
          <p style="font-size:.95rem;color:var(--ink-soft);margin:8px 0 0">Threat-model pe fluxuri cu date sensibile, consolidare, și playbook-ul propriu al echipei.</p>
          <p style="font-family:'DM Mono',monospace;font-size:11px;color:var(--teal);margin:12px 0 0">Diligence (creation + deployment)</p>
        </div>

      </div>
    </div>
  </section>
</div>

<script src="assets/theme.js"></script>
</body>
</html>
```

- [ ] **Step 2: Verificare în browser**

Deschide `index.html` (Preview tool sau `file://`). Confirmă:
- Se încarcă fonturile și stilurile (hero cu titlu serif Fraunces, fundal `--paper`).
- 4 carduri; primul (S1) e clar activ, celelalte 3 estompate (opacity .62) cu „În curând".
- Toggle `☾ / ☀` schimbă tema light↔dark; culorile se inversează corect.
- Cardul S1 e clickabil (cursor + href către `sesiune-1.html`).

Expected: layout curat, 2 coloane pe desktop, 1 coloană sub 760px.

---

### Task 3: `sesiune-1.html` — conținutul complet al Sesiunii 1

**Files:**
- Create: `sesiune-1.html`
- Reference (citește, NU modifica): `suport-curs-sesiunea-1.md`

**Interfaces:**
- Consumes: `assets/styles.css`, `assets/theme.js` (Task 1); pattern-ul de `<head>`/`<nav>` din Task 2, cu diferența că nav-ul include un link „← Toate sesiunile" către `index.html`.
- Produces: pagina de sesiune participant-facing. Nu produce interfețe pentru alte task-uri.

- [ ] **Step 1: Scrie scheletul + nav-ul cu retur la index**

Head identic ca `index.html` (titlu: `Sesiunea 1 — Prima zi cu Claude · AI Fluency`). Nav-ul adaugă un link de retur:

```html
<nav class="topbar">
  <div class="topbar-inner">
    <a class="brand" href="index.html">
      <svg class="loop-mark" viewBox="0 0 24 24"><circle cx="12" cy="4" r="3"/><circle cx="20" cy="12" r="3"/><circle cx="12" cy="20" r="3"/><circle cx="4" cy="12" r="3"/></svg>
      AI FLUENCY · CURS
    </a>
    <div class="navlinks">
      <a href="index.html">← Toate sesiunile</a>
      <a href="#tutorial">Tutorial</a>
      <a href="#aplicat">Lucru aplicat</a>
      <a href="#anexe">Anexe</a>
    </div>
    <button class="toggle" onclick="toggleTheme()">☾ / ☀</button>
  </div>
</nav>
```

- [ ] **Step 2: Hero-ul sesiunii**

```html
<div class="wrap" id="top">
  <header class="hero">
    <div class="col">
      <div class="eyebrow">Sesiunea 1 · Echipa Dev SQL</div>
      <h1>Prima zi cu <em>Claude</em>.</h1>
      <p class="lede">De la SQL developer la AI-assisted developer. La final ai făcut 3 lucruri reale pe propria muncă SQL, cunoști comenzile de bază, și înțelegi cum folosim Claude ca să respecte standardele echipei — cod ca al nostru, nu exemple de jucărie.</p>
      <div class="hero-meta">
        <span class="pill">~2,5–3 h</span>
        <span class="pill">bucla 4D</span>
        <span class="pill">Skills · MCP · Plugins</span>
      </div>
    </div>
  </header>
```

- [ ] **Step 3: Secțiunea Tutorial (`#tutorial`)**

Convertește în HTML secțiunea „PARTEA 1 — Tutorial" din `suport-curs-sesiunea-1.md` (subsecțiunile 1.1–1.4). Mapare Markdown→componente:
- Titlurile `##`/`###` → `<h2>`/`<h3>` în interiorul unui `<section id="tutorial">` cu `.sec-head` + `.sec-num` „02".
- Tabelul buclei 4D (1.1) și tabelul comenzilor (1.3) → `<table>` (stilul e deja în `styles.css`).
- Tabelul „claude.ai vs Claude Code" (1.2) → `<table>`.
- Blocul cu `> **De știut, onest:**` și `> **Cum se numește, de fapt:**` → `.note`.
- `` `cod inline` `` → `<code>`. Blocurile ```` ```bash ```` cu instalarea → `<pre><code>...</code></pre>` (adaugă în `styles.css` o regulă minimală `pre{overflow-x:auto;background:var(--paper-2);border:1px solid var(--line-soft);border-radius:8px;padding:14px 16px;margin:14px 0;} pre code{background:none;border:none;padding:0;}` — vezi Step 7).
- Păstrează diacriticele și textul românesc exact.

- [ ] **Step 4: Secțiunea Lucru aplicat (`#aplicat`)**

Convertește „PARTEA 2 — Lucru aplicat" (Exercițiile A, B, C) într-un `<section id="aplicat">`. Fiecare exercițiu → un bloc cu `<h3>` + descriere. Prompturile (blocurile de cod) → `<pre><code>`. Blocul „De verificat (discernământ)" → `.note`. Momentul-cheie („sugestiile de index sunt puncte de plecare") → `.warn`.

Extindere conform spec (S1 acoperă și MCP și Plugins la nivel aplicat, nu doar hartă): după Exercițiul C, adaugă două exerciții noi, în același stil de card/prompt, folosind materialul din secțiunea „Harta ecosistemului" a `.md`-ului:

```html
<h3>Exercițiul D — Conectează Claude la o sursă read-only (MCP)</h3>
<p>MCP e „portul USB-C" prin care Claude vorbește cu unelte externe fără copy-paste. Îl gestionezi cu <code>/mcp</code>. Azi îl pornim pe DEV / read-only.</p>
<div class="warn">
  <span class="label">Regula de aur MCP</span>
  Un MCP acționează cu permisiunile tale. Pornește-l pe DEV / read-only, cu un user cu drepturi minime. Nu conecta nimic care poate modifica date direct pe BufferSap PROD fără discuție în echipă.
</div>
<!-- pas cu pas: /mcp, alege SQL MCP Server (Microsoft, pe Data API builder), interoghează o procedură expusă ca unealtă -->
```

```html
<h3>Exercițiul E — Ce e, de fapt, un plugin</h3>
<p>Un plugin împachetează skill-uri + comenzi + agenți + configurări MCP într-un pachet instalabil cu o comandă (<code>/plugin</code>) — „standardul echipei, la cheie". Deschide plugin-ul intern al echipei și identifică ce skill-uri și comenzi aduce.</p>
```

Conținutul detaliat al pașilor pentru D și E se scrie în proză românească pe baza secțiunilor „2. MCP" și „4. Plugins" din `.md`. (Agents rămâne DOAR menționat — un `.note` scurt care spune că e tema Sesiunii 2, fără exercițiu.)

- [ ] **Step 5: Secțiunea Anexe (`#anexe`)**

Convertește „Anexa 1 — Cheat card" și „Anexa 2 — Ce NU trimiți niciodată" într-un `<section id="anexe">`:
- Cheat card-ul de comenzi → `<pre><code>` sau un `<table>`.
- Prompturile reutilizabile → listă `.check`.
- „Regula de aur" → `.note`.
- Anexa 2 (date safety) → un `.warn` proeminent, cu lista „NU trimiți niciodată" și „Ce faci în schimb".

- [ ] **Step 6: NU include notele de facilitare**

Verifică explicit: secțiunea „# Note de facilitare (doar pentru Ionut)" din `.md` (și subsecțiunile Timp/Pacing/Capcane/Setup/După) NU se convertește. La fel, „# Sesiunile următoare" e opțional — poate deveni un `.note` de „ce urmează" la finalul paginii, dar FĂRĂ conținutul de facilitare. Include footer-ul cu link înapoi la index.

```html
<footer class="col">
  <p><a href="index.html" style="color:var(--rust)">← Înapoi la toate sesiunile</a></p>
</footer>
</div>
<script src="assets/theme.js"></script>
</body>
</html>
```

- [ ] **Step 7: Adaugă regula `pre` în `assets/styles.css`**

Dacă nu există deja, adaugă la finalul `assets/styles.css`:

```css
pre{overflow-x:auto; background:var(--paper-2); border:1px solid var(--line-soft); border-radius:8px; padding:14px 16px; margin:14px 0; font-family:'DM Mono',monospace; font-size:.82rem; line-height:1.5;}
pre code{background:none; border:none; padding:0; font-size:inherit;}
```

- [ ] **Step 8: Verificare în browser**

Deschide `sesiune-1.html`. Confirmă:
- Nav-ul are „← Toate sesiunile" care duce la `index.html`.
- Ancorele Tutorial/Lucru aplicat/Anexe fac smooth-scroll la secțiuni.
- Tabelele (bucla 4D, comenzi) se afișează stilizat.
- Blocurile de prompt (`<pre>`) au scroll orizontal pe mobil, nu rup layout-ul.
- `.note` (teal) și `.warn` (gold) apar corect, inclusiv Anexa 2.
- Toggle temă funcționează.
- **Ctrl+F pe pagină pentru „facilitare", „Ionut", „pairing", „Jan → Adriana"** — zero rezultate (notele private nu au ajuns în HTML).

Expected: pagină lungă, lizibilă, fără conținut de trainer privat.

---

### Task 4: Paginile placeholder `sesiune-2/3/4.html`

**Files:**
- Create: `sesiune-2.html`
- Create: `sesiune-3.html`
- Create: `sesiune-4.html`

**Interfaces:**
- Consumes: `assets/styles.css`, `assets/theme.js`; pattern nav cu retur la index (Task 3).
- Produces: 3 pagini „În curând" coerente vizual, ca link-urile din index să nu ducă la 404 dacă cineva le accesează direct.

- [ ] **Step 1: Scrie `sesiune-2.html`**

Schelet identic (head + nav cu „← Toate sesiunile" + toggle). Conținut: hero cu tema sesiunii + un `.note` „În curând".

```html
<!DOCTYPE html>
<html lang="ro">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Sesiunea 2 — Agenți &amp; subagenți · AI Fluency</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Hanken+Grotesk:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/styles.css">
</head>
<body>
<nav class="topbar">
  <div class="topbar-inner">
    <a class="brand" href="index.html">
      <svg class="loop-mark" viewBox="0 0 24 24"><circle cx="12" cy="4" r="3"/><circle cx="20" cy="12" r="3"/><circle cx="12" cy="20" r="3"/><circle cx="4" cy="12" r="3"/></svg>
      AI FLUENCY · CURS
    </a>
    <div class="navlinks"><a href="index.html">← Toate sesiunile</a></div>
    <button class="toggle" onclick="toggleTheme()">☾ / ☀</button>
  </div>
</nav>
<div class="wrap" id="top">
  <header class="hero">
    <div class="col">
      <div class="eyebrow">Sesiunea 2</div>
      <h1>Agenți &amp; <em>subagenți</em>.</h1>
      <p class="lede">Deleghezi fluxuri pe mai mulți pași, nu doar întrebări: un agent de code-review pe standardele echipei, un subagent de documentare. E fix bucla 4D — delegare + verificare.</p>
    </div>
  </header>
  <section>
    <div class="col">
      <div class="note">
        <span class="label">În curând</span>
        Conținutul acestei sesiuni e în pregătire. Termină întâi Sesiunea 1.
      </div>
      <p style="margin-top:20px"><a href="index.html" style="color:var(--rust)">← Înapoi la toate sesiunile</a></p>
    </div>
  </section>
</div>
<script src="assets/theme.js"></script>
</body>
</html>
```

- [ ] **Step 2: Scrie `sesiune-3.html`**

Identic cu Step 1, schimbând doar: `<title>Sesiunea 3 — Evaluare, cost &amp; latență · AI Fluency</title>`, eyebrow „Sesiunea 3", `<h1>Evaluare output, cost &amp; <em>latență</em>.</h1>`, lede: „Seturi de teste pe output propriu, vânătoarea de halucinații, și decizia strategică: când NU folosești AI. Discernământ + delegare la nivel de scop."

- [ ] **Step 3: Scrie `sesiune-4.html`**

Identic, schimbând: `<title>Sesiunea 4 — Securitate, GDPR &amp; playbook · AI Fluency</title>`, eyebrow „Sesiunea 4", `<h1>Securitate, GDPR &amp; <em>playbook-ul de echipă</em>.</h1>`, lede: „Threat-model pe fluxuri reale cu date sensibile, consolidarea a tot ce am învățat, și scrierea playbook-ului propriu al echipei. Diligența, dusă până la capăt."

- [ ] **Step 4: Verificare în browser**

Deschide fiecare din `index.html` prin nu se aplică — accesează cele 3 pagini direct și confirmă:
- Fiecare are hero-ul corect + `.note` „În curând".
- „← Toate sesiunile" (nav și footer) duce la `index.html`.
- Toggle temă funcționează pe toate.

---

### Task 5: Verificare integrată & CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

**Interfaces:**
- Consumes: toate paginile din Task 1–4.
- Produces: documentație actualizată pentru instanțe viitoare de Claude.

- [ ] **Step 1: Verificare flux complet în browser**

Din `index.html`:
- Click pe cardul S1 → ajunge la `sesiune-1.html`. „← Toate sesiunile" → înapoi la index.
- Cardurile S2–S4 din index nu sunt clickabile (sunt `<div>`, nu `<a>`) — confirmă că nu au cursor de link. (Paginile placeholder există totuși dacă sunt accesate direct.)
- Toggle temă: setează dark pe o pagină, navighează la alta — nota: tema NU persistă între pagini (nu e cerută persistență în spec); fiecare pagină respectă `prefers-color-scheme` la load. Confirmă că e comportament acceptabil.
- Resize la <760px: grid-ul de carduri devine 1 coloană; nav-ul nu se rupe.

- [ ] **Step 2: Actualizează `CLAUDE.md`**

Adaugă o secțiune despre platforma nouă (structura fișierelor, faptul că e static/no-build, CSS/JS partajate în `assets/`, regula că notele de facilitare NU se pun în HTML public, și că `ai-fluency-trainer-kit.html` rămâne material separat pentru trainer). Nu duplica ce e deja acolo — extinde secțiunea „What this repository is".

- [ ] **Step 3: Verificare finală**

Recitește `CLAUDE.md` și confirmă că descrie corect noua structură. Confirmă că `ai-fluency-trainer-kit.html` și `suport-curs-sesiunea-1.md` sunt neschimbate.

---

## Self-Review

**Spec coverage:**
- Vitrină statică, no-build, no-server → Task 1–4 (HTML+CSS+JS pur). ✓
- 4 sesiuni cu index comun → Task 2 (index) + Task 3/4 (pagini). ✓
- O pagină per sesiune → Task 3, Task 4. ✓
- Reutilizare vizuală din trainer-kit → Task 1 (extragere CSS/JS verbatim). ✓
- HTML direct, fără build → toate task-urile; conversie manuală MD→HTML în Task 3. ✓
- S1 extins cu MCP + Plugins la nivel aplicat, Agents doar menționat → Task 3 Step 4. ✓
- Excluderea notelor de facilitare → Task 3 Step 6 + verificare Ctrl+F Step 8. ✓
- Index cu status Disponibil/În curând → Task 2. ✓
- Testare manuală în browser (navigare, toggle, responsive, verificare note private) → Step-urile de verificare + Task 5. ✓
- Scope exclus (conturi, quiz, build, conținut S2-S4) → respectat; S2-S4 sunt doar placeholder. ✓

**Placeholder scan:** Fără „TBD/TODO" în pași. Conținutul de proză pentru exercițiile D/E și conversia secțiunilor e specificat prin referință exactă la secțiunile din `.md` (sursa e în repo) + componentele de folosit — nu inline 300 de linii de proză, dar fiecare pas spune exact ce secțiune se convertește și în ce componentă. Acceptabil pentru un task de conversie de conținut.

**Type/naming consistency:** Numele de fișiere (`assets/styles.css`, `assets/theme.js`, `index.html`, `sesiune-1..4.html`), funcția `toggleTheme()`, clasele CSS și id-urile de ancoră (`#tutorial`, `#aplicat`, `#anexe`, `#top`) sunt consistente între task-uri. ✓
