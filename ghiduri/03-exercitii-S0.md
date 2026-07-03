# Proiectul-școală LMS — Exerciții · S0

*Pentru participanți. Proiectul pe care îl ducem prin tot programul: o **platformă internă de training (LMS)**.*

**Ideea, într-o frază:** o platformă internă unde colegii urmează cursuri — *cursuri → module → lecții* — cu înscrieri, progres și quiz-uri; iar la final, un „tutor" care răspunde la întrebări pe baza conținutului lecțiilor (RAG).

> **Regula de bază a cursului:** porniți **doar de la idee** și construiți **tot** voi. Nimeni nu vă dă schema, scaffold-ul sau arhitectura — ele apar pe parcurs, slice cu slice. În S0 și S1 exersați bucla Claude Code exact acolo unde e cel mai greu: pe teren gol.
>
> **Regula de siguranță:** nu folosiți `--dangerously-skip-permissions`. Pe greenfield, unde curg multe `npm install` și comenzi shell, e cu atât mai important.

---

## S0 — De la idee la punct de plecare

### Ex. S0.1 — Prima sesiune conștientă (≈10 min)

1. Creează un folder gol pentru proiect și deschide Claude Code în el.
2. Cere-i ceva simplu (ex: „ce ai avea nevoie să știi ca să pornim un LMS?") și observă că e un agent, nu un chat — poate propune acțiuni, poate cere permisiuni.

**Reușit dacă:** poți spune în ce mod diferă de un chat obișnuit.

### Ex. S0.2 — Ascute ideea (≈15 min)

Folosește Claude Code ca **partener de gândire**, nu ca generator de cod. Scopul azi e **claritatea**, nu codul.

**Prompt de pornire:**
> „Am ideea asta: [ideea LMS de mai sus]. Nu vreau încă design complet, schemă sau cod. Ajută-mă să definesc: (1) viziunea într-o frază, (2) cel mai mic *walking skeleton* care rulează cap-coadă și demonstrează ideea, (3) 3–5 entități de nivel înalt — fără schemă, fără tabele."

**Ce urmărești:** rezistă tentației de a-l lăsa să-ți genereze deja tot proiectul. Dacă începe să scrie schemă sau cod, oprește-l — nu e treaba de azi.

**Reușit dacă:** ai o frază de viziune + un walking skeleton clar, pe care l-ai putea construi în S1.

### Diagnostic & setup

- Completează-ți scorul (0/1/2) pe cele 9 capabilități din diagnosticul programului — îl recompari la final.
- Checklist de setup pentru un proiect greenfield full-stack:
  - [ ] **.NET 10 SDK** instalat.
  - [ ] **Node LTS** instalat.
  - [ ] **SQL Server 2022** (Developer) accesibil, cu feature-ul **Full-Text Search** (o să conteze mai târziu).
  - [ ] Un **folder gol** pentru repo + `git init`.
  - [ ] Claude Code rulează în acel folder (`claude`, autentificat).
  - [ ] Acces la docul partajat „AI Wins & Fails".
