# Claude Code Fluency — Ghid de facilitare · S2

*Publicul: echipă senior, cu fundamentele AI deja acoperite. Formatul de joi: tutorial → lucru aplicat → schimb de practici.*

> **Notă:** Claude Code publică des. Sintaxa exactă (comenzi, flag-uri, keybindings) se poate schimba de la o lună la alta. La începutul fiecărei sesiuni rulează `/help` și verifică docul oficial. Acest ghid predă principii care rezistă, nu sintaxă care se schimbă săptămânal.

---

## S2 — CLAUDE.md, constituția repo-ului

A doua sesiune tehnică. Premisa: S1 a dat fiecăruia o „rețetă de sesiune" personală — cum conduce bucla. S2 mută o parte din acea disciplină din capul omului într-un fișier pe care **Claude îl citește automat**, la fiecare sesiune, fără să i-o repeți. E primul pas de context engineering din program.

### Obiective de învățare

La final, fiecare știe:
- Ce e `CLAUDE.md` și când/cum îl citește Claude Code.
- Straturile de memorie (personal vs. proiect vs. local) și precedența lor.
- **Harta completă a folderului `.claude/`** — nu doar `CLAUDE.md`, ci și ce rol au `settings.json`, `hooks/`, `agents/`, `skills/`, `.mcp.json` — și în ce sesiune viitoare se aprofundează fiecare piesă.
- Ce merită scris în `CLAUDE.md` — și, la fel de important, ce **nu**, ca să nu umfle contextul degeaba.
- Diferența dintre **principii comportamentale universale** (gen seturile Karpathy și Cherny) și **context specific de proiect** — și în ce strat pune fiecare.
- Cum verifică empiric dacă un `CLAUDE.md` chiar schimbă comportamentul modelului, nu doar există.
- Cum **generează** (nu scrie de la zero) scaffold-ul `.claude/` — personal și de proiect — cerându-i lui Claude Code s-o facă, dintr-un prompt-rețetă repetabil.

> **Notă de scop pentru facilitator:** S2 e cea mai densă sesiune de până acum — combină conținut conceptual (straturi, anatomie, principii) cu un rezultat concret (scaffold personal + de proiect) pe care vrem ca **fiecare** să-l aibă gata până la finalul zilei. Sesiunea a fost extinsă oficial la ~3,5h (kicker-ul din `s2.html` actualizat) ca să încapă tot fără să taie conținut. Dacă pe teren timpul tot nu ajunge, tăierea cea mai sigură e segmentul 6 (bootstrap-ul de proiect devine temă individuală, nu demo live).

### Structura zilei

| Bloc | Durată |
|------|--------|
| Tutorial | 100–130 min |
| Lucru aplicat | 75–90 min |
| Schimb de practici | 15–20 min |

---

### Tutorial (100–130 min)

Concret, cu demo pe repo-ul de nisip. Șase segmente.

#### 1. Ce e CLAUDE.md și de ce contează (10–15 min)

- **Ce e:** un fișier Markdown pe care Claude Code îl citește **automat**, la începutul sesiunii, ca parte din context — fără să-l ceri tu explicit de fiecare dată.
- **Legătura cu S1:** rețeta de sesiune din S1 trăia în capul fiecăruia (sau într-o notiță personală). Problema: nu ajuta pe nimeni altcineva și trebuia „repetată" verbal lui Claude la fiecare sesiune nouă. `CLAUDE.md` e locul unde regulile stabile ale unui repo devin **memorie persistentă și partajată** — Claude le știe din prima, oricine deschide sesiunea pe acel repo beneficiază.
- **Ce NU e:** nu e documentație pentru oameni (un README), nu e un istoric de decizii, nu e un loc unde „mai bagi ceva, nu strică". Fiecare linie din `CLAUDE.md` intră în context la **fiecare** sesiune — costă tokeni și atenție de model la fiecare rulare, deci trebuie să merite locul.

**Demo:** deschide un repo fără `CLAUDE.md`, dă-i lui Claude o sarcină simplă (ex: „adaugă un test pentru X") și arată o presupunere greșită tipică (framework de test greșit, convenție de naming ignorată). Apoi arată același prompt cu un `CLAUDE.md` minimal care fixează acea presupunere.

#### 2. Straturile de memorie și precedența lor (15–20 min)

| Fișier | Scope | Precedență |
|--------|-------|------------|
| `~/.claude/CLAUDE.md` | Personal, toate proiectele | Cel mai jos |
| `.claude/CLAUDE.md` (sau `CLAUDE.md` în root) | Proiect, comis în git | Mijloc |
| `.claude/CLAUDE.local.md` | Proiect, **gitignored** | Cel mai sus |

- Personalul e pentru preferințele tale de-a lungul tuturor proiectelor (stil de commit, cum răspunzi la întrebări, ce unelte externe folosești).
- Proiectul e pentru ce trebuie să știe **oricine** lucrează pe acel repo cu Claude Code — de-asta se comite în git.
- Local e pentru ce e adevărat doar pe mașina ta (căi locale, porturi, chei de test) — nu ajunge niciodată în commit.
- Regula practică: când două straturi se contrazic, câștigă cel mai specific (local > proiect > personal).

> **„AGENTS.md" nu e un agent — și Claude Code nu-l citește direct.** Vei întâlni prin alte unelte fișiere `AGENTS.md`: e numele open-standard, cross-tool, pentru *același lucru* ca `CLAUDE.md` — un fișier de **context**, nu un „agent" pe care-l rulezi (agenții pe care-i delegi sunt `.claude/agents/`, S4). Claude Code citește `CLAUDE.md`, **nu** `AGENTS.md`. Dacă un repo are deja `AGENTS.md`, importă-l din `CLAUDE.md` cu o linie `@AGENTS.md` (sau symlink), ca ambele unelte să citească aceeași sursă. Încărcarea ierarhică (rădăcina la startup, subfolderele la cerere) e reală — dar pentru `CLAUDE.md`.

**Demo:** arată cele trei fișiere pe repo-ul de nisip, unul lângă altul, cu câte o regulă care se suprapune, ca să se vadă precedența în practică.

#### 3. Anatomia folderului `.claude/` — harta completă (20–25 min)

`CLAUDE.md` e **intrarea** în sistem, nu tot sistemul. Merită arătată harta completă acum, ca fiecare să știe unde se duce ce — chiar dacă majoritatea pieselor se construiesc efectiv în sesiuni viitoare.

| Piesă | Ce e | Când o aprofundăm |
|-------|------|--------------------|
| `CLAUDE.md` / `CLAUDE.local.md` | memoria persistentă, citită automat la fiecare sesiune | **azi (S2)** |
| `settings.json` / `settings.local.json` | permisiuni allow/ask/deny, config | atins în S1, aprofundat în S9 (guvernanță) |
| `skills/<nume>/SKILL.md` | workflow-uri reutilizabile, invocate cu `/nume` sau auto-declanșate | S3 |
| `agents/<nume>.md` | subagenți specializați, rulează în context izolat | S4 |
| `hooks/` (config în `settings.json`) | acțiuni deterministe legate de evenimente (ex: lint după fiecare edit) | S5 |
| `.mcp.json` | conectare la unelte/servicii externe (DB, Figma, Jira) | S6 |
| `docs/` | resurse de referință citite la cerere de skills (nu la fiecare sesiune) | organic, o dată cu S3 |
| `~/.claude/projects/<proiect>/memory/MEMORY.md` | auto-memory: index cross-sesiune, machine-local | menționat azi, se acumulează organic |

Regula de fond care leagă tot: **fiecare piesă costă context doar dacă e citită la fiecare sesiune.** `CLAUDE.md` și `settings.json` intră mereu; `skills/` și `docs/` intră doar la cerere sau când sunt relevante — de-asta „mută-l într-un skill" e răspunsul corect când `CLAUDE.md` se umflă (revino la asta în S3).

**Demo:** arată un `.claude/` matur, real (al tău sau un exemplu public) — cu `hooks/pre-tool-use.sh`, câteva zeci de `skills/`, un `agents/verifier.md`, un `MEMORY.md`. Punctează: nimic din asta nu a apărut într-o zi — fiecare piesă corespunde unei sesiuni din program (S3 skills, S4 agenți, S5 hooks, S6 MCP). Azi construim doar fundația: `CLAUDE.md` + eventual un `settings.json` minimal.

#### 4. Ce pui / ce NU pui în CLAUDE.md (20–25 min)

| ✅ Pui | ❌ Nu pui |
|--------|-----------|
| Comenzi de build/lint/test pe care Claude nu le poate ghici | Orice Claude poate afla citind codul |
| Convenții de cod care diferă de default-ul limbajului/framework-ului | Convenții standard pe care Claude le știe deja |
| Instrucțiuni de testare și test runner-ul preferat | Documentație API detaliată — pui un link, nu conținutul |
| Etichetă de repo (naming de branch-uri, convenții de PR) | Informație care se schimbă des (se erodează rapid) |
| Decizii arhitecturale specifice proiectului | Explicații lungi sau tutoriale |
| Ciudățenii de mediu (variabile de env obligatorii) | Descrieri fișier-cu-fișier ale codebase-ului |
| Capcane sau comportamente ne-evidente | Practici evidente gen „scrie cod curat" |

**Pragul de mărime:** țintă sub ~200 de linii — nu arbitrar, e cam ce urmează un model fiabil dintr-un fișier fără să „dilueze" regulile importante. Pentru fiecare linie, întrebarea de test: *„dacă o șterg, Claude greșește ceva anume?"* Dacă nu — afară.

**Trucul pentru fișiere care cresc:** sintaxa `@cale/catre/fisier` importă alt fișier fără să-l lipești inline (ex: `Vezi @docs/architecture.md pentru context de arhitectură`). Așa ții `CLAUDE.md` mic și muți detaliul acolo unde se citește doar la nevoie.

**Cum verifici că a prins:** un `CLAUDE.md` nu e „gata" pentru că există — e gata când schimbă vizibil comportamentul. Ia 2–3 task-uri pe care Claude le-a rezolvat prost sau cu presupuneri greșite **înainte** de fișier, rulează-le din nou după, și compară. Dacă Claude tot greșește ceva pentru care ai scris o regulă explicit, semnul e că fișierul a devenit prea lung și regula s-a pierdut în zgomot — nu că regula era greșită.

**Demo:** ia un `CLAUDE.md` „umflat" (copy-paste dintr-un README întreg, >200 linii) vs. unul de 15–30 de linii, țintit, și arată diferența de comportament — sau lipsa ei, dacă umflarea nu ajută cu nimic.

#### 5. Principii universale: de la Karpathy la Cherny — un baseline personal comun (25–30 min)

Nu tot ce pui în `CLAUDE.md` e specific proiectului. Andrej Karpathy a distilat din tipare comune de eșec ale LLM-urilor la coding patru principii **universale**, valabile pe orice repo:

1. **Gândește înainte de a coda** — nu presupune în tăcere, nu ascunde confuzia, expune compromisurile și întreabă când ceva e ambiguu.
2. **Simplitate întâi** — minimul de cod care rezolvă problema, nimic speculativ, nicio abstracție „pentru mai târziu".
3. **Schimbări chirurgicale** — atinge doar ce trebuie; nu „îmbunătățește" cod adiacent; curăță doar propria mizerie (importuri/variabile pe care le-ai lăsat neutilizate tu).
4. **Execuție orientată pe scop** — transformă cerința într-un criteriu de succes verificabil și bucla până se confirmă, nu până „pare gata".

**Convergență, nu coincidență:** Boris Cherny (Anthropic) publică independent un `CLAUDE.md` personal cu 13 reguli de „Workflow Orchestration". Trei dintre ele — *Simplicity First*, *No Laziness* (root cause, nu band-aid), *Minimal Impact* (atinge doar ce trebuie) — ajung la exact aceleași concluzii ca Karpathy, din altă direcție. Semnul: nu e o modă a unui singur autor, e un tipar real de eșec al LLM-urilor la coding, observat independent de doi oameni diferiți.

Ce aduce Cherny **în plus** față de Karpathy — mai puțină atitudine, mai multă mecanică de workflow:
- **Plan mode implicit** pentru orice task cu 3+ pași (leagă direct de S1 — aici devine regulă scrisă, nu doar obicei bun).
- **Verificare înainte de „gata"** — nicio declarație de succes fără dovadă (test, log, diff rulat).
- **Bucla de auto-îmbunătățire** — după orice corecție, se notează pe scurt ce s-a întâmplat, ca aceeași greșeală să nu se repete.
- **Subagenți pentru cercetare** care ar polua contextul principal (preview de S4).

**Distincția care contează pentru straturi:** regula e universală (deci merge în stratul personal), dar **artefactul** pe care regula îl produce e specific proiectului. „Notează lecția după orice corecție" e o regulă personală; fișierul `lessons.md` unde o notezi de fapt trăiește în `.claude/tasks/` **al proiectului curent**, pentru că lecțiile despre bug-urile LMS-ului n-au ce căuta în alt repo.

**Un baseline personal comun** — punctul de plecare pe care-l propunem întregii cohorte azi, de pus în `~/.claude/CLAUDE.md`:

```markdown
## Workflow
- Plan mode implicit pentru orice task cu 3+ pași; dacă lucrurile deraiază, oprește-te și re-planifică.
- „Gata" înseamnă dovedit, nu presupus: rulează testul/comanda/screenshot-ul înainte să declari succes.
- După orice corecție, notează pe scurt ce s-a întâmplat în `.claude/tasks/lessons.md` al proiectului curent; citește-le la începutul sesiunii.
- Pentru cercetare care ar umple contextul principal, folosește subagenți.

## Simplitate & disciplină
- Cel mai simplu fix care rezolvă problema — nu cel mai deștept, nu cel mai „complet".
- Root cause, nu band-aid. Nu bug-fixuri temporare care revin.
- Impact minim: atinge doar ce ai fost rugat, fără refactor-uri sau reformatări surpriză.
- Nu presupune în tăcere: expune compromisurile, întreabă când ceva e ambiguu.
```

E un **punct de plecare comun**, nu un fișier sacru — fiecare îl adaptează pe măsură ce observă ce funcționează pe cazul lui (exact bucla „AI Wins & Fails").

**Regula de separare care rămâne din acest segment:** `CLAUDE.md` de proiect = fapte și convenții **specifice acestui repo**. Principii comportamentale universale = strat personal, o singură sursă de adevăr. Când vezi un `CLAUDE.md` de proiect cu reguli gen „gândește pas cu pas" sau „nu supra-inginerie" — semnul e că cineva a amestecat cele două straturi.

**Demo:** arată blocul de mai sus intrând în `~/.claude/CLAUDE.md`, apoi un `CLAUDE.md` de proiect care rămâne complet liber de aceste reguli — doar fapte specifice repo-ului.

#### 6. De la template la scaffold: generat cu Claude, nu construit manual (15–20 min)

Ținta zilei, concret: la final, fiecare are (a) `~/.claude/CLAUDE.md` cu blocul de mai sus și (b) un `CLAUDE.md` de proiect + un `.claude/` minim (settings.json, `tasks/`) pe un repo real (LMS-ul din S0–S1, sau altul).

Nu construim asta fișier cu fișier, și nu întreținem un script de scaffold separat (bash vs. PowerShell diferă de la o mașină la alta, exact genul de lucru care se dezactualizează). În schimb, **îi cerem lui Claude Code s-o facă**, ca orice altă sarcină — în plan mode, dintr-un prompt-rețetă pe care-l poți refolosi pe orice repo nou.

**Pasul 1 — bootstrap personal (o singură dată):**
> „Verifică dacă `~/.claude/CLAUDE.md` există. Dacă nu, creează-l. Adaugă, fără să ștergi ce există deja, secțiunile `## Workflow` și `## Simplitate & disciplină` cu regulile de mai jos: [colează blocul din segmentul 5]."

**Pasul 2 — bootstrap de proiect (pe fiecare repo unde lucrezi):**
> „Rulează `/init`. După ce ai `CLAUDE.md` generat, creează și `.claude/settings.json` minim cu un `deny` pe comenzi distructive, plus `.claude/tasks/todo.md` și `.claude/tasks/lessons.md`, goale, cu câte un antet de o linie."

`/init` e comanda built-in care analizează codebase-ul și generează un `CLAUDE.md` de pornire (build/test/lint detectate automat) — nu înlocuiește gândirea din segmentul 4, dar elimină partea mecanică.

**„Posibilitatea de îmbunătățire":** scaffold-ul de azi e intenționat minimal — Stage 1 dintr-un model în trepte. Treptele următoare (`rules/` modulare, `skills/`, `agents/`, `hooks/`) sunt exact hărțile din segmentul 3, fiecare cu sesiune dedicată. Nu se completează totul azi — se completează organic, o dată cu programul.

**Demo:** rulează exact cei doi pași, live, pe repo-ul de nisip — arată diff-ul propus de Claude **înainte** de a-l aproba (legătură directă cu S1: nu aprobi orbește un bootstrap doar pentru că „e doar scaffold").

---

### Lucru aplicat (75–90 min)

**Brief:** fiecare iese cu scaffold-ul complet — personal + de proiect — pe un repo propriu (pe LMS-ul construit în S0–S1, sau pe alt repo real dacă LMS-ul e prea puțin conturat încă).

1. **Bootstrap personal** — rulează prompt-ul de la segmentul 6, pasul 1, pe propriul `~/.claude/CLAUDE.md`. Citește diff-ul propus **înainte** să aprobi.
2. **Bootstrap de proiect** — `/init` + prompt-ul de la segmentul 6, pasul 2 (`settings.json` minim, `tasks/todo.md`, `tasks/lessons.md`).
3. Completează `CLAUDE.md`-ul de proiect generat de `/init` cu tema de prep (comenzi + 2–3 convenții/capcane adunate după S1) — `/init` dă un draft, nu un fișier finit. Țintă 15–30 de linii, nu un eseu.
4. Alege 2–3 task-uri concrete pe care le-ai da lui Claude Code pe acel repo. Rulează-le **înainte** de a activa fișierul (sau pe o sesiune fără el) și **după** — notează diferența reală, nu presupusă.
5. Pe hârtie (nu implementat azi), notează pentru propriul `.claude/`: din harta de la segmentul 3, ce ai deja și ce lipsește. Nu construiești `skills/`, `hooks/` sau `.mcp.json` acum — doar identifici, ca să știi ce te așteaptă în S3–S6.

Pe parcurs, fiecare notează unde a fost tentat să bage ceva care aparținea de fapt la „ce NU pui" — sau un principiu universal care de fapt aparținea stratului personal, nu celui de proiect.

### Artefact al sesiunii

Două artefacte reale, comise/create — nu notițe:
- Un `~/.claude/CLAUDE.md` **personal**, cu blocul de workflow orchestration (baseline comun cohortei, de-acum adaptat de fiecare).
- Un `CLAUDE.md` **de proiect** + scaffold minim `.claude/` (`settings.json`, `tasks/todo.md`, `tasks/lessons.md`), comis în git — un fișier de care Claude chiar se folosește la sesiunea următoare.

### Schimb de practici (15–20 min)

Fiecare, ~2 min:
- O regulă din `CLAUDE.md` care a schimbat vizibil comportamentul lui Claude pe un task concret.
- Ceva ce a scris inițial și a scos, pentru că nu ajuta cu nimic (semnal bun — arată calibrare, nu eșec).

Se notează în docul „AI Wins & Fails".

---

### Capcane comune (note pentru facilitator)

- **„Mai bag și asta, nu strică."** Cel mai comun reflex — `CLAUDE.md` crește necontrolat. Amintește: fiecare linie intră în context la fiecare sesiune, pe bune, nu doar teoretic.
- **Copy-paste din README.** Semnul că cineva a confundat documentație-pentru-oameni cu memorie-pentru-model. Cere-i să șteargă tot ce nu schimbă comportamentul lui Claude.
- **Reguli fără verificare.** Cineva scrie reguli „bune" fără să le testeze pe un task real — nu știe dacă au prins. Insistă pe pasul „înainte / după" din lucrul aplicat.
- **Confuzia straturilor.** Reguli personale (stilul tău de commit) sau principii universale (gen Karpathy) ajunse în `CLAUDE.md` de proiect, sau invers, capcane de proiect puse doar în fișierul personal, unde restul echipei nu le vede.
- **„Hai să construim tot azi."** Cineva vrea să facă și `hooks/`, și `skills/`, și `.mcp.json` în aceeași sesiune, pentru că a văzut harta completă. Amintește: harta e ca să înțeleagă unde se duce fiecare lucru, artefactul de azi rămâne `CLAUDE.md` + scaffold minim — restul are sesiune dedicată.
- **Scaffold aprobat orbește.** Cineva acceptă tot ce propune `/init` sau prompt-ul de bootstrap fără să citească diff-ul, pentru că „e doar scaffold, nu contează". Contează — e primul lucru pe care-l va citi Claude la fiecare sesiune de-acum. Leagă direct de regula din S1: nu aprobi nimic orbește.

### Prep pentru S3

Temă de 5 minute: fiecare notează un prompt pe care l-a scris **manual, la fel, de cel puțin 2-3 ori** în ultima săptămână (ex: „review-uiește diff-ul curent după convențiile noastre", „scrie un commit message"). Candidat evident, chiar din sesiunea de azi: **prompt-ul de bootstrap** de la segmentul 6 — fiecare îl va rula din nou pe alte repo-uri. În S3 îl transformăm într-un slash command / skill reutilizabil.
