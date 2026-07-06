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
- **`ghiduri/`** — sursele markdown din care se construiesc paginile:
  - `02-ghid-facilitare-S{0,1,2}.md` — ghidurile de facilitare (timing, conținutul tutorialului, capcane).
  - `03-exercitii-S{0,1,2}.md` — fișele de exerciții aplicate pe LMS.
  - `AI-Wins-Fails.md` — template-ul documentului partajat de echipă.
- **`01-program-10-saptamani.html`** — pagină orfană (nelinkuită), varianta veche a programului. Nu se atinge fără cerere explicită.

---

## Cum se folosesc împreună

- `index.html` e contextul de ansamblu — îl citești o dată, la început.
- La fiecare sesiune: **tu** conduci după panoul „Ghid facilitare", iar **participanții** lucrează după panoul „Exerciții echipă" (ambele pe aceeași pagină `sN.html`).
- **S0, S1 și S2 sunt gata** (ghid + exerciții). Pasul următor firesc e **S3** (slash commands & skills), pe același tipar.

---

## Ce NU e inclus (intenționat)

Materialele exploratorii de pe parcurs — proiectul alternativ „Deska" (cu schemă SQL gata făcută) și sandbox-ul Python — **nu** sunt în pachet, pentru că merg împotriva principiului „pornim doar de la idee, construim tot". Le am salvate separat; spune dacă vrei să le adaug.
