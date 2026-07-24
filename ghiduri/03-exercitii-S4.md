# Proiectul-școală LMS — Exerciții · S4

*Pentru participanți. Continuarea proiectului LMS început în S0–S3.*

> **Regula de siguranță:** citește fișierul de subagent propus de Claude înainte să-l accepți — și dă cercetătorilor unelte **read-only**. Un subagent cu Write/Edit poate modifica repo-ul fără să treci tu prin fiecare pas. Aceeași disciplină ca la skills în S3: nu aprobi orbește, ții degetul pe trăgaci pe agentul principal.

---

## S4 — De la o sarcină zgomotoasă la un cercetător izolat

În S3 ai mutat **procedura** repetată într-un skill. Azi muți **munca grea** — sarcina notată în prep-ul S3, care ți-ar polua contextul cu output pe care nu-l reții — într-un **subagent**: o sesiune separată, cu propriul context, care face treaba și-ți întoarce doar concluzia.

Criteriul care ține toată ziua: *ai nevoie de proces și un rezumat înapoi → subagent; ai nevoie de dialog și context bogat → conversația principală.*

Ținta zilei, concret: la final ai **cel puțin un subagent funcțional, comis în git** pe repo-ul LMS, făcut din propria sarcină de cercetare — și ai **dovedit** că e delegat corect și că păstrează contextul principal curat. Cele șase exerciții urmează segmentele din tutorial.

---

## Prerechizite de mediu (≈20 min) — fă-le înainte de exerciții

Înainte de exercițiile cu subagenți, asigură-te că mediul e viu: te conectezi la baza ta de date și faci un insert prin Entity Framework, apoi confirmi că poți face push pe repo-ul tău de Bitbucket. Repo-ul are deja tot ce trebuie — endpoint-ul de insert, migrarea, agentul `run-lms` și comanda `/ship` (nu construiești skill-uri/agenți acum — aia e S3/S4).

> **Siguranță:** parola SA, connection string-ul și token-ul de Bitbucket le pui **tu** — în `.env` (gitignored), `user-secrets`, cheie SSH. Nu le tasta în chat, nu le comite. Citește comenzile înainte să le aprobi.

### 1 · Baza de date + insert cu EF

**Prompt — conexiune:**
> Sunt în repo-ul LMS (backend .NET 10 în `backend/LearningPlatform.Api`, SQL Server). Pornește SQL Server din `docker-compose.yml` (`docker compose up -d`) — are nevoie de parola SA în `.env` (`MSSQL_SA_PASSWORD`), pe care o pun eu (confirmă că `.env` e gitignored). Apoi dă-mi comanda `dotnet user-secrets set "ConnectionStrings:Lms" "…"` de rulat cu baza mea (`Database=LMS_<numele_meu>`). Nu pune tu parola.

**Prompt — tabelă + verificare:**
> Rulează migrarea `backend/Migrations/001_CreateConnectionTest.sql` pe baza mea (creează `dbo.ConnectionTest`, idempotentă). Pornește API-ul cu agentul `run-lms`. Verifică: `GET /Health/db` → `{status:"ok"}`; dacă dă 503, ajută-mă cu connection string-ul.

**Prompt — insert prin EF:**
> Fă un insert pentru obiectul de test cu EF (nu SQL brut): apelează `POST /Health/db/rows` cu un `Note` al meu. Arată-mi entitatea întoarsă (`Id` + `CreatedAt` puse de DB), apoi confirmă cu `GET /Health/db/rows`.

### 2 · Bitbucket + push

**Prompt — conectare:**
> Repo-ul meu e pe Bitbucket și am deja drepturi. Verifică `git remote -v` (adaugă remote-ul dacă lipsește — îți dau eu URL-ul), apoi `git fetch` ca să confirm accesul. Dacă cere autentificare, spune-mi ce-mi lipsește (SSH / app password) — o configurez eu, nu-mi cere token-ul în chat.

**Prompt — push:**
> Fă o modificare mică (un `HELLO.md` cu numele meu), pune-mă pe un branch de feature, commit conventional, push pe branch-ul meu — arată-mi comenzile înainte. Sau folosește `/ship` (agentul `git-shipper`): commit + push + link de PR pe Bitbucket.

**Reușit dacă:** `GET /Health/db` întoarce ok, îți vezi rândul în `/Health/db/rows`, și ai făcut un push pe branch-ul tău de Bitbucket.

---

### Exercițiul 1 — Alege sarcina & testul izolare/dialog (≈10 min)

**Antrenează:** criteriul subagent vs. conversație principală (segmentele 1, 3).

Înainte să faci un subagent, decide dacă merită unul. Nu tot ce e greu se pune într-un subagent — unele lucruri au nevoie de dialogul din conversație.

**Ce faci:**
1. Ia sarcina din prep-ul S3 (ceva ce ți-ar umple contextul). Dacă n-ai una bună, candidați siguri pe LMS (repo greenfield, un walking skeleton): „mapează stratul de API (controllere → `LmsDbContext` → migrări)", „unde e definit endpoint-ul de health și ce întoarce?", „rezumă ce face `LmsDbContext`".
2. Aplică testul: poți descrie **rezumatul** pe care-l vrei înapoi? Dacă da → e bună de subagent. Dacă vrei „să lucrăm împreună, cu iterații" → e task de conversație principală, alege altceva.
3. Decide din start: cercetare **read-only**, sau chiar are nevoie să modifice? (Aproape mereu e read-only.)

**Reușit dacă:** ai o sarcină-candidat și poți spune într-o frază ce rezumat vrei înapoi și de ce e izolabilă (nu are nevoie de dialog).

---

### Exercițiul 2 — Cheamă un agent built-in (≈10 min)

**Antrenează:** delegarea automată + cei trei built-in (segmentul 2).

Nu trebuie să construiești nimic ca să folosești subagenți: Claude Code vine cu `Explore`, `Plan` și `general-purpose`, și-i cheamă singur.

**Ce faci:**
1. Pune pe LMS o întrebare care necesită scanarea repo-ului: „mapează backend-ul .NET — ce controllere și endpoint-uri există", „ce entități are `LmsDbContext` și cum sunt create?". (Repo-ul e greenfield — întrebi despre ce există, nu despre feature-uri încă nescrise.)
2. Observă în `/tasks` că Claude deleagă la `Explore` (read-only) și rulează într-o fereastră separată.
3. Compară contextul: în conversația principală a intrat **concluzia**, nu cele 15 fișiere pe care le-a deschis subagentul. Verifică cu `/context`.

**Reușit dacă:** ai văzut un subagent built-in delegat automat și poți arăta că munca brută (fișierele scanate) a rămas în fereastra lui, nu în a ta.

---

### Exercițiul 3 — Simte compromisul: izolarea ascunde context (≈15 min)

**Antrenează:** costul izolării — subagentul pornește gol (segmentul 3).

Asta e lecția conceptuală a zilei. Un subagent nu-ți vede conversația. E și beneficiul (context curat), și costul (nu știe ce știi tu).

**Ce faci:**
1. Stabilește în conversație o convenție specifică („în LMS, tratăm datele ca UTC peste tot" sau orice decizie reală din proiectul tău).
2. Deleagă unui subagent o sarcină care **depinde** de acea convenție — **fără** s-o repeți în prompt. Observă cum o ratează (a pornit gol, n-a văzut-o).
3. Repetă delegarea, de data asta **incluzând** convenția în promptul de delegare. Compară rezultatele.

**De ce contează:** izolarea nu e gratis. Dacă sarcina depinde de context din conversație, ori îl repeți în delegare, ori alegi un **fork** (context proaspăt + toată conversația) în loc de un subagent nou.

**Reușit dacă:** poți arăta diferența între delegarea „oarbă" (fără context) și cea corectă (cu contextul necesar în prompt) — și știi când ai nevoie de fork în loc de subagent.

---

### Exercițiul 4 — Primul subagent propriu (≈20 min)

**Antrenează:** definirea unui subagent + generarea cu Claude (segmentele 4, 6).

Un subagent e un fișier `.claude/agents/<nume>.md` = frontmatter (`name`, `description`, opțional `tools`/`model`) + corp Markdown (system promptul). Nu-l scrii manual — îi ceri lui Claude.

**Ce faci:**
1. Cere-i lui Claude Code:
   > „Dau des sarcina asta de cercetare: [sarcina din Ex. 1]. Fă-mi un subagent în `.claude/agents/`. `description` bun pentru delegare (cu cuvintele pe care le-aș spune natural), unelte **read-only** (`Read, Grep, Glob`), `model: haiku`. În corp, spune-i clar ce **rezumat** să întoarcă. Arată-mi fișierul înainte să-l scrii."
2. Citește ce a propus, înainte să accepți. Verifică:
   - `name` cu litere mici și cratime; `description` cu cazul principal și cuvintele naturale.
   - `tools` restrâns la read-only (un cercetător nu are ce face cu Write/Edit).
   - Corpul cere explicit un **rezumat**, nu „analizează tot".

**Model de referință** (subagent de cercetare):
```markdown
---
name: codebase-explorer
description: Cercetează cum e structurat un feature în codebase și
  întoarce o hartă a fișierelor și fluxului. Folosește când cineva
  întreabă „unde/cum e implementat X".
tools: Read, Grep, Glob
model: haiku
---

Ești un explorator de cod. Urmărește fluxul prin fișiere, mapează
layerele, întoarce fișierele-cheie, dependențele și punctele de intrare.
Nu modifica nimic. Întoarce o hartă concisă, nu dump-uri.
```

**Reușit dacă:** ai un `.claude/agents/<nume>.md` pe care l-ai **citit** înainte să-l accepți, cu unelte read-only și un corp care cere un rezumat.

---

### Exercițiul 5 — Dovada: delegarea + contextul curat (≈20 min)

**Antrenează:** verificarea empirică — e delegat? păstrează contextul? (segmentul 6).

Un subagent nu contează pentru că rulează, ci pentru că face munca **fără să-ți umple contextul** și **întoarce ceva util**. Măsori două lucruri separat — exact ca la skills în S3.

**Ce faci:**
1. Cere ceva ce ar trebui să cheme subagentul tău. **Se declanșează** delegarea? Dacă nu → problema e `description`-ul (ca la skills), nu corpul.
2. Lasă-l să ruleze pe o sarcină reală de pe LMS. După ce termină, verifică cu `/context`: în conversația principală a intrat **doar rezumatul**, nu munca brută (fișierele, log-urile)?
3. Dacă a întors un dump, reglează corpul: cere-i explicit un rezumat scurt. Dacă rezultatul e inutil, verifică dacă avea uneltele potrivite.

**Reușit dacă:** poți arăta (a) că subagentul e delegat pe sarcina corectă și (b) că `/context` a rămas curat după ce a scanat mai multe fișiere.

---

### Exercițiul 6 (Capstone) — Comite & (opțional) rulează în paralel (≈15 min)

**Antrenează:** forma finală + paralelism (segmentele 5, 6).

**Ce faci:**
1. **Comite** subagentul de proiect în git (`chore: add <nume> subagent`). Subagenții personali (`~/.claude/agents/`) **nu** se comit — sunt ai tăi, pe toate repo-urile.
2. Notează pentru schimbul de practici: din ce sarcină a venit, ce unelte i-ai dat și de ce, și un moment „aici s-a văzut diferența".

**Extensie (doar dacă ai terminat):** pornește **doi** subagenți în paralel pe două straturi independente de pe LMS (ex. „mapează stratul de API — controllere + `Program.cs`" și, separat, „mapează stratul de frontend — componente shadcn + `App.vue`") și vezi cum Claude sintetizează cele două rezumate. Simte compromisul din segmentul 5: dacă fiecare ar întoarce un dump în loc de rezumat, contextul principal ar fi mai plin decât dacă făceai totul singur.

**Reușit dacă:** ai cel puțin un subagent comis, care e delegat corect și are dovada că păstrează contextul curat — iar oricine clonează repo-ul LMS îl are din prima sesiune Claude Code.

---

## Artefact & schimb de practici

La finalul sesiunii, două lucruri concrete.

**1. Artefactul (deja produs în exerciții).** Nu mai scrii nimic separat — îl ai deja:
- Cel puțin un subagent funcțional în `.claude/agents/` pe LMS, cu `description` care declanșează delegarea corect și cu **dovada** că păstrează contextul principal curat, comis în git.

**2. Schimbul de practici (15–20 min, ~2 min/persoană).** Pe rând, fiecare spune grupului:
- Subagentul făcut, din ce sarcină repetată a venit, ce unelte i-a dat și de ce (read-only?).
- Un moment „aici s-a văzut diferența" — delegarea (a fost chemat pe sarcina corectă) sau economia de context (cât a rămas curat contextul principal).

Notați aceste puncte în docul partajat **„AI Wins & Fails"**. Coloana „Candidat standard?" e cea din care, în Faza 3, alegeți ce subagenți intră în setul de referință al echipei.

---

### Notă pentru facilitator

- **Ex. 1 e scurt și decizional — nu-l sări.** E singurul care oprește oamenii să facă subagenți pentru task-uri de dialog. Cine ratează testul izolare/dialog ajunge cu subagenți care „nu știu ce voiam".
- **Miezul e Ex. 3 (compromisul) și Ex. 5 (dovada).** Dacă timpul strânge, comprimă Ex. 2 (built-in se vede repede) și Ex. 6 (extensia e opțională). Protejează Ex. 5 — verificarea empirică e lecția care rămâne, exact ca la S2–S3.
- **Capcana zilei: subagent pentru dialog.** Aproape sigur cineva delegă ceva ce are nevoie de iterații. Prinde-o la Ex. 1, pe testul „poți descrie rezumatul vrut?".
- **Read-only by default.** Dacă vezi un subagent de cercetare cu Write/Edit, oprește-te 1 minut pe distincția de siguranță (firul S1).
- **Fișierul personal nu se comite.** Ca la S2–S3 — dacă cineva dă `git add ~/.claude/agents/...`, oprește-te pe distincția personal/proiect.
- Claude Code se schimbă des: un `/help` la începutul sesiunii pentru câmpurile curente de frontmatter. Reține: `/agents` nu mai deschide wizard — creezi subagenți cerându-i lui Claude sau editând `.claude/agents/`.
