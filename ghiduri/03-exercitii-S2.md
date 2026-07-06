# Proiectul-școală LMS — Exerciții · S2

*Pentru participanți. Continuarea proiectului LMS început în S0–S1.*

> **Regula de siguranță:** citește diff-ul înainte să aprobi orice — inclusiv la scaffold. E tentant să dai „da la tot" când „e doar un `CLAUDE.md`", dar exact fișierul ăsta îl va citi Claude la fiecare sesiune de-acum. Un scaffold prost intră în tot ce urmează.

---

## S2 — De la rețeta personală la memoria repo-ului

În S1 ai ieșit cu o „rețetă de sesiune" în capul tău (sau într-o notiță). În S2 o transformi în ceva pe care **Claude îl citește singur**, la fiecare sesiune, fără să i-o repeți. Cele cinci exerciții urmează exact segmentele din tutorial; al șaselea le adună într-un scaffold complet, funcțional, pe repo-ul tău.

Ținta zilei, concret: la final ai (a) un `~/.claude/CLAUDE.md` **personal** cu baseline-ul de workflow și (b) un `CLAUDE.md` de proiect + un `.claude/` minim, **comise în git**, pe repo-ul LMS — și ai **dovedit** că schimbă comportamentul, nu doar că există.

---

### Exercițiul 1 — Baseline-ul personal (≈15 min)

**Antrenează:** stratul personal + principii comportamentale universale (Karpathy / Cherny).

Regulile de comportament („gândește înainte de a coda", „root cause, nu band-aid", „impact minim") sunt **universale** — valabile pe LMS, pe un repo SQL, pe orice. Deci nu au ce căuta duplicate în fiecare `CLAUDE.md` de proiect; locul lor e stratul personal, o singură dată.

**Ce faci:**
1. Cere-i lui Claude Code, în plan mode:
   > „Verifică dacă `~/.claude/CLAUDE.md` există. Dacă nu, creează-l. Adaugă, **fără să ștergi ce există deja**, secțiunile `## Workflow` și `## Simplitate & disciplină` cu baseline-ul de mai jos."
2. Baseline-ul de pornire (îl adaptezi după gustul tău, nu e sacru):
   ```markdown
   ## Workflow
   - Plan mode implicit pentru orice task cu 3+ pași; dacă lucrurile deraiază, oprește-te și re-planifică.
   - „Gata" înseamnă dovedit, nu presupus: rulează testul/comanda/screenshot-ul înainte să declari succes.
   - După orice corecție, notează pe scurt ce s-a întâmplat în `.claude/tasks/lessons.md` al proiectului curent.
   - Pentru cercetare care ar umple contextul principal, folosește subagenți.

   ## Simplitate & disciplină
   - Cel mai simplu fix care rezolvă problema — nu cel mai deștept, nu cel mai „complet".
   - Root cause, nu band-aid. Nu bug-fixuri temporare care revin.
   - Impact minim: atinge doar ce ai fost rugat, fără refactor-uri sau reformatări surpriză.
   - Nu presupune în tăcere: expune compromisurile, întreabă când ceva e ambiguu.
   ```
3. **Citește diff-ul** propus înainte să aprobi. Verifică mai ales că nu suprascrie reguli personale pe care le aveai deja.

**Reușit dacă:** ai un `~/.claude/CLAUDE.md` cu baseline-ul, și poți argumenta de ce fiecare regulă e universală (nu specifică LMS-ului).

---

### Exercițiul 2 — `/init` pe LMS (≈15 min)

**Antrenează:** stratul de proiect + comanda `/init` (segmentele 1, 6).

`/init` analizează codebase-ul și generează un `CLAUDE.md` de pornire — detectează singur comenzile de build/test, framework-urile, tiparele. E un **draft**, nu un fișier finit.

**Ce faci:**
1. Pe repo-ul LMS (walking skeleton-ul din S1), rulează `/init`.
2. Citește ce a generat. Observă ce a **prins corect** (ex: `dotnet run`, `npm run dev`) și ce a **ratat sau umplut degeaba** (descrieri fișier-cu-fișier, evidențe pe care Claude le știa oricum).
3. Nu-l edita încă — doar notează, pe scurt, 2–3 lucruri care ar trebui scoase și 1–2 care lipsesc. Le rezolvi în Ex. 3.

**Reușit dacă:** ai un `CLAUDE.md` draft generat și o listă scurtă „de tăiat / de adăugat" — adică ai citit critic, nu ai acceptat orbește.

---

### Exercițiul 3 — Curățenie & calibrare (≈20 min)

**Antrenează:** ce pui / ce NU pui, pragul de mărime (segmentul 4).

Draftul de la `/init` e aproape mereu prea lung. Aici îl aduci la un fișier care merită fiecare linie.

**Ce faci:**
1. Pornind de la lista din Ex. 2 și de la tema de prep (comenzile + 2–3 convenții/capcane LMS), rescrie `CLAUDE.md`-ul de proiect. Țintă: **15–30 de linii**.
2. Aplică testul liniei, pe fiecare rând: *„dacă șterg linia asta, Claude greșește ceva anume pe LMS?"* Dacă nu — afară.
3. Adaugă contextul de domeniu **ireductibil**: ce e LMS-ul, entitățile principale (curs, prerechizite, sesiune), stack-ul (React+Vite+TS / .NET 10 / SQL Server 2022) — dar **fără** să explici lucruri pe care Claude le deduce citind codul.
4. Dacă ai deja un fișier care documentează arhitectura, nu-l lipi inline — pune un pointer: `Vezi @docs/architecture.md pentru context de arhitectură`.

**Contra-exemplu intenționat:** păstrează, temporar, o versiune „umflată" (draftul brut de la `/init`, netăiat). O folosești în Ex. 4 pentru comparație.

**Reușit dacă:** ai un `CLAUDE.md` sub 30 de linii în care poți justifica **fiecare** rând — și niciun rând nu e o regulă universală (aia e în personal, din Ex. 1).

---

### Exercițiul 4 — Dovada: înainte / după (≈20 min)

**Antrenează:** verificarea empirică — un `CLAUDE.md` e „gata" doar când schimbă comportamentul (segmentul 4).

Un `CLAUDE.md` nu contează pentru că există, ci pentru că modifică vizibil ce face Claude. Aici măsori asta pe bune.

**Ce faci:**
1. Alege 2–3 task-uri concrete pe LMS — de preferat lucruri unde Claude a greșit deja în S1 (ex: „adaugă un endpoint nou după tiparul existent", „scrie un test pentru `GET /courses`", „adaugă o componentă React în structura noastră").
2. Rulează-le **fără** `CLAUDE.md` activ (sesiune curată, fișier redenumit temporar sau pe o copie) și notează presupunerile greșite.
3. Rulează-le **cu** `CLAUDE.md`-ul din Ex. 3 activ. Compară.
4. **Bonus (opțional):** rulează un task și cu versiunea „umflată" din Ex. 3. De multe ori umflarea **nu** ajută cu nimic — sau chiar strică, pentru că regula bună se pierde în zgomot. E cel mai bun argument împotriva reflexului „mai bag ceva, nu strică".

**Reușit dacă:** poți arăta o diferență concretă „înainte/după" pe cel puțin un task — și ai o poziție empirică despre versiunea umflată, nu doar teoretică.

---

### Exercițiul 5 — Scaffold-ul minim de proiect (≈15 min)

**Antrenează:** anatomia `.claude/`, generarea cu Claude, nu manuală (segmentele 3, 6).

`CLAUDE.md` e intrarea, nu tot sistemul. Acum pui fundația `.claude/` peste care se construiește restul programului (skills în S3, agenți în S4, hooks în S5, MCP în S6) — dar **doar** fundația.

**Ce faci:**
1. Cere-i lui Claude Code:
   > „Creează `.claude/settings.json` minim, cu un `deny` pe comenzi distructive (ex: `Bash(rm -rf *)`). Creează și `.claude/tasks/todo.md` și `.claude/tasks/lessons.md`, goale, fiecare cu un antet de o linie."
2. Verifică că `lessons.md` există — e fișierul unde baseline-ul personal (Ex. 1) spune să notezi lecțiile după corecții. Regula e universală (personal), dar **artefactul** trăiește în proiect. Aici se leagă cele două straturi.
3. **Pe hârtie, nu implementat azi:** din harta din tutorial (segmentul 3), notează ce ai deja în `.claude/` și ce urmează — `skills/` (S3), `agents/` (S4), `hooks/` (S5), `.mcp.json` (S6). Nu construi nimic din astea acum.

**Reușit dacă:** ai un `.claude/` cu `CLAUDE.md` + `settings.json` + `tasks/` și o hartă clară a ce urmează — fără să fi construit prematur skills/hooks/MCP.

---

### Exercițiul 6 (Capstone) — Scaffold complet, comis (≈15 min)

**Antrenează:** toate cele cinci împreună, cap-coadă.

**Ce faci:**
1. Verifică că ai, coerent, tot lanțul:
   - `~/.claude/CLAUDE.md` personal cu baseline-ul (Ex. 1).
   - `CLAUDE.md` de proiect, sub 30 de linii, calibrat și **dovedit** (Ex. 3–4).
   - `.claude/settings.json` + `.claude/tasks/` (Ex. 5).
2. **Comite** scaffold-ul de proiect în git, cu un mesaj descriptiv (`chore: add project CLAUDE.md and .claude scaffold`). Fișierul personal (`~/.claude/`) **nu** se comite — e al tău, pe toate proiectele.
3. Notează pentru schimbul de practici: care regulă a schimbat cel mai vizibil comportamentul, și ce ai scos pentru că nu ajuta.

**Reușit dacă:** oricine din echipă poate clona repo-ul LMS și, din prima sesiune Claude Code, beneficiază de context — iar tu ai 2–3 momente „aici s-a văzut diferența" pentru schimbul de practici.

**Extensie (doar dacă ați terminat, în pereche):** comparați două `CLAUDE.md`-uri de proiect făcute independent pe același repo. Ce a scris unul și altul nu? Care diferență e reală (context util) și care e doar zgomot personal strecurat în stratul de proiect? Prima materie primă pentru „standardul de casă" din Faza 3.

---

## Artefact & schimb de practici

La finalul sesiunii, două lucruri concrete.

**1. Artefactele (deja produse în exerciții).** Nu mai scrii nimic separat — le ai deja:
- `~/.claude/CLAUDE.md` personal cu baseline-ul de workflow.
- `CLAUDE.md` de proiect + scaffold `.claude/` minim, comis în git pe LMS.

**2. Schimbul de practici (15–20 min, ~2 min/persoană).** Pe rând, fiecare spune grupului:
- O regulă din `CLAUDE.md` care a schimbat vizibil comportamentul lui Claude pe un task concret (cu exemplul „înainte/după" din Ex. 4).
- Ceva ce a scris inițial și a scos, pentru că nu ajuta cu nimic — semnal bun, arată calibrare, nu eșec.

Notați aceste puncte în docul partajat **„AI Wins & Fails"**. Coloana „Candidat standard?" e cea din care, în Faza 3, alegeți ce reguli intră în `CLAUDE.md`-ul de referință al echipei.

---

### Notă pentru facilitator

- **Ex. 1 și 5 sunt scurte și mecanice — nu le lungi.** Miezul zilei e în Ex. 3 (calibrare) și Ex. 4 (dovadă). Dacă timpul strânge, comprimă Ex. 5 (scaffold-ul minim se poate genera dintr-un singur prompt) și protejează Ex. 4 — verificarea empirică e lecția care rămâne.
- **Nu lăsa pe nimeni să sară peste „înainte/după".** E singurul exercițiu care rupe iluzia „am scris reguli, deci merge". Fără el, oamenii pleacă cu `CLAUDE.md`-uri lungi și necalibrate.
- **Fișierul personal nu se comite.** Dacă vezi pe cineva că dă `git add ~/.claude/...` sau că bagă reguli personale în `CLAUDE.md`-ul de proiect, oprește-te 1 minut pe distincția straturilor.
- **Scaffold ≠ construiește tot.** Cineva va fi tentat să facă și skills, și hooks azi, pentru că a văzut harta. Reamintește: fundația azi, restul are sesiune dedicată (S3–S6).
- Claude Code se schimbă des: un `/help` la începutul sesiunii pentru sintaxa curentă a `/init`, `/permissions`, `@import`.
