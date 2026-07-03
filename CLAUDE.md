# CLAUDE.md

Ghidare pentru Claude Code în acest repo.

## Ce este acest repo

Site static, în limba română, pentru programul intern „AI Fluency" (echipă SQL @ SSP în tranziție spre full-stack/AI-assisted development). **Nu există build system, package manager, linter sau suite de teste — niciunul nu există și niciunul nu trebuie presupus.** E HTML/CSS/JS simplu, fără pas de build, fără dependență de server (orice fișier `.html` se deschide direct în browser, sau se servește directorul ca atare cu orice server static).

## Structură

- `index.html` + `s0.html`–`s10.html` — cele 11 pagini de sesiune, toate partajând `assets/style.css` + `assets/main.js` (theme toggle, tab switching generic) + `assets/glossary.js`.
- `dictionar.html` — pagină separată, complet auto-conținută (stiluri `<style>` inline proprii, nu încarcă `assets/style.css`).
- `assets/style.css` — design system-ul „Lumina" (evergreen `#1F5C4B` + chihlimbar `#C67B2E`, Spectral + Hanken Grotesk). Vezi `docs/superpowers/specs/2026-07-03-lumina-design-system-design.md` pentru originea și mapările de tokenuri.
- `01-program-10-saptamani.html` — pagină **orfană**, nelinkuită din nicio altă pagină. Nu se atinge fără cerere explicită.
- `ghiduri/` — materiale de facilitare (markdown).
- `Design sistem e-learning-handoff/` — bundle-ul original de design Lumina (referință, ignorat din git).

## Cum se lucrează aici

**Acesta e conținut static, nu inginerie software cu logică de business.** Pentru schimbări de tip reskin CSS, tipografie, markup, conținut text: edit direct, fără ceremonie de plan/TDD/subagent-per-task. Vezi skill-ul personal `scope-process-to-project` pentru criteriul exact — pe scurt: dacă nu există teste automate de rulat și schimbarea nu atinge stare/logică runtime, verificarea „am citit diff-ul + am aruncat un ochi în browser" e suficientă.

Plan/brainstorming rămân utile pentru decizii de design cu adevărat deschise (cum arată, ce scop are schimbarea) — nu pentru mecanica execuției pe un site fără build/teste.

## Convenții

- Tot conținutul de curs e în română. Păstrează terminologia existentă.
- Nu adăuga date reale de clienți/pacienți, credentiale, connection string-uri sau PROD dumps în niciun fișier de aici.
- `excalidraw.log` e un fișier de log rătăcit de la un server MCP, nu parte din conținut.
