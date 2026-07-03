# Aplicarea design system-ului Lumina peste platforma AI Fluency

**Data**: 2026-07-03
**Status**: Aprobat, în implementare

## Context

Platforma AI Fluency e un site static (14 pagini HTML: `index.html`, `s0.html`–`s10.html`, `dictionar.html`, `01-program-10-saptamani.html`) care partajează un singur fișier de stil (`assets/style.css`) și două module JS (`assets/main.js` pentru tab-uri/theme, `assets/glossary.js`). Identitatea vizuală actuală: paletă „warm parchment" (`#f4efe4`) + terra cotta (`#b5502f`), fonturi Fraunces (serif) + DM Mono.

A fost livrat un handoff de design system numit **Lumina** (`Design sistem e-learning-handoff/design-sistem-e-learning/project/Lumina Design System.dc.html`), construit pentru un e-learning generic: paletă evergreen (`#1F5C4B`) + chihlimbar (`#C67B2E`) pe fundal warm stone, tipografie Spectral (titluri) + Hanken Grotesk (UI/body), sistem de spațiere pe grid de 4px/12 coloane, componente (butoane, formulare, badge-uri, progres, carduri, alerte) și două ecrane demo (dashboard student, catalog cursuri).

Cerința: aplicăm limbajul vizual Lumina peste platforma existentă, **păstrând arhitectura de pagini statice** — nu construim un LMS interactiv cu conturi/progres real.

## Decizii confirmate cu utilizatorul

1. **Scop**: rebrand complet + shell tip aplicație (topbar recondiționat vizual ca Lumina), nu doar un swap de tokenuri.
2. **Dark mode**: se păstrează toggle-ul existent; se derivă o variantă întunecată coerentă cu paleta Lumina (Lumina nu definește una nativ).
3. **Gamificare**: NU se preiau elementele de streak/XP/nivele/„Top 5%" din Lumina — site-ul e curriculum intern pentru 5 colegi, fără date reale de progres per utilizator. Se preiau doar limbajul vizual și componentele structurale (carduri, badge-uri, alerte, bare de progres unde au sens static).

## Ce se schimbă

### 1. Tokenuri CSS (`:root` și `[data-theme="dark"]` în `assets/style.css`)

| Token | Light (nou) | Dark (nou, derivat) | Light (vechi) |
|---|---|---|---|
| `--paper` | `#F7F5F0` | `#171D1A` | `#f4efe4` |
| `--paper-2` | `#F1EEE7` | `#1E2521` | `#ece4d4` |
| `--surface` (**nou**) | `#FFFFFF` | `#212925` | — (n-a existat) |
| `--ink` | `#1A211E` | `#EDEAE2` | `#2a251f` |
| `--ink-soft` | `#6B746E` | `#A9B0AA` | `#5b5348` |
| `--ink-mute` (**nou**, text terțiar) | `#A3A79E` | `#7C857F` | — |
| `--line` | `#E5E1D8` | `#333B36` | `#d9cdb6` |
| `--accent` (brand, evergreen) | `#1F5C4B` | `#4FA98A` | `#b5502f` |
| `--accent-dark` | `#163F33` | `#1F5C4B` | — |
| `--accent-soft` | `#E4EFEA` | `rgba(31,92,75,.25)` | — |
| `--gold` (accent secundar) | `#C67B2E` | `#E0A059` | folosit ca `--accent-2`/`--accent-3` fostele |
| `--success` / `--warning` / `--danger` / `--info` | `#2E7D5B` / `#D9A036` / `#C24B3F` / `#3A6EA5` | variante deschise (`#4CAF82`/`#E0B84D`/`#E07A6E`/`#6FA0D6`) | culorile semantice nu existau explicit — erau derivate din `--accent-2`/`--accent-3` |
| `--radius` | `14px` (carduri), `10px` (controale) | idem | `10px` uniform |

Variabilele vechi `--accent-2`, `--accent-3` sunt înlocuite de `--gold` + `--info`/`--success` semantice, cu maparea explicită documentată în cod (comentarii) pentru fiecare loc unde erau folosite (badge-uri de fază, callout-uri, agenda).

### 2. Tipografie

- **Titluri (h1–h4, `.kicker` rămâne mono)**: `'Spectral', Georgia, serif`, greutăți 600/700.
- **UI & body**: `'Hanken Grotesk', system-ui, sans-serif` — înlocuiește Fraunces peste tot în afara titlurilor mari (h1/h2 rămân serif ca în Lumina; h3/h4/body/nav devin sans, exact ca-n Lumina unde H3 e deja sans-bold).
- **Mono (etichete, cod, kicker, badge-uri)**: `ui-monospace, Menlo, 'Cascadia Code', monospace` — se renunță la încărcarea webfont-ului DM Mono (Lumina folosește stack-ul de sistem).
- `<link>`-urile Google Fonts din `<head>`-ul celor 14 pagini se înlocuiesc cu Spectral + Hanken Grotesk.

### 3. Shell / navigare (`.site-nav` și clase asociate)

- Fundal topbar: `--surface` (alb / `#212925` în dark), border-bottom `--line`.
- `.nav-logo`: mic pătrat 28px rotunjit (radius 8px) cu fundal `--accent` + inel alb decorativ (SVG inline, ca logo mark-ul Lumina) + wordmark „AI Fluency" în Spectral 700.
- `.nav-pill` (S0–S10): inactiv = text `--ink-soft` transparent; hover = fundal `--paper-2`; activ = fundal `--accent` + text alb — pattern păstrat, doar recolorat.
- `.nav-toggle` (theme switch): restilizat ca buton „secundar" Lumina — fundal alb/`--surface`, border `--line`, pastilă.

### 4. Componente

| Componentă | Tratament nou |
|---|---|
| `.card`, `.exercise`, `.session-card` | fundal `--surface`, border `--line`, radius 14px, umbră `sm` la hover (`box-shadow: 0 4px 14px rgba(26,33,30,.09)`) |
| `.tag`, `.badge-*` | pastilă radius 999px cu fundal „soft" + text colorat, mapate pe semantice: `badge-p0`→neutru, `badge-p1`→info, `badge-p2`→success, `badge-p3`→accent |
| `.callout`, `.callout-blue`, `.callout-green` | **schimbare de tratament**: din bară-stânga simplă → cutie de alertă completă (fundal soft + border 1px + text), ca în secțiunea Alerte Lumina. `callout` implicit → ton accent/info, `callout-blue` → info, `callout-green` → success |
| `.warning-card` | devine alertă „danger" în stilul Lumina (fundal `#FDF3F1`-echivalent, border roșu soft) |
| `.tabs`/`.tab` (index) + `.role-switch`/`.role-btn` (pagini sesiune) | **unificare**: ambele treceau pe pattern-uri diferite (underline vs pastilă); devin un singur component „pill tabs" (track `--paper-2`, padding 4px, tab activ fundal `--surface` + umbră + text `--accent`, tab inactiv transparent + `--ink-soft`) — necesită ajustare minimă de markup dacă clasele nu se aliniază 1:1, dar structura HTML (buton + `.active`) rămâne |
| `.diag-grid`, `.agenda`, `.checklist`, `.template-block`, `.prompt-box`, `.success-box` | structură HTML neschimbată, doar recolorare pe noile tokenuri |

### 5. Ce NU se schimbă

- Arhitectura de 14 pagini statice.
- `assets/main.js` (logica de tab-uri/theme toggle) — rămâne funcțional, doar claselor CSS li se schimbă valorile vizuale, nu numele (cu excepția unificării `.tabs`/`.role-switch`, dacă markup-ul cere ajustare minimă).
- `assets/glossary.js`.
- Conținutul text al paginilor.
- NU se adaugă elemente de gamificare (streak, XP, nivele, dashboard/catalog shell complex tip Lumina) — nu sunt relevante pentru un curriculum intern fără conturi.

## Testare / verificare

Vizual, manual, cu preview browser pe minim: `index.html` (grid sesiuni + tabs), un `sN.html` cu tot conținutul (role-switch, agenda, exercise, callout, diag-grid — recomand `s0.html` care le are pe toate), `dictionar.html`. Verificare explicită: light + dark mode, contrast text pe fundaluri noi, hover states pe carduri/pastile/nav.

## Riscuri / decizii deschise

- Unificarea `.tabs` vs `.role-switch` într-un singur pattern vizual e un cleanup minor de consistență, nu o cerință explicită — dacă introduce regresii vizuale neașteptate, poate fi lăsată pe structuri separate dar recolorate identic (fallback sigur, fără pierdere de funcționalitate).

## Corecție de scop (descoperită la scrierea planului)

Spec-ul inițial a presupus un singur `assets/style.css` comun tuturor paginilor. În realitate există **3 surse de stil separate**:

1. `assets/style.css` — folosit de `index.html` + `s0.html`–`s10.html` (12 pagini). Ținta principală a rebrand-ului.
2. `dictionar.html` — `<style>` inline proprie, cu alt set de tokenuri (`--bg`, `--surface`, `--surface-2`, `--ink-faint`, plus `--cat-*` pentru culorile categoriilor de termeni din glosar). **Rămâne în scop** — primește propriul rebrand de tokenuri Lumina (mapate 1:1 pe aceleași valori din tabelul de mai sus, sub alte nume de variabile), plus fonturi Spectral/Hanken Grotesk.
3. `01-program-10-saptamani.html` — `<style>` inline proprie, pagină **orfană** (nelinkuită din nicio altă pagină a site-ului). **Exclusă din scop** — rămâne neatinsă.
