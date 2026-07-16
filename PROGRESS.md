# PROGRESS — AI Fluency

_Actualizat: 2026-07-15_

## 🎯 Goal curent

Pregătește **materialul-sursă complet pentru S4 (Subagents) și S5 (Hooks)** — cele
3 fișiere markdown per sesiune, sincronizate între ele, la nivelul S3.
Construirea paginilor `s4.html` / `s5.html` e **nice-to-have**: doar dacă mai
rămâne timp după ce materialul e gata.

### Priorități (în ordine)

1. **[must]** S4 — `ghiduri/02-ghid-facilitare-S4.md` + `ghiduri/prezentare-S4.md` + `ghiduri/03-exercitii-S4.md`
2. **[must]** S5 — `ghiduri/02-ghid-facilitare-S5.md` + `ghiduri/prezentare-S5.md` + `ghiduri/03-exercitii-S5.md`
3. **[nice-to-have]** `s4.html` complet (panel facilitator 6 segmente + panel echipă + self-check + recuperare rapidă)
4. **[nice-to-have]** `s5.html` complet

**Criteriu de „gata" per material:** ghidul are 6 segmente cu timing; prezentarea
(Marp) e slide-cu-slide sincronă cu ghidul; exercițiile sunt ~6 și gradate — la
fel ca setul S3. Verificare = citit diff + aruncat un ochi în browser (site static,
fără teste).

## 📍 Starea curentă a cursului

- **Complete** (facilitator + echipă + self-check + recuperare rapidă): S0, S1, S2, S3.
- **Cioturi** (~90 linii, „Conținut în pregătire", au semințe de conținut din curriculum): S4–S10.
- **Materialul Git** (`git.html` + `ghiduri/ghid-git-modus-operandi.md` + linkuri nav) — COMPLET, dar **necommis**. De comis separat. Atenție: `excalidraw.log` e log rătăcit MCP, NU se comite (candidat pentru `.gitignore`).

Tiparul unei sesiuni complete = 4 surse sincronizate:
`ghiduri/02-ghid-facilitare-S{n}.md`, `ghiduri/prezentare-S{n}.md`,
`ghiduri/03-exercitii-S{n}.md`, `s{n}.html`.

## 📋 Prompt de pornire (sesiune nouă)

```
Lucrăm la cursul AI Fluency (repo static, română, fără build/teste).
Citește întâi PROGRESS.md.

OBIECTIV: pregătește materialul-sursă pentru S4 (Subagents) și S5 (Hooks),
urmând EXACT tiparul sesiunii S3 (completă). Per sesiune, 3 md-uri sincronizate:
  - ghiduri/02-ghid-facilitare-S{n}.md  — 6 segmente cu timing, întrebări de
    deschidere, greșeli tipice, ce demonstrează facilitatorul
  - ghiduri/prezentare-S{n}.md          — slide-uri Marp, slide-cu-slide sincron cu ghidul
  - ghiduri/03-exercitii-S{n}.md        — ~6 exerciții gradate

Citește întâi setul S3 (02-ghid-facilitare-S3.md, prezentare-S3.md,
03-exercitii-S3.md) ca referință de structură, ton și lungime. Păstrează
terminologia și firul narativ. Pornește de la semințele din cioturile s4.html
(Subagents) și s5.html (Hooks).

VERIFICARE COMPLETĂ A DOC-ULUI (obligatoriu): înainte de a scrie orice fapt
tehnic, deschide doc-ul oficial (code.claude.com/docs) și confirmă numele
evenimentelor de hooks, structura .claude/agents/, sintaxa curentă. Nu copia
cioturile orb — subagents și hooks și-au schimbat detaliile. Semnalează orice
abatere față de cioturi.

ORDINE: S4 complet (3 md-uri) → S5 complet → STOP și raportează. Paginile
s4.html/s5.html doar dacă mai e timp și doar după ce confirm eu. Nu atinge
01-program-10-saptamani.html (orfană). Nu comite nimic până nu cer eu.
```

## Log

- **2026-07-16** — Finalizări post-review (fără S6-S10): card „Documentație oficială" în `index.html` (link-uri code.claude.com mapate pe S2-S5, incl. sub-agents), clarificat modelul „un repo per student" (l.162), comise fișierele NotebookLM S3/S4. **Decizia #3 rezolvată:** fiecare student lucrează pe repo-ul lui (facilitatorul le-a creat câte unul); nu e un repo LMS comun.

- **2026-07-15** — Definit goal S4+S5 (material prioritar, pagini opțional). Materialul Git gata, necommis.
- **2026-07-15** — **Material S4 + S5 COMPLET** (6 fișiere, necommis). Verificat pe doc-ul oficial (sub-agents + hooks) înainte de redactare. Rămas nice-to-have: `s4.html` / `s5.html` complete (după confirmare). Nimic încă nu e comis.
- **2026-07-15** — **`s4.html` + `s5.html` COMPLETE** la nivelul S3 (facilitator + echipă + 5 self-check + nav). Verificat în browser: comutare rol OK, self-check OK, glossary auto-link OK, 0 erori consolă. `index.html` deja consistent (fără schimbări).
- **2026-07-16** — **Review pe proiect (workflow 4 dimensiuni) + pachet de polish COMIS & PUSHED.** Commits `59f2aa4` (design: token --mono, fix --ink-faint→--ink-mute, reduced-motion, cheat-grid mobil), `a24588c` (homepage: done pe S2-S5, coming-soon pe S6-S10, Dicționar în Resurse), `794421b` (README la S0-S5, footer schimbari, șters prezentare-S2.txt). Verificat în browser: 0 erori consolă. Rămas din review: **S6-S10** (efort L), decizia „repo comun vs individual" (#3), prezentare-S1.md, intrări dicționar pentru termeni-cheie. Necomis: cele 2 fișiere suport-notebooklm-S3/S4.md.
- **2026-07-15** — **COMIS.** S4 → `c6604c9`, S5 → `b3bd96b` (fiecare: 3 md + pagina html). Materialul Git era deja comis extern (`52395e0` + `6bd1391`, care a trecut și „Bitbucket→GitHub" — am aliniat referințele din S5). Necommis rămân doar: `excalidraw.log` (log rătăcit MCP, de pus în `.gitignore`) și `PROGRESS.md` (fișier de lucru). **Sesiuni complete: S0–S5.** Următoarea: S6 (MCP).
