<!--
Prezentare S2 — CLAUDE.md, constituția repo-ului
Format slide-uri: fiecare "---" separă un slide, fiecare "##" e titlul slide-ului.
Compatibil Marp / reveal.js / pandoc→pptx. Pentru Marp, decomentează frontmatter-ul de mai jos.
-->
<!--
---
marp: true
theme: default
paginate: true
---
-->

# S2 — CLAUDE.md
## Constituția repo-ului

Faza 1 · Folosire disciplinată · ~3,5h

*Programul de joi — AI Fluency pe Claude Code*

---

## De unde venim → unde mergem

- **S1:** ai o „rețetă de sesiune" personală — cum conduci bucla.
- Problema: trăiește în capul tău. Trebuie repetată la fiecare sesiune. Nu ajută pe nimeni altcineva.
- **S2:** o muți într-un fișier pe care **Claude îl citește automat**, la fiecare sesiune.
- Primul pas de **context engineering** din program.

---

## Obiective

La final, fiecare știe:

- Ce e `CLAUDE.md` și când îl citește Claude.
- Straturile de memorie și precedența lor.
- Harta completă a folderului `.claude/`.
- Ce pui — și, mai important, ce **nu** pui.
- Principii universale (Karpathy/Cherny) vs. context de proiect.
- Cum **generezi** scaffold-ul, nu-l scrii de la zero.

---

## Ce e CLAUDE.md

- Fișier Markdown citit **automat** la începutul fiecărei sesiuni.
- Memorie **persistentă și partajată** a repo-ului.
- Claude știe regulile din prima, fără să i le repeți.

**Ce NU e:**

- Nu e README (documentație pentru oameni).
- Nu e istoric de decizii.
- Nu e „mai bag ceva, nu strică" — fiecare linie costă context la **fiecare** sesiune.

---

## Straturile de memorie

| Fișier | Scope | Precedență |
|--------|-------|------------|
| `~/.claude/CLAUDE.md` | Personal, toate proiectele | Cel mai jos |
| `CLAUDE.md` | Proiect, comis în git | Mijloc |
| `CLAUDE.local.md` | Proiect, gitignored | Cel mai sus |

**Când se contrazic:** câștigă cel mai specific → local > proiect > personal.

---

## Anatomia folderului `.claude/`

`CLAUDE.md` e **intrarea**, nu tot sistemul.

| Piesă | Rol | Sesiune |
|-------|-----|---------|
| `CLAUDE.md` | memorie persistentă | **S2** |
| `settings.json` | permisiuni allow/ask/deny | S1 → S9 |
| `skills/` | workflow-uri reutilizabile | S3 |
| `agents/` | subagenți izolați | S4 |
| `hooks/` | acțiuni deterministe | S5 |
| `.mcp.json` | unelte externe (DB, Figma…) | S6 |

Regula: o piesă costă context **doar dacă e citită la fiecare sesiune**.

---

## Ce pui în CLAUDE.md

- Comenzi de build / lint / test pe care Claude nu le ghicește.
- Convenții care **diferă** de default-ul framework-ului.
- Capcanele repo-ului (ce nu se atinge fără să întrebe).
- Context de domeniu **ireductibil** (entități, ce e proiectul).

---

## Ce NU pui

- Ce Claude poate afla citind codul.
- Convenții standard pe care le știe deja.
- Documentație API → pune un **link/pointer**, nu conținutul.
- Istoricul deciziilor (→ commit messages, ADR-uri).
- „Gândește pas cu pas", „scrie cod curat" → zgomot.

---

## Pragul de mărime

- Țintă: **sub ~200 de linii**. Mai scurt = mai bine.
- Testul liniei, pe fiecare rând:
  > *„Dacă șterg linia asta, Claude greșește ceva anume?"*
- Dacă nu — **afară**.
- Fișier umflat = regulile bune se pierd în zgomot.

**Truc pentru fișiere care cresc:** `@cale/fisier` importă în loc să lipești inline.

---

## Cum verifici că a prins

Un `CLAUDE.md` nu e „gata" pentru că există — ci când **schimbă comportamentul**.

1. Ia 2–3 task-uri unde Claude a greșit **înainte**.
2. Rulează-le din nou **după**.
3. Compară.

> Dacă Claude tot greșește o regulă scrisă explicit → fișierul e prea lung, regula s-a pierdut.

---

## Principii universale — Karpathy

Patru tipare de eșec ale LLM-urilor la coding, valabile pe **orice** repo:

1. **Gândește înainte de a coda** — nu presupune în tăcere, expune compromisurile.
2. **Simplitate întâi** — minimul de cod, nimic speculativ.
3. **Schimbări chirurgicale** — atinge doar ce trebuie, curăță doar propria mizerie.
4. **Execuție orientată pe scop** — „gata" = dovedit, bucla până se confirmă.

---

## Karpathy → Cherny: convergență

- Boris Cherny (Anthropic) publică independent 13 reguli de „Workflow Orchestration".
- Trei se suprapun cu Karpathy: *Simplicity First*, *No Laziness*, *Minimal Impact*.
- **Semnalul:** nu e moda unui autor — e un tipar real, observat independent.

Ce aduce Cherny în plus:

- Plan mode implicit (3+ pași).
- Verificare înainte de „gata".
- Bucla de auto-îmbunătățire (lecții notate).

---

## Regula de separare

- **Reguli universale** (comportament) → strat **personal**, o singură dată.
- **Fapte de proiect** → `CLAUDE.md` de **proiect**.
- Regula produce un artefact; artefactul e specific proiectului.
  - „Notează lecția" = regulă personală.
  - `.claude/tasks/lessons.md` = artefact de proiect.

> `CLAUDE.md` de proiect cu „gândește pas cu pas" = straturi amestecate.

---

## Cele trei template-uri

Livrabilul cu care pleci azi:

| Fișier | În git? | Conține |
|--------|---------|---------|
| `~/.claude/CLAUDE.md` | ❌ | reguli universale + siguranță |
| `CLAUDE.md` | ✅ | stack, comenzi, convenții, capcane |
| `CLAUDE.local.md` | ❌ (gitignored) | override-uri locale, specifice mașinii |

⚠️ `CLAUDE.local.md` **nu** e auto-gitignored — adaugă-l manual.

---

## Scaffold: generat, nu scris manual

Nu construim fișier cu fișier, nu ținem un script separat. **Îi cerem lui Claude.**

**Pasul 1 — personal (o dată):**
> „Adaugă în `~/.claude/CLAUDE.md` secțiunile de workflow + principii, fără să ștergi ce există."

**Pasul 2 — proiect (pe fiecare repo):**
> „Rulează `/init`. Apoi creează `.claude/settings.json` cu un `deny` pe distructive + `.claude/tasks/`."

Citește diff-ul **înainte** de aprobare — și la scaffold.

---

## Lucru aplicat (~75–90 min)

1. Bootstrap personal (`~/.claude/CLAUDE.md`).
2. Bootstrap de proiect (`/init` + `settings.json` + `tasks/`).
3. Calibrează `CLAUDE.md` sub 30 de linii.
4. **Dovada:** rulează 2–3 task-uri înainte/după.
5. Hartă `.claude/`: ce ai / ce urmează (nu construiești skills/hooks azi).

---

## Capcane comune

- **„Mai bag ceva, nu strică."** → fiecare linie costă context.
- **Copy-paste din README.** → documentație ≠ memorie pentru model.
- **Reguli fără verificare.** → fă pasul înainte/după.
- **Confuzia straturilor.** → universal în personal, fapte în proiect.
- **„Construim tot azi."** → azi doar fundația.
- **Scaffold aprobat orbește.** → citește diff-ul.

---

## Cu ce pleci — checklist

- [ ] `~/.claude/CLAUDE.md` personal (necomis).
- [ ] `CLAUDE.md` de proiect < 30 linii (comis).
- [ ] `CLAUDE.local.md` în `.gitignore`.
- [ ] `.claude/` minim: `settings.json` + `tasks/`.
- [ ] **Dovada** înainte/după pe repo-ul tău.

---

## Prep pentru S3

- Notează un prompt pe care l-ai scris **manual, la fel, de 2-3 ori**.
- Candidat din sesiunea de azi: **prompt-ul de bootstrap**.
- În S3 îl transformăm într-un **slash command / skill** reutilizabil.

---

# Întrebări?

Următorul pas: **S3 — Slash commands & skills**
