# Claude Code Fluency — Ghid de facilitare · S4

*Publicul: echipă senior, cu fundamentele AI deja acoperite. Formatul de joi: tutorial → lucru aplicat → schimb de practici.*

> **Notă:** Claude Code publică des. Numele exacte (câmpuri de frontmatter, agenți built-in, flag-uri) se pot schimba de la o lună la alta. La începutul fiecărei sesiuni rulează `/help` și verifică docul oficial (`code.claude.com/docs/en/sub-agents`). Acest ghid predă principii care rezistă, nu sintaxă care se schimbă săptămânal. **Verificat pe docul oficial în iulie 2026** — trei lucruri de reținut ca fiind curente: (1) comanda `/agents` **nu mai deschide un wizard** interactiv — creezi subagenți cerându-i lui Claude sau editând direct `.claude/agents/`; (2) subagenții rulează **în background by default** — Claude îi aduce în prim-plan doar când are nevoie imediată de rezultat; (3) agentul `Explore` **moștenește modelul** conversației principale (plafonat la Opus), nu mai rulează automat pe Haiku.

---

## S4 — Subagents: munca grea, în context izolat

Prima sesiune din **Faza 2 — Extensii proprii**. Până acum ai învățat să *folosești* Claude Code disciplinat: permisiuni (S1), fapte în `CLAUDE.md` (S2), proceduri în skills (S3). De aici încolo construiești **componente proprii** care schimbă cum lucrează unealta. Subagenții sunt primul pas — și rezolvă o problemă pe care ai simțit-o deja: contextul principal se umple de gunoi pe care nu-l reții.

Premisa vine direct din prep-ul de la finalul S3: fiecare a notat **o sarcină pe care ar da-o lui Claude fără să-i polueze contextul principal** — o cercetare grea („unde e definită logica de X în tot codebase-ul?"), o verificare paralelă, analiza unui fișier mare. Ai văzut deja fitilul în S3: câmpul `context: fork` + `agent:` rula un skill într-un subagent izolat. Azi luăm asta în serios.

### Legătura cu S3 — al doilea nivel de economie de context

În S2–S3 ai învățat prima formă de **context engineering**: pui în context doar ce trebuie (fapte mereu, proceduri la cerere). Subagentul e a doua formă, la nivel de *execuție*: unele sarcini produc mult zgomot — output de teste, conținutul a 40 de fișiere căutate, un log de 2000 de linii. Zgomotul ăla îți mănâncă fereastra de context și nu-l mai atingi niciodată după. Un subagent face munca aia **în fereastra lui** și-ți întoarce doar **concluzia**.

Un singur criteriu ține sesiunea:

- **Ai nevoie de proces, nu de dump** → subagent. „Rulează suita de teste și spune-mi doar ce pică", „caută în tot repo-ul unde se folosește X". Munca grea stă deoparte; înapoi vine un rezumat.
- **Ai nevoie de dialog și context bogat** → conversația principală (sau un *fork*). Un task cu multe iterații, care depinde de tot ce s-a discutat, nu câștigă nimic dintr-un context proaspăt și gol.

### Obiective de învățare

La final, fiecare știe:
- Ce e un subagent, concret: o sesiune Claude **separată**, cu propria fereastră de context, propriul system prompt și propriul set de unelte — care face o muncă și întoarce doar rezultatul.
- Cei **trei agenți built-in** și când îi cheamă Claude singur: `Explore` (căutare read-only în cod), `Plan` (cercetare read-only în plan mode), `general-purpose` (toate uneltele, task-uri multi-pas).
- **Compromisul central:** un subagent pornește **de la zero** — nu-ți vede conversația, fișierele citite, skills-urile invocate. Izolarea e și beneficiul (context curat), și costul (poate rata context, poate re-descoperi lucruri).
- Cum **definești un subagent propriu**: `.claude/agents/<nume>.md` = frontmatter (`name`, `description`, opțional `tools`/`model`) + corp Markdown = system prompt.
- Că `description` e, ca la skills, **interfața de delegare** — Claude decide să delege citind-o.
- Cum controlezi **uneltele** (read-only vs. cu scriere) și **modelul** (rutezi cercetarea grea pe `haiku`, ieftin) per subagent.
- Cum rulezi mai mulți **în paralel** și cum îi **înlănțui** — și de ce mulți subagenți care întorc fiecare un dump îți sabotează exact economia de context.
- Cum **verifică** empiric că un subagent (a) e delegat când trebuie și (b) întoarce un rezumat util, păstrând contextul principal curat.

> **Notă de scop pentru facilitator:** S4 e o sesiune despre **judecată**, nu sintaxă — sintaxa unui subagent e trivială (două câmpuri obligatorii). Miezul zilei e segmentul 3 (compromisul izolării: *când* merită un subagent) plus segmentul 6 (generare + dovada că economisește context). Restul e suport. Dacă timpul strânge, comprimă segmentul 5 (paralelism devine demo scurt) și protejează 3 și 6. Capcana clasică a zilei: oamenii fac subagenți pentru task-uri care au nevoie de dialog — și se miră că subagentul „nu știe ce voiam". Nu știe: a pornit gol. Asta e lecția.

### Structura zilei

| Bloc | Durată |
|------|--------|
| Tutorial | 90–110 min |
| Lucru aplicat | 70–85 min |
| Schimb de practici | 15–20 min |

---

### Tutorial (90–110 min)

Concret, cu demo pe repo-ul de nisip. Șase segmente.

#### 1. De ce subagenți — izolarea de context (10–15 min)

- **Punctul de plecare:** sarcina notată în prep-ul S3 — ceva ce ai da lui Claude și care ți-ar umple contextul cu output pe care nu-l reții. Candidați tipici pe LMS (repo greenfield, un walking skeleton): „mapează stratul de API — ce controllere și endpoint-uri există", „unde e definit endpoint-ul de health și ce întoarce?", „rezumă ce entități are `LmsDbContext` și cum sunt create (migrări SQL manuale)".
- **De ce contează:** fereastra de context e un buget. Când Claude citește 40 de fișiere ca să-ți răspundă la o întrebare, cele 40 de fișiere rămân în context și concurează cu munca ta reală. Un subagent le citește **în fereastra lui**, o aruncă la final, și-ți dă înapoi doar concluzia — două rânduri, nu 40 de fișiere.
- **Legătura cu S3:** e aceeași economie de context de la skills (progressive disclosure), mutată de la *ce citește modelul* la *unde se face munca*. Fitilul `context: fork` din S3 era exact asta: un skill rulat într-un subagent, ca să nu-ți polueze contextul principal.

**Demo:** pune o întrebare care necesită scanarea repo-ului („mapează backend-ul .NET al LMS: ce controllere, ce endpoint-uri, cum se leagă de DbContext și de migrări"). Arată că Claude deleagă la `Explore`, iar în contextul principal apare doar concluzia (harta) — nu conținutul fișierelor `.cs` pe care le-a deschis subagentul. Punctează: contextul tău a rămas curat.

> **Repo-ul de demo e un walking skeleton** (`HealthController` + `LmsDbContext` cu o entitate, frontend Vue+shadcn — fără login/Course/User). Prompturile care cer feature-uri inexistente („ruta de login", „modulul de cursuri") întorc onest „nu găsesc nimic" — folosește prompturile de mai sus, care lovesc ce chiar există. Cheat-sheet complet cu ground truth: `ghiduri/demo-S4-lms.md`.

#### 2. Cei trei agenți built-in — și delegarea automată (15–20 min)

Nu trebuie să configurezi nimic ca să folosești subagenți: Claude Code vine cu trei, și-i cheamă singur când se potrivesc.

| Agent | Unelte | Ce face | Când îl cheamă Claude |
|-------|--------|---------|------------------------|
| `Explore` | read-only (Write/Edit **interzise**) | căutare și analiză de cod | când trebuie să înțeleagă codebase-ul fără să-l atingă |
| `Plan` | read-only | cercetare în timpul plan mode | când e în plan mode și strânge context înainte de a-ți propune un plan |
| `general-purpose` | **toate** | task-uri complexe, multi-pas, cu explorare **și** acțiune | când munca cere și explorare, și modificări, sau mai mulți pași dependenți |

- **Delegarea e automată** și pornește de la descrierea sarcinii tale: dacă ceri ceva ce se potrivește cu profilul unui agent, Claude deleagă singur. Nu tastezi nimic special.
- **`Explore` și `Plan` sunt read-only** prin construcție — nu pot strica nimic. De asta Claude le folosește liber pentru cercetare.
- **`Explore` sare peste `CLAUDE.md`** și peste git status, ca să fie rapid și ieftin. Consecință practică: dacă o regulă din `CLAUDE.md` chiar trebuie să ajungă la explorare (ex. „ignoră `vendor/`"), o repeți în promptul cu care delegi.

**Demo:** aceeași întrebare din segmentul 1, dar de data asta arată explicit în panoul de task-uri (`/tasks`) subagentul `Explore` rulând și întorcând rezultatul. Apoi cere ceva ce necesită și modificare („găsește și repară toate importurile nefolosite") și arată cum Claude alege `general-purpose`.

#### 3. Compromisul central: izolarea ascunde context (20–25 min)

Asta e miezul conceptual al zilei — echivalentul segmentului „cine invocă" din S3.

Un subagent pornește cu o fereastră de context **proaspătă și goală**. Nu-ți vede conversația, nu vede fișierele pe care Claude le-a citit deja, nu vede skills-urile pe care le-ai invocat. Claude îi scrie un mesaj de delegare care rezumă sarcina, și subagentul lucrează de acolo.

Asta e **și beneficiul, și costul**, în același timp:

- **Beneficiul:** output-ul voluminos rămâne izolat. Contextul tău principal nu se umflă. Poți impune restricții de unelte (un cercetător care nu poate scrie).
- **Costul:** subagentul nu știe ce știi tu. Dacă sarcina depinde de nuanțe discutate în conversație, ori le repeți în delegare, ori subagentul greșește. Și: când întoarce rezultatul, acela **reintră** în contextul tău — deci un subagent care-ți dă înapoi un dump de 500 de linii n-a economisit nimic.

Decizia, pe o axă simplă:

| Folosește... | Când |
|--------------|------|
| **Conversația principală** | task cu dialog, iterații, faze care împart context (planning + implementare + test); schimbare mică și țintită; contează latența |
| **Subagent (izolat)** | output voluminos pe care nu-l reții; vrei restricții de unelte; munca e auto-conținută și poate întoarce un **rezumat** |
| **Fork** *(fitilul din S3)* | vrei context proaspăt **dar** cu toată conversația de până acum — un side-task pe care nu vrei să-l re-explici |

**Regula de aur:** un subagent merită când poți descrie ce **rezumat** vrei înapoi. Dacă nu poți — dacă vrei „să lucrăm împreună la asta" — nu e treabă de subagent.

**Demo:** arată eșecul, intenționat. Cere unui subagent ceva ce depinde de o decizie luată mai devreme în conversație, fără s-o repeți în delegare — și arată cum subagentul o ia razna pentru că n-a văzut-o. Apoi repetă delegând corect (cu decizia inclusă în prompt). Lecția: izolarea nu e gratis.

#### 4. Cum definești un subagent propriu (20–25 min)

Când te trezești că dai *aceeași* sarcină de cercetare iar și iar, o transformi într-un subagent dedicat — exact reflexul „promptul repetat devine skill" din S3, mutat la nivel de agent.

**Un subagent e un fișier Markdown cu frontmatter:**

```markdown
---
name: codebase-explorer
description: Cercetează cum e structurat un feature în codebase și întoarce o hartă a fișierelor și fluxului. Folosește când cineva întreabă „unde/cum e implementat X".
tools: Read, Grep, Glob
model: haiku
---

Ești un explorator de cod. Când primești o sarcină, urmărește fluxul prin
fișiere, mapează layerele și întoarce: fișierele-cheie, dependențele, și
punctele de intrare. Nu modifica nimic. Întoarce o hartă concisă, nu dump-uri.
```

- **`name`** (obligatoriu) — identificator cu litere mici și cratime. Numele folderului nu contează; identitatea vine din `name`.
- **`description`** (obligatoriu) — *când* să delege Claude aici. Ca la skills: **e interfața de delegare**, nu documentație. Pune cazul principal și cuvintele naturale în ea.
- **`tools`** (opțional) — allowlist de unelte. Omis = moștenește tot. Pentru un cercetător, restrânge la `Read, Grep, Glob` — nu poate scrie, deci nu poate strica. (Invers: `disallowedTools` scoate unelte dintr-un set moștenit.)
- **`model`** (opțional) — `haiku`/`sonnet`/`opus`/`fable`/`inherit` (sau un ID complet, ex. `claude-opus-4-8`); default e `inherit`. Aici controlezi **costul**: cercetarea grea pe `haiku` e mult mai ieftină și adesea suficientă.
- **Corpul Markdown** = system promptul subagentului. **Doar** asta primește, plus detalii de mediu — nu tot system-promptul Claude Code.

**Locații** (paralel direct cu skills și `CLAUDE.md`):

| Locație | Cale | Se aplică la |
|---------|------|--------------|
| Personal | `~/.claude/agents/<nume>.md` | toate proiectele tale |
| Proiect | `.claude/agents/<nume>.md` | doar acest repo, **comis în git** |

**Recomandarea de siguranță (leagă de firul S1):** dă subagenților de cercetare unelte **read-only** și ține Edit/Write pe agentul principal, unde tu ai degetul pe trăgaci. Un `general-purpose` *poate* scrie — dar atunci decizi conștient că vrei un muncitor autonom, nu un cercetător. Read-only by default; scriere doar când chiar o vrei.

> **Nuanță de doc (iulie 2026):** `/agents` nu mai deschide un wizard. Creezi un subagent cerându-i lui Claude să scrie fișierul, sau scriindu-l de mână în `.claude/agents/`. Ca la skills — îi ceri lui Claude, apoi **citești** ce a propus înainte să accepți.

**Demo:** cere-i lui Claude să genereze `codebase-explorer` de mai sus în `.claude/agents/` pe repo-ul LMS. Arată fișierul propus, citește-l cu grupul, apoi deleagă-i o sarcină reală și arată harta întoarsă.

#### 5. Paralelism, înlănțuire — și costul lor (15–20 min)

- **Paralelism:** pentru investigații independente, Claude poate porni mai mulți subagenți deodată. „Mapează în paralel, cu subagenți separați: (1) stratul de API — controllere + `Program.cs`; (2) stratul de frontend — componente shadcn + `App.vue`." Fiecare explorează izolat, apoi Claude sintetizează.
- **Înlănțuire:** pentru fluxuri multi-pas, subagenți în serie — unul găsește, altul repară. „Folosește code-reviewer să găsească problemele de performanță, apoi optimizer să le repare."
- **Background by default:** subagenții rulează în fundal cât tu continui lucrul; prompturile de permisiune apar totuși în sesiunea ta principală, numind subagentul care cere.

> ⚠️ **Costul care anulează beneficiul.** Fiecare subagent, când termină, își întoarce rezultatul **în contextul tău**. Zece subagenți care întorc fiecare 200 de linii = 2000 de linii în contextul principal — exact ce voiai să eviți. Regula: subagenții întorc **rezumate**, nu dump-uri. Dacă ai nevoie de paralelism susținut, la scară, pe context care nu încape — aia e `agent teams`, altă unealtă, altă zi.

**Preview de S5 (leagă sesiunile):** ciclul de viață al unui subagent are evenimente — `SubagentStart`, `SubagentStop` — pe care le poți prinde cu un **hook** ca să rulezi ceva determinist (setup înainte, cleanup după). Nu construim asta azi — e fitilul pentru S5: până acum totul depinde de *decizia* modelului; hook-urile rulează **indiferent** de ea.

**Demo:** pornește două investigații în paralel pe LMS (ex. „mapează stratul de API — controllere + `Program.cs`" și, separat, „mapează stratul de frontend — componente shadcn + `App.vue`") și arată în `/tasks` cei doi subagenți rulând simultan, apoi sinteza. Menționează `SubagentStop` fără să-l implementezi.

#### 6. De la sarcină la subagent, generat cu Claude — și cum verifici (20–25 min)

Ținta zilei, concret: fiecare pleacă cu **cel puțin un subagent funcțional, comis**, făcut din sarcina lui din prep.

Nu-l scriem manual — îi cerem lui Claude, ca orice altă sarcină.

**Pasul 1 — generează subagentul dintr-o sarcină repetată:**
> „Dau des sarcina asta de cercetare: [descrie sarcina din prep]. Fă-mi un subagent în `.claude/agents/`. `description` bun pentru delegare automată, unelte **read-only** (`Read, Grep, Glob`), `model: haiku`. În corp, spune-i clar ce **rezumat** să întoarcă. Arată-mi fișierul înainte să-l scrii."

**Pasul 2 — verifică delegarea:**
> Cere ceva care ar trebui să-l cheme și observă: Claude deleagă la subagentul tău? Dacă nu, problema e aproape mereu `description`-ul (ca la skills) — nu corpul.

**Pasul 3 — dovada care contează la subagenți: contextul principal a rămas curat?**

Un subagent nu contează pentru că rulează, ci pentru că **face munca fără să-ți umple contextul** și **întoarce ceva util**. Măsori două lucruri:
1. **A economisit context?** → contextul principal are doar rezumatul, nu munca brută (fișierele, log-urile). Dacă subagentul ți-a întors un dump, reglează corpul: cere-i explicit un rezumat.
2. **Rezultatul e util?** → rezumatul întors chiar răspunde la ce voiai? Dacă nu, reglează corpul (ce anume să întoarcă) sau uneltele (avea acces la ce trebuia?).

**Când NU faci subagent** (la fel de important):
- Task cu **dialog** și iterații → conversația principală. Subagentul pornește gol, nu poate itera cu tine.
- Îl faci o dată → doar cere-i lui Claude direct, nu-ți trebuie un fișier.
- `Explore` built-in face deja treaba → nu construi un subagent de cercetare identic cu cel din cutie.
- Ai nevoie de tot contextul conversației → **fork**, nu subagent nou.

**Demo:** rulează cei trei pași live pe LMS, pornind de la o sarcină reală de cercetare. Arată fișierul propus **înainte** de accept (regula S1/S2/S3: nu aprobi orbește), apoi dovada că `/context` rămâne curat după ce subagentul a scanat 20 de fișiere.

---

### Lucru aplicat (70–85 min)

**Brief:** fiecare iese cu cel puțin un subagent funcțional, comis în git pe repo-ul LMS (din S0–S3), făcut din propria sarcină de cercetare din prep — și cu **dovada** că e delegat și că păstrează contextul principal curat.

1. **Alege sarcina** — cea din prep-ul S3 (ceva ce ți-ar polua contextul). Dacă n-ai una bună, candidați siguri pe LMS: „mapează stratul de API (controllere → `LmsDbContext` → migrări)", „unde e definit endpoint-ul de health și ce întoarce?", „rezumă ce face `LmsDbContext`".
2. **Decide izolarea** — chiar merită un subagent? Poți descrie **rezumatul** pe care-l vrei înapoi? Dacă vrei dialog, e task de conversație principală — alege altă sarcină.
3. **Generează subagentul** — promptul de la segmentul 6, pasul 1. Citește fișierul propus **înainte** să accepți: `description` cu cuvinte naturale? Unelte read-only? `model` potrivit costului?
4. **Verifică delegarea** — cere ceva ce ar trebui să-l cheme. Dacă Claude nu deleagă, reglează `description`-ul, nu corpul.
5. **Dovada de context** — rulează sarcina, apoi verifică cu `/context` (sau uită-te în conversație) că a intrat doar rezumatul, nu munca brută. Dacă a întors un dump, reglează corpul: cere-i un rezumat.
6. **Comite** subagentul de proiect (`chore: add codebase-explorer subagent`). Subagenții personali (`~/.claude/agents/`) **nu** se comit — sunt ai tăi, pe toate repo-urile.

**Extensie (dacă ai terminat):** pornește **doi** subagenți în paralel pe două module independente și vezi sinteza. Sau: ia un subagent care întoarce prea mult și strânge-i corpul până întoarce un rezumat curat — simte diferența în `/context`.

### Artefact al sesiunii

Un artefact real, comis — nu notițe:
- Cel puțin un subagent funcțional în `.claude/agents/` pe repo-ul LMS, cu `description` care declanșează delegarea corect și cu **dovada** că păstrează contextul principal curat (un rezumat întors, nu un dump).

### Schimb de practici (15–20 min)

Fiecare, ~2 min:
- Subagentul făcut, din ce sarcină repetată a venit, ce unelte i-a dat și de ce (read-only?).
- Un moment „aici s-a văzut diferența" — fie delegarea (a fost chemat pe sarcina corectă), fie economia de context (cât a rămas curat contextul principal).

Se notează în docul „AI Wins & Fails", coloana „Candidat standard?" — de-aici alegeți, în Faza 3, ce subagenți intră în setul de referință al echipei.

---

### Capcane comune (note pentru facilitator)

- **Subagent pentru un task de dialog.** Cea mai frecventă greșeală a zilei. Cineva delegă ceva ce are nevoie de iterații și context din conversație, și subagentul „nu știe ce voiam". Nu știe: a pornit gol. Testul: *poți descrie rezumatul pe care-l vrei? Dacă nu, e task de conversație principală.*
- **Subagent care întoarce un dump.** Anulează exact economia de context — cele 500 de linii reintră la tine. Corpul trebuie să ceară explicit un **rezumat**.
- **Subagent cu scriere când read-only ajungea.** Un cercetător n-are ce căuta cu Write/Edit. Read-only by default; scriere doar când vrei conștient un muncitor autonom. Leagă de firul de siguranță din S1.
- **`description` vag.** Ca la skills: un `description` slab = subagent care nu e delegat când trebuie. Cazul principal și cuvintele naturale, în față.
- **Reinventezi `Explore`.** Înainte să scrii un subagent de cercetare, verifică dacă built-in-ul `Explore` nu face deja treaba. Nu construi ce ai în cutie.
- **Uiți că subagentul pornește gol.** `Explore`/`Plan` sar peste `CLAUDE.md`. Dacă o regulă chiar trebuie să ajungă acolo, repet-o în delegare.
- **Mulți subagenți „ca să fie".** Zece subagenți paraleli care întorc fiecare un dump = context mai plin decât dacă făceai totul în principal. Paralelism doar când chiar sunt investigații independente și fiecare întoarce un rezumat.

### Întrebări avansate — note pentru facilitator (opțional, NU e în cele 6 segmente)

Grupul e senior; pot apărea întrebări dincolo de cele două câmpuri obligatorii. Astea sunt răspunsuri scurte, verificate pe docul oficial (iulie 2026). **Nu le preda proactiv** — protejează segmentele 3 și 6. Sunt pentru „dacă cineva întreabă", și marchează că unealta e mai adâncă decât ce am predat.

**Câmpuri de frontmatter dincolo de `name`/`description`/`tools`/`model`:**
- **`disallowedTools`** — denylist; scoate unelte dintr-un set moștenit. Acceptă și pattern-uri MCP (`mcp__github`, `mcp__*`). Dacă pui și `tools`, și `disallowedTools`, întâi se aplică denylist-ul, apoi allowlist-ul pe ce a rămas.
- **`skills`** — preîncarcă *conținutul complet* al unor skills în contextul subagentului la pornire (nu doar `description`-ul). E inversul lui `context: fork` din S3: acolo skill-ul alegea agentul; aici agentul alege skill-urile.
- **`memory: user|project|local`** — dă subagentului un director de memorie persistentă între conversații (ex. un `code-reviewer` care reține tiparele recurente). `project` = recomandarea implicită (shareable via git).
- **`permissionMode`** — `default`/`acceptEdits`/`plan`/`dontAsk`/`bypassPermissions`. Atenție: un părinte pe `bypassPermissions` sau `acceptEdits` are prioritate și nu poate fi suprascris de subagent.
- **`isolation: worktree`** — rulează subagentul într-un git worktree temporar (copie izolată a repo-ului); se curăță singur dacă nu face modificări. Util când mai mulți subagenți scriu în paralel fără să se calce.
- **`hooks`** — hook-uri scoped pe subagent. Fitil direct spre S5: un hook `Stop` în frontmatter-ul unui subagent devine automat `SubagentStop`.

**Invocare explicită (când delegarea automată nu ajunge):**
- **Limbaj natural** — numești subagentul în prompt („folosește `codebase-explorer` să…"); Claude decide dacă deleagă.
- **@-mention** (`@nume`) — *garantează* că acel subagent rulează pentru task-ul respectiv.
- **`--agent <nume>`** (sau setarea `agent` în `.claude/settings.json`) — toată sesiunea rulează pe system-promptul acelui subagent, ca `--system-prompt`.

**Alte fapte utile:**
- **Thoroughness la `Explore`** — când îl cheamă, Claude alege un nivel: `quick` / `medium` / `very thorough`.
- **Reluare** — un subagent `general-purpose` sau custom poate fi *reluat* (păstrează tot istoricul, via `SendMessage`). `Explore`/`Plan` sunt one-shot: nu se pot relua.
- **Subagenți nested** — un subagent poate porni la rândul lui subagenți (până la o adâncime fixă); doar rezumatul de la vârf ajunge la tine.
- **Limita de sesiune** — implicit max 200 subagenți per sesiune (`CLAUDE_CODE_MAX_SUBAGENTS_PER_SESSION` ridică plafonul).
- **Scanare de securitate (leagă de S1/S9)** — Claude Code scanează raportul fiecărui subagent înainte ca agentul principal să-l citească: un subagent poate fi citit conținut ostil (pagini web, output de comenzi), iar un rezultat care imită `<system-reminder>` sau menționează `bypassPermissions` e marcat. Nu înlocuiește restrângerea uneltelor — e defense-in-depth.
- **`--agents` (CLI)** — poți defini subagenți ad-hoc, doar pentru o sesiune, ca JSON la lansare. Util pentru testare rapidă, fără fișier pe disc.
- **Agent teams** — pentru paralelism *susținut la scară*, unde fiecare worker are contextul lui: e altă unealtă (`agent teams`), nu subagenți. Menționată deja în segmentul 5 ca „altă zi".

---

### Prep pentru S5

Temă de 5 minute: fiecare notează **o regulă pe care ar vrea ca Claude s-o respecte mereu, dar pe care uneori o ratează**. Candidați din munca voastră reală: „formatează după fiecare edit", „nu comite niciodată un connection string sau un CNP", „nu atinge stored procs în prod", „rulează testele înainte de commit". Ai văzut fitilul azi: `SubagentStop` din segmentul 5 e un eveniment pe care un **hook** îl poate prinde. Până acum, tot ce ai construit (fapte, proceduri, subagenți) depinde de *decizia* modelului să le urmeze. În S5: hook-uri — scripturi care rulează **determinist**, la evenimente din ciclul de viață. Cod, nu speranță.
