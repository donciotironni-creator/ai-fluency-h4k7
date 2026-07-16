# AI Fluency pe Claude Code — pachet de start

Program de 10 săptămâni (workshop-uri de joi) pentru o echipă senior de SQL care trece spre full-stack, cu **Claude Code** ca unealtă centrală. Nu reia bazele AI — le presupune — și se concentrează pe folosirea Claude Code ca platformă.

**Proiectul-școală ales:** un **LMS** (platformă internă de training).
**Principiul de bază:** se pornește **doar de la idee**, echipa construiește **tot** — nu se dă schemă sau scaffold; structura apare pe parcurs, slice cu slice.
**Stack:** React + Vite + TypeScript (front-end), .NET 10 (API), SQL Server 2022 (bază de date), iar la final un RAG „clasic" (full-text + embeddings + cosine).

---

## Structura repo-ului

Site static (HTML/CSS/JS simplu, fără build) plus materialele de facilitare în markdown.

- **`index.html`** — pagina de start: prezentarea programului, curriculumul pe 10 săptămâni în 3 faze, matricea de fluență și notele de facilitare.
- **`s0.html`–`s10.html`** — câte o pagină per sesiune. Fiecare pagină de sesiune are două panouri comutabile: **Ghid facilitare** (pentru tine) și **Exerciții echipă** (pentru participanți).
- **`dictionar.html`** — dicționarul de termeni.
- **Pagini transversale:** `cheatsheet.html` (referință rapidă), `artefacte.html` (șabloane copy-paste, inclusiv template-uri de CLAUDE.md și subagenți), `git.html` (modus operandi Git & GitHub), `schimbari.html` (ce s-a schimbat în unealtă între versiuni).
- **`ghiduri/`** — sursele markdown din care se construiesc paginile:
  - `02-ghid-facilitare-SN.md` — ghidurile de facilitare (timing, conținutul tutorialului, capcane).
  - `prezentare-SN.md` — slide-urile (Marp) per sesiune.
  - `03-exercitii-SN.md` — fișele de exerciții aplicate pe LMS.
  - `suport-notebooklm-SN.md` — variantă în proză, self-contained, de dat lui NotebookLM (deocamdată S3, S4).
  - `template-CLAUDE.md`, `template-subagenti.md` — șabloane de referință (livrabilele din S2 și S4).
  - `AI-Wins-Fails.md` — template-ul documentului partajat de echipă.
- **`01-program-10-saptamani.html`** — pagină orfană (nelinkuită), varianta veche a programului. Nu se atinge fără cerere explicită.

---

## Cum se folosesc împreună

- `index.html` e contextul de ansamblu — îl citești o dată, la început.
- La fiecare sesiune: **tu** conduci după panoul „Ghid facilitare", iar **participanții** lucrează după panoul „Exerciții echipă" (ambele pe aceeași pagină `sN.html`).
- **S0–S5 sunt complete** — fiecare sesiune are cele patru surse sincronizate: ghid de facilitare + prezentare (Marp) + exerciții + pagina `sN.html` (cu panel facilitator, panel echipă și self-check). Pasul următor firesc e **S6** (MCP), pe același tipar.

---

## Ce NU e inclus (intenționat)

Materialele exploratorii de pe parcurs — proiectul alternativ „Deska" (cu schemă SQL gata făcută) și sandbox-ul Python — **nu** sunt în pachet, pentru că merg împotriva principiului „pornim doar de la idee, construim tot". Le am salvate separat; spune dacă vrei să le adaug.
