# Claude Code Fluency — Ghid de facilitare · S3

*Publicul: echipă senior, cu fundamentele AI deja acoperite. Formatul de joi: tutorial → lucru aplicat → schimb de practici.*

> **Notă:** Claude Code publică des. Sintaxa exactă (câmpuri de frontmatter, substituții, flag-uri) se poate schimba de la o lună la alta. La începutul fiecărei sesiuni rulează `/help` și verifică docul oficial (`code.claude.com/docs/en/skills`). Acest ghid predă principii care rezistă, nu sintaxă care se schimbă săptămânal. **Acest ghid a fost verificat pe docul oficial în iulie 2026** — două lucruri s-au schimbat față de cum le știai poate din 2025 și sunt marcate explicit mai jos: (1) comenzile custom și skills-urile sunt acum **același lucru**, (2) argumentele poziționale sunt **0-based** (`$0` = primul).

---

## S3 — Slash commands & skills: promptul repetat devine unealtă

A treia sesiune tehnică. Premisa vine direct din prep-ul de la finalul S2: fiecare a notat **un prompt pe care l-a scris manual, la fel, de 2-3 ori** în ultima săptămână. S3 îl transformă în ceva reutilizabil — invocat cu `/nume`, sau declanșat automat de Claude când e relevant. E al doilea pas de context engineering: după ce în S2 ai mutat **faptele** stabile ale repo-ului într-un fișier citit automat, în S3 muți **procedurile** repetate într-un fișier încărcat doar la nevoie.

### Legătura cu S2 — distincția care ține toată sesiunea

Un singur criteriu separă cele două straturi, și e testul pe care-l repeți toată ziua:

- **Fapt** → `CLAUDE.md`. „Stack-ul e React+Vite+TS", „testele rulează cu `dotnet test`", „nu atinge `RemainingDays` fără review". Se citește la **fiecare** sesiune, costă context mereu.
- **Procedură** → un skill. „Când review-uiesc un diff, fac pașii ăștia patru", „când scriu un commit, urmez formatul ăsta". Se încarcă **doar când o folosești**, deci reference-ul lung costă aproape nimic până când chiar ai nevoie de el.

Docul oficial pune exact acest criteriu: *fă un skill când tot copiezi aceleași instrucțiuni în chat, sau când o secțiune din `CLAUDE.md` a crescut într-o **procedură**, nu într-un fapt.* Momentul „mută-l într-un skill" pe care l-am promis în S2 (segmentul 4, când `CLAUDE.md` se umfla) — aici îl încasăm.

### Obiective de învățare

La final, fiecare știe:
- Ce e un skill, concret: un folder cu un `SKILL.md` = **frontmatter YAML** (spune *când* se folosește) + **corp Markdown** (spune *ce* să facă).
- Că **slash command custom = skill** — s-au unificat. `.claude/commands/review.md` și `.claude/skills/review/SKILL.md` produc amândouă `/review`. Un skill e doar forma mai bogată a aceluiași lucru.
- Diferența dintre **forma minimă** (un singur `.md`) și **forma completă** (folder cu fișiere ajutătoare) — și când sari de la una la alta.
- **Cine invocă** un skill — tu (`/nume`), Claude (automat, prin `description`), sau amândoi — și cum controlezi asta cu `disable-model-invocation` și `user-invocable`.
- Cum trece **argumente** unui skill (`$ARGUMENTS`, `$0`/`$1` poziționale **0-based**, argumente numite) și cum documentezi cu `argument-hint`.
- Cum **injectează context dinamic** — `` !`comanda` `` rulează înainte ca modelul să vadă skill-ul — și de ce e o suprafață de securitate (`disableSkillShellExecution`).
- Ce înseamnă **progressive disclosure**: `description` e mereu în context (ca modelul să știe că skill-ul există), corpul se încarcă doar la invocare, iar fișierele ajutătoare doar când skill-ul le cere.
- Cum **verifică** empiric că un skill (a) se declanșează pe prompturile pe care ar trebui și (b) produce ce trebuie — aceeași buclă „înainte/după" din S2.
- Cum **generează** un skill cerându-i lui Claude, pornind de la promptul repetat din prep.

> **Notă de scop pentru facilitator:** S3 e mai ușoară conceptual decât S2, dar are o capcană de sintaxă (0-based args) și una de model mental (unificarea command/skill) pe care merită să le fixezi bine. Miezul zilei e segmentul 6 (transformarea promptului repetat în skill) plus dovada „înainte/după" — restul e suport pentru ele. Dacă timpul strânge, comprimă segmentul 5 (fișiere ajutătoare + `allowed-tools` devin demo scurt, nu exercițiu separat) și protejează segmentele 3 (cine invocă) și 6.

### Structura zilei

| Bloc | Durată |
|------|--------|
| Tutorial | 90–110 min |
| Lucru aplicat | 70–85 min |
| Schimb de practici | 15–20 min |

---

### Tutorial (90–110 min)

Concret, cu demo pe repo-ul de nisip. Șase segmente.

#### 1. De ce skills — promptul repetat devine unealtă (10–15 min)

- **Punctul de plecare:** promptul pe care fiecare l-a notat în prep-ul S2 — ceva scris manual, la fel, de 2-3 ori. Candidatul evident chiar din S2: prompt-ul de bootstrap (`~/.claude/CLAUDE.md` + scaffold), pe care fiecare îl va rula din nou pe alte repo-uri. Alți candidați tipici: „review-uiește diff-ul curent după convențiile noastre", „scrie un commit message în formatul nostru", „deschide un PR cu template-ul echipei".
- **De ce contează:** un prompt repetat manual e (a) inconsistent — de fiecare dată îl formulezi puțin altfel, (b) needocumentat — trăiește în capul tău, nu-l știe echipa, (c) neversionat — nu evoluează controlat. Exact problemele pe care `CLAUDE.md` le-a rezolvat pentru **fapte** în S2; skill-ul le rezolvă pentru **proceduri**.
- **Criteriul (repetat toată ziua):** dacă e un *fapt stabil* despre repo → rămâne în `CLAUDE.md`. Dacă e o *procedură pe care o repeți* → devine skill. Semnul clasic că ai greșit stratul: o secțiune din `CLAUDE.md` care sună a „pași de urmat", nu a „așa e proiectul" — aia voia să fie skill.

**Demo:** ia un prompt lung pe care l-ai scris de mai multe ori (de preferat chiar bootstrap-ul din S2), arată-l ca text brut colat în chat, apoi anunță: „la finalul zilei, ăsta e `/nume` — și Claude îl poate declanșa și singur."

#### 2. Anatomia unui skill — și de ce „command" și „skill" sunt același lucru (20–25 min)

**Un skill e un folder cu un fișier `SKILL.md`:**

```
.claude/skills/summarize-changes/
└── SKILL.md          # obligatoriu: frontmatter + instrucțiuni
```

`SKILL.md` are două părți:

```markdown
---
description: Rezumă modificările necomise și semnalează ce e riscant. Folosește când userul întreabă ce s-a schimbat, vrea un commit message, sau cere review pe diff.
---

## Modificările curente

!`git diff HEAD`

## Instrucțiuni

Rezumă modificările de mai sus în 2-3 puncte, apoi listează riscurile pe care le observi.
```

- **Frontmatter YAML** (între `---`) — metadatele. Singurul câmp *recomandat* e `description`: el spune lui Claude *când* să folosească skill-ul. Numele comenzii (`/summarize-changes`) vine din **numele folderului**, nu din frontmatter.
- **Corpul Markdown** — instrucțiunile pe care Claude le urmează când skill-ul rulează.

**Unificarea — schimbarea din 2026 pe care trebuie s-o știe toți:**

> Comenzile custom au fost **contopite** cu skills. Un fișier `.claude/commands/review.md` și un skill `.claude/skills/review/SKILL.md` produc **amândouă** `/review` și se comportă identic. Fișierele tale vechi din `.claude/commands/` funcționează în continuare. Skill-ul aduce în plus, opțional: un **folder** pentru fișiere ajutătoare, **frontmatter** care controlează cine-l invocă, și **auto-declanșarea** de către Claude.

Deci nu mai gândi „aleg între command și skill". Gândește **forma minimă vs. forma completă a aceluiași lucru**:

| Forma minimă | Forma completă |
|--------------|----------------|
| Un singur fișier `.md` (în `commands/` sau `skills/<nume>/SKILL.md`) | Un folder `skills/<nume>/` cu `SKILL.md` + fișiere ajutătoare |
| Bun pentru un prompt-template scurt: `/commit`, `/review`, `/pr` | Bun când ai nevoie de reference lung, scripturi, sau exemple care se încarcă la cerere |
| Rapid de creat | Se scalează — muți detaliul greu în fișiere separate |

Începi mereu cu forma minimă. Treci la folder **doar când** ai ceva ce merită încărcat la cerere (un reference de 200 de linii, un script). Nu construi folder cu subfoldere „ca să fie" — e exact reflexul „mai bag ceva, nu strică" din S2, mutat un nivel mai sus.

**Unde trăiesc skills-urile și cine le vede** (paralel direct cu straturile `CLAUDE.md` din S2):

| Locație | Cale | Se aplică la |
|---------|------|--------------|
| Personal | `~/.claude/skills/<nume>/SKILL.md` | toate proiectele tale |
| Proiect | `.claude/skills/<nume>/SKILL.md` | doar acest repo, **comis în git** |
| Plugin | `<plugin>/skills/<nume>/SKILL.md` | unde e activat pluginul (namespace `plugin:nume`) |

Precedență când numele se repetă: **enterprise > personal > proiect**, iar orice skill cu numele unui skill built-in (bundled) îl suprascrie. Dacă un skill și un command au același nume, **skill-ul câștigă**.

**Demo:** creează live `~/.claude/skills/summarize-changes/SKILL.md` (exact exemplul de mai sus), fă o mică modificare într-un fișier, apoi arată-l invocat în **două feluri**: (a) tastând `/summarize-changes`, (b) întrebând natural „ce am schimbat?" — și lasă-l pe Claude să-l declanșeze singur. Punctează: același fișier, două căi de intrare.

#### 3. Cine invocă — și de ce e cea mai importantă decizie (20–25 min)

Asta e miezul conceptual al zilei. Un skill are, implicit, **două uși de intrare**: o poți deschide tu (`/nume`) sau o poate deschide Claude (automat, când `description`-ul se potrivește cu ce ceri).

`description` **nu e documentație — e interfața de auto-declanșare.** E singurul lucru din skill care stă **mereu** în context (ca modelul să știe că skill-ul există); corpul se încarcă doar la invocare. Deci un `description` prost = skill care nu se declanșează când trebuie, sau se declanșează când nu trebuie. Regula practică: pune cazul principal de folosire **primul** și include cuvintele pe care le-ai spune natural („când vrei un commit message", „când review-uiești un diff").

Două câmpuri de frontmatter controlează ușile:

| Frontmatter | Poți invoca tu | Poate invoca Claude | Când e bun |
|-------------|:--------------:|:-------------------:|------------|
| *(implicit)* | Da | Da | cunoștințe + acțiuni fără efecte periculoase |
| `disable-model-invocation: true` | Da | **Nu** | acțiuni cu efecte: `/commit`, `/deploy`, `/send-slack`. Nu vrei ca Claude să decidă singur că e momentul de deploy. |
| `user-invocable: false` | **Nu** | Da | context de fundal care nu e o „comandă": „cum funcționează sistemul legacy X". Claude ar trebui să-l știe când e relevant, dar `/legacy-context` n-are sens ca acțiune. |

**Distincția care contează pentru siguranță:** un skill cu efecte laterale (scrie, comite, trimite, deployuiește) primește aproape mereu `disable-model-invocation: true`. Legătura directă cu regula din S1/S2: nu vrei ca modelul să declanșeze o acțiune ireversibilă pentru că „codul pare gata". Tu ții degetul pe trăgaci.

**Costul de context (leagă de pragul de mărime din S2):** `description`-ul intră în context la fiecare sesiune (ca liniile din `CLAUDE.md`), corpul doar la invocare. Deci ai un buget: dacă ai zeci de skills, descrierile lor concurează pentru spațiu și cele rar folosite se scurtează. Consecință practică — `description` scurt și țintit, corp sub ~500 de linii, reference-ul greu în fișiere ajutătoare (segmentul 5).

**Demo:** ia skill-ul de la segmentul 2 și adaugă-i `disable-model-invocation: true`. Arată că `/summarize-changes` merge în continuare, dar întrebarea naturală „ce am schimbat?" nu-l mai declanșează. Apoi un al doilea skill de tip „acțiune cu efect" (un `/commit` schițat) și explică de ce **acela** primește flag-ul obligatoriu.

#### 4. Argumente și injectare de context (20–25 min)

Un skill devine unealtă adevărată când primește input.

**Argumente:**

- `$ARGUMENTS` — tot ce urmează după numele skill-ului, ca text brut. `/fix-issue 123` → în corp, `$ARGUMENTS` devine `123`.
- **Poziționale, 0-based** — `$ARGUMENTS[0]` (sau scurt `$0`) = **primul** argument, `$1` = al doilea, ș.a.m.d.

  > ⚠️ **Capcană de sintaxă, corectată în 2026:** e **0-based**. `$0` e primul, nu `$1`. Dacă ai văzut prin tutoriale mai vechi „`$1` = primul argument", e depășit. Verifică pe docul curent.

  ```markdown
  Migrează componenta $0 din $1 în $2, păstrând comportamentul existent.
  ```
  `/migrate-component SearchBar React Vue` → `$0`=`SearchBar`, `$1`=`React`, `$2`=`Vue`. Valorile cu spații se pun în ghilimele: `/skill "hello world" second` → `$0`=`hello world`.
- **Argumente numite** — declari `arguments: [issue, branch]` în frontmatter și folosești `$issue`, `$branch` în corp (mapate pe poziții, în ordine). Mai lizibil decât `$0`/`$1` când ai mai multe.
- `argument-hint: [issue-number]` — text de autocomplete, ca userul să știe ce să tasteze. Pur documentativ.

**Injectare de context dinamic — `` !`comanda` ``:**

Sintaxa `` !`comanda` `` rulează o comandă de shell **înainte** ca skill-ul să ajungă la model, și înlocuiește locul cu output-ul. Claude nu vede comanda — vede rezultatul, ca text deja inserat.

```markdown
## Context PR
- Diff: !`gh pr diff`
- Comentarii: !`gh pr view --comments`
```

E **preprocesare**, nu ceva ce execută Claude. De asta e atât de util: skill-ul ajunge la model deja „hrănit" cu starea reală (diff-ul curent, statusul git), nu cu presupuneri. Pentru comenzi pe mai multe linii, folosești un bloc `` ```! ``.

> ⚠️ **Suprafață de securitate.** Aceste comenzi rulează automat, fără să le aprobi de fiecare dată. Un skill dintr-un repo în care ai încredere scăzută poate rula orice la deschidere. Două apărări: (1) `allowed-tools` pentru skills de proiect intră în vigoare doar **după** ce accepți dialogul de trust al folderului — citește skill-urile înainte să ai încredere într-un repo; (2) setarea `disableSkillShellExecution: true` (ideal în managed settings) oprește complet execuția asta. Legătură cu S2: la fel cum citeai diff-ul de scaffold înainte de aprobare, citești un skill de proiect înainte să te încrezi în el.

**Demo:** transformă un prompt static într-unul cu `$ARGUMENTS` (ex. `/fix-issue`), apoi adaugă o linie `` !`git diff HEAD` `` și arată că skill-ul „știe" diff-ul curent fără ca tu să-l colezi.

#### 5. Fișiere ajutătoare & pre-aprobarea uneltelor (15–20 min)

Aici forma minimă devine forma completă — dar doar când merită.

**Progressive disclosure cu fișiere ajutătoare:**

```
my-skill/
├── SKILL.md         # overview + navigare (mereu, la invocare)
├── reference.md     # detalii lungi — încărcate DOAR când SKILL.md trimite la ele
└── scripts/
    └── helper.py    # executat, nu încărcat în context
```

Referi fișierele din `SKILL.md` cu link-uri Markdown, ca modelul să știe ce conțin și **când** să le încarce:

```markdown
- Pentru detalii complete de API, vezi [reference.md](reference.md)
```

Ideea (aceeași economie de context din S2): un reference de 300 de linii sau o specificație de API n-au ce căuta în context la fiecare rulare. Le pui într-un fișier separat; se încarcă doar când skill-ul chiar are nevoie de ele. `SKILL.md` rămâne scurt (ținta: sub 500 de linii), detaliul greu stă deoparte. Scripturile (`.py`, `.sh`) nu se încarcă deloc în context — Claude le **execută**, folosind `${CLAUDE_SKILL_DIR}` ca să le găsească indiferent de directorul curent.

**Pre-aprobarea uneltelor — `allowed-tools`:**

```yaml
---
name: commit
description: Stage și commit pe modificările curente
disable-model-invocation: true
allowed-tools: Bash(git add *) Bash(git commit *) Bash(git status *)
---
```

`allowed-tools` dă voie skill-ului să folosească acele unelte **fără să-ți ceară aprobare** de fiecare dată, cât e activ. **Nu restricționează** — restul uneltelor rămân disponibile, guvernate de permisiunile tale normale (S1). Invers, `disallowed-tools` **scoate** unelte din bazin cât e skill-ul activ (util pentru skills autonome care n-ar trebui să atingă ceva anume).

**Preview de S4 (leagă sesiunile):** un skill poate rula într-un **subagent izolat** cu `context: fork` — corpul skill-ului devine promptul subagentului, care nu vede istoricul conversației tale. Cu `agent: Explore` rulezi cercetare grea fără să poluezi contextul principal. Nu construim asta azi — doar arătăm câmpul, ca fitil pentru S4 (subagenți).

**Demo:** ia `/commit`-ul schițat la segmentul 3, adaugă-i `allowed-tools` cu comenzile git și arată că rulează fără să mai ceară aprobare la fiecare `git add`. Menționează `context: fork` fără să-l implementezi.

#### 6. De la prompt la skill, generat cu Claude — și cum verifici că a prins (20–25 min)

Ținta zilei, concret: fiecare pleacă cu **cel puțin un skill funcțional, comis**, făcut din promptul lui repetat.

Nu-l scriem manual, câmp cu câmp. Îi cerem lui Claude, ca orice altă sarcină — el știe sintaxa curentă mai bine decât o ținem noi minte.

**Pasul 1 — generează skill-ul dintr-un prompt existent:**
> „Am promptul ăsta pe care-l rulez des: [colează promptul repetat din prep]. Fă-l skill în `.claude/skills/`. Pune un `description` bun pentru auto-declanșare. Dacă are efecte laterale (scrie/comite/trimite), adaugă `disable-model-invocation: true`. Unde are sens un argument, folosește `$ARGUMENTS` sau poziționale. Arată-mi `SKILL.md` înainte să-l scrii."

**Pasul 2 — verifică că se declanșează când trebuie:**
> Testează în două feluri: (a) `/nume` direct; (b) o frază naturală care ar trebui să-l cheme automat. Dacă nu se declanșează pe fraza naturală, problema e aproape mereu `description`-ul — nu corpul.

**Pasul 3 — dovada „înainte/după" (aceeași buclă empirică din S2):**

A vedea skill-ul declanșându-se îți spune doar că Claude l-a găsit, nu că face ce voiai. Se măsoară **două lucruri separat**:
1. **Se declanșează** pe prompturile pe care ar trebui (și nu pe cele pe care n-ar trebui)? → reglezi `description`.
2. **Produce** ce te aștepți când se declanșează? → reglezi corpul.

Metoda pentru ambele: rulează 2-3 prompturi realiste într-o sesiune curată, o dată **cu** skill-ul și o dată **fără** (dezactivat), și compară. Sesiunea curată contează — contextul rămas de la scrierea skill-ului maschează golurile din instrucțiuni. (Pentru cine vrea automatizat: pluginul `skill-creator` rulează bucla asta A/B și scoate un raport — opțional, nu obligatoriu azi.)

**Când NU faci skill** (la fel de important ca „când faci"):
- E un *fapt*, nu o procedură → rămâne în `CLAUDE.md` (segmentul 1).
- L-ai făcut o singură dată și n-ai motiv să-l repeți → doar un prompt, nu merită un fișier.
- E ceva ce Claude face oricum bine fără instrucțiuni → nu-l „ajuta" cu un skill care doar adaugă zgomot.

**Demo:** rulează exact cei trei pași, live, pe repo-ul de nisip, pornind de la bootstrap-ul din S2 sau de la un `/review`. Arată `SKILL.md`-ul propus de Claude **înainte** de a-l accepta (regula din S1/S2: nu aprobi orbește), apoi dovada „înainte/după" pe un prompt.

---

### Lucru aplicat (70–85 min)

**Brief:** fiecare iese cu cel puțin un skill funcțional, comis în git pe repo-ul LMS (din S0–S2), făcut din propriul prompt repetat — și cu **dovada** că se declanșează și că schimbă rezultatul.

1. **Alege promptul** — cel din prep-ul S2 (scris manual de 2-3 ori). Dacă n-ai unul bun, candidați siguri: `/commit` (format de commit), `/review` (review pe diff după convențiile LMS), sau bootstrap-ul de `.claude/`.
2. **Generează skill-ul** — prompt-ul de la segmentul 6, pasul 1. Citește `SKILL.md`-ul propus **înainte** să-l accepți: are `description` care conține cuvintele pe care le-ai spune natural? Are `disable-model-invocation` dacă are efecte laterale?
3. **Adaugă input** — dacă skill-ul ar beneficia, pune un `$ARGUMENTS` sau un pozițional (`$0`/`$1`), și eventual o linie `` !`git ...` `` care-i injectează starea curentă. Verifică pe hârtie că ai numerotat 0-based.
4. **Verifică declanșarea** — testează `/nume` **și** o frază naturală. Dacă nu pornește automat pe frază, reglează `description`-ul, nu corpul.
5. **Dovada înainte/după** — rulează 2-3 prompturi realiste cu skill-ul activ vs. fără (sesiune curată). Notează diferența **reală**, nu presupusă — exact ca la `CLAUDE.md` în S2.
6. **Comite** skill-ul de proiect (`chore: add /nume skill`). Skill-urile personale (`~/.claude/skills/`) **nu** se comit — sunt ale tale, pe toate repo-urile.

**Extensie (dacă ai terminat):** ia un skill care a crescut prea mult și **sparge-l** — mută reference-ul lung într-un `reference.md` separat, referit din `SKILL.md`. Simte diferența de context (progressive disclosure). Sau: adaugă `allowed-tools` la un skill de acțiune și vezi cum dispar prompturile de aprobare.

### Artefact al sesiunii

Un artefact real, comis — nu notițe:
- Cel puțin un skill funcțional în `.claude/skills/` (sau `.claude/commands/`) pe repo-ul LMS, cu `description` care declanșează corect și cu **dovada „înainte/după"** pe un prompt concret.

### Schimb de practici (15–20 min)

Fiecare, ~2 min:
- Skill-ul pe care l-a făcut, din ce prompt repetat a venit, și dacă e user-only sau auto-declanșabil (și de ce).
- Un moment „aici s-a văzut diferența" — fie declanșarea (a pornit singur pe fraza corectă), fie rezultatul (înainte/după).

Se notează în docul „AI Wins & Fails", la coloana „Candidat standard?" — de-aici alegeți, în Faza 3, ce skills intră în setul de referință al echipei.

---

### Capcane comune (note pentru facilitator)

- **„Command sau skill?"** — întrebarea greșită. S-au unificat: alege între *forma minimă* (un `.md`) și *forma completă* (folder), nu între două unelte. Cine încă gândește în termeni de „command vs skill" pierde faptul că sunt același `/nume`.
- **`$1` = primul argument.** Cel mai probabil bug de sintaxă al zilei. E **0-based**: `$0` e primul. Vine din tutoriale vechi. Pune pe toată lumea să verifice numerotarea pe un skill cu 2+ argumente.
- **`description` tratat ca documentație.** Cineva scrie un `description` vag („helper pentru git") și se miră că skill-ul nu se declanșează. `description`-ul e **interfața de auto-invocare** — pune cazul de folosire și cuvintele naturale în el.
- **Skill de acțiune fără `disable-model-invocation`.** Un `/deploy` sau `/commit` pe care Claude îl poate declanșa singur = risc. Acțiunile cu efecte laterale primesc aproape mereu flag-ul care le face user-only.
- **Fapt împachetat ca skill (sau invers).** Cineva face skill dintr-un fapt stabil („stack-ul e X") care voia să fie în `CLAUDE.md`; sau lasă în `CLAUDE.md` o procedură de 5 pași care voia să fie skill. Testul: *fapt stabil → `CLAUDE.md`; procedură repetată → skill.*
- **Folder prematur.** „Fac skill, deci îmi trebuie folder cu `reference.md` și `scripts/`." Nu. Începe cu forma minimă (un `.md`); folder doar când chiar ai ceva de încărcat la cerere. Reflexul „mai bag ceva, nu strică" din S2, urcat un nivel.
- **Skill declarat „gata" pentru că se declanșează.** Declanșarea ≠ rezultat corect. Insistă pe pasul „înainte/după" — la fel ca la `CLAUDE.md` în S2, un skill contează doar când schimbă vizibil rezultatul.
- **Încredere oarbă în skills de proiect.** Un skill dintr-un repo poate rula `` !`comenzi` `` la invocare și-și poate acorda `allowed-tools`. Citește-l înainte să te încrezi în repo — exact ca diff-ul de scaffold din S2.

### Prep pentru S4

Temă de 5 minute: fiecare notează o sarcină pe care ar vrea s-o dea lui Claude **fără să-i polueze contextul principal** — o cercetare grea (ex: „unde e definită logica de X în tot codebase-ul?"), o verificare paralelă, o analiză a unui fișier mare. Ai văzut deja fitilul azi: câmpul `context: fork` + `agent:` din segmentul 5 rulează un skill într-un **subagent izolat**. În S4 luăm asta în serios — subagenți dedicați, cu context propriu, care fac munca grea și întorc doar concluzia.
