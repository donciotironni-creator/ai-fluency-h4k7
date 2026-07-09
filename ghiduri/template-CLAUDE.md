# Template-uri de referință — cele trei fișiere `CLAUDE`

*Livrabilul de la finalul S2. Trei template-uri, unul per strat de memorie, ca fiecare să plece cu ceva gata de implementat.*

> **Cum se citesc.** Fiecare bloc de cod de mai jos e gata de copy-paste. Adaptează-l — nu-l lăsa ca atare. Regula de aur din S2 rămâne: fiecare linie trece testul *„dacă o șterg, Claude greșește ceva anume?"*. Ce nu trece — afară.

## Harta rapidă: ce fișier, ce conține, unde ajunge

| Fișier | Scope | În git? | Conține |
|--------|-------|---------|---------|
| `~/.claude/CLAUDE.md` | Personal, **toate** proiectele | ❌ nu | Reguli de comportament + siguranță universale (stil, plan mode, boundaries distructive, halt-on-secrets) |
| `CLAUDE.md` | Proiectul curent | ✅ **da** | Fapte specifice repo-ului: stack, comenzi, convenții, capcane |
| `CLAUDE.local.md` | Proiectul curent, doar pe mașina ta | ❌ nu (gitignored) | Override-uri personale + specifice mașinii pentru **acest** proiect |

Precedența când se contrazic: `CLAUDE.local.md` > `CLAUDE.md` > `~/.claude/CLAUDE.md`.

---

## 1. `~/.claude/CLAUDE.md` — personal, toate proiectele

**Nu se comite.** Trăiește o dată, pe mașina ta, și se aplică peste orice repo. Aici pui doar ce e **universal** — reguli de comportament și de siguranță care se repetă pe orice proiect. Zero fapte de proiect (alea sunt duplicare și se erodează).

```markdown
# Instrucțiuni personale — toate proiectele

## Limbă & comunicare
- Răspunde în română când scriu în română.
- Commit messages în engleză, format conventional: feat / fix / docs /
  refactor / test / chore.

## Oprire la secrete (halt-on-secrets)
Dacă detectezi în ce urmează să afișezi, să scrii într-un fișier sau să comiți:
connection string SQL, API key / token (sk-…, JWT), parolă în clar, sau alt
credential — OPREȘTE-TE, raportează ce ai găsit și cere confirmare explicită.
Nu masca automat, nu continua.

## Limite pe operații distructive (cer confirmare explicită)
Nu executa fără confirmare în mesajul curent, indiferent de mod:
- DROP TABLE, TRUNCATE, DELETE fără WHERE pe orice bază.
- ALTER / CREATE OR ALTER PROCEDURE pe baze marcate prod.
- Migrări de schemă (EF etc.) pe baze cu date reale.
- git push --force, git reset --hard pe branch shared.
- Merge în main / develop / master.
Dacă e nevoie de una: oprește-te, descrie comanda, cere confirmare. Nu încerca o variantă echivalentă.

## Workflow
- Plan mode implicit pentru task-uri cu 3+ pași, care ating 2+ layere
  (BE+FE, DB+API), sau care schimbă schemă DB / contracte API / auth.
- „Gata" înseamnă dovedit, nu presupus: rulează testul/comanda/build-ul
  înainte să declari succes.
- Raportează onest: dacă un pas eșuează sau un test nu acoperă comportamentul
  real, spune-o explicit și oprește-te. Nu raporta „done" pe ceva parțial.

## Simplitate & disciplină
- Cel mai simplu fix care rezolvă problema — nimic speculativ.
- Root cause, nu band-aid.
- Impact minim: atinge doar ce ai fost rugat, fără refactor-uri surpriză.
- Nu presupune în tăcere: expune compromisurile, întreabă când e ambiguu.
- Nu șterge dead code pre-existent — menționează-l. Șterge doar
  importurile/variabilele pe care le-ai lăsat tu neutilizate.
```

**Ce pui / ce NU:** aici merg reguli valabile pe **orice** repo. Nu pune nimic despre un proiect anume, nici căi de pe mașina ta (alea sunt în `CLAUDE.local.md`). Ține-l scurt — se încarcă la fiecare sesiune, pe orice proiect.

---

## 2. `CLAUDE.md` — proiect (comis în git)

**Se comite** — e „constituția" repo-ului, o citește oricine din echipă. Structura utilă: **CE** (stack, hartă), **DE CE** (scopul), **CUM** (comenzi, convenții). Țintă sub ~30 de linii de conținut. Exemplu pe proiectul-școală LMS:

```markdown
# LMS — platformă internă de training

Aplicație de învățare: cursuri cu prerechizite, sesiuni, participanți și
progres. Construită greenfield de echipă; structura apare slice cu slice.

## Stack
- Front-end: React + Vite + TypeScript (`frontend/`)
- API: .NET 10 Web API (`backend/`)
- DB: SQL Server 2022
- (Faza finală) RAG clasic: full-text + embeddings + cosine

## Comenzi
- Front-end dev: `npm run dev` (în `frontend/`)
- Front-end build: `npm run build`
- API: `dotnet run` (în `backend/`)
- Teste API: `dotnet test`

## Convenții
- Endpoint-urile REST urmează tiparul din `backend/Controllers/` —
  uită-te la unul existent înainte să adaugi altul.
- Componentele React noi: `frontend/src/components/`, folder per
  componentă, cu fișier de stil alături.
- Tabele SQL la singular, PascalCase (`Course`, `Prerequisite`).
- Migrările DB se scriu de mână — vezi `backend/Migrations/`.

## Capcane
- Prerechizitele unui curs sunt un graf; „tot lanțul" = recursive CTE,
  nu un simplu JOIN.
- Configul de CORS e în `backend/Program.cs` — un endpoint nou apelat din
  front-end poate cere o ajustare acolo.
- Nu adăuga date reale de participanți în seed-uri sau teste.

## Context suplimentar
- Vezi @docs/architecture.md pentru deciziile de arhitectură (dacă există).
```

**Ce pui / ce NU:** context de domeniu ireductibil, comenzi pe care Claude nu le ghicește, convenții care diferă de default, capcane ne-evidente. **Nu** pui: reguli universale (alea-s în personal), documentație lipită (pune pointer cu `@`), descrieri fișier-cu-fișier, „scrie cod curat".

---

## 3. `CLAUDE.local.md` — proiect, doar mașina ta

**NU se comite — dar NU e auto-gitignored.** Trebuie să-l adaugi tu în `.gitignore`, altfel îți urci preferințele personale în repo-ul echipei. Aici pui ce e adevărat pentru **acest** proiect, dar doar pe mașina ta: override-uri de unelte, căi/porturi locale, note personale de proiect.

```markdown
# LMS — note locale (doar mașina mea, nu se comite)

## Override-uri personale
- Echipa folosește npm; eu rulez local cu pnpm. Comenzile mele: `pnpm dev`,
  `pnpm build`.

## Mediu local
- API local pe portul 5080; front-end pe 5173.
- SQL local: instanța `.\SQLEXPRESS`, baza `LMS_dev`.
  (NU pune aici connection string cu parolă — ține-l în user-secrets /
   variabile de mediu și referă-l: vezi `dotnet user-secrets`.)

## Note personale de lucru
- Rularea testelor E2E cere Docker pornit local.
- TODO personal: de refăcut seed-ul de cursuri după merge-ul din feature/x.
```

**Pas obligatoriu — adaugă-l în `.gitignore`:**

```gitignore
CLAUDE.local.md
```

**Ce pui / ce NU:** override-uri „eu prefer X, echipa a standardizat Y", specificuri de mașină (căi, porturi, instanțe locale), note personale volatile. **Nu** pune: reguli care ar folosi echipei (alea merg în `CLAUDE.md` comis) și **niciodată** secrete în clar — chiar dacă fișierul e gitignored, ține credențialele în user-secrets / env și doar referă-le.

---

## Checklist de final de sesiune

La finalul S2, fiecare pleacă cu:

- [ ] `~/.claude/CLAUDE.md` — reguli personale universale, **necomis**.
- [ ] `CLAUDE.md` — sub ~30 de linii, specific repo-ului, **comis în git**.
- [ ] `CLAUDE.local.md` — override-uri locale, **adăugat în `.gitignore`**.
- [ ] Scaffold `.claude/` minim: `settings.json` (un `deny` pe distructive) + `tasks/todo.md` + `tasks/lessons.md`.
- [ ] **Dovada:** 2–3 task-uri rulate înainte/după, care arată o diferență reală de comportament. Un template nu valorează nimic până nu-l vezi lucrând pe repo-ul tău.
