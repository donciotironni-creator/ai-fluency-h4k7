# Claude Code Fluency — Ghid de facilitare · S6

*Publicul: echipă senior SQL, cu fundamentele AI deja acoperite, în tranziție spre full-stack. Formatul de joi: tutorial → lucru aplicat → schimb de practici.*

> **Notă:** Claude Code publică des. Numele comenzilor, flag-urile și transporturile se pot schimba de la o lună la alta. La începutul fiecărei sesiuni rulează `/help` și verifică docul oficial (`code.claude.com/docs/en/mcp`). Acest ghid predă principii care rezistă, nu sintaxă care se schimbă săptămânal. **Verificat pe docurile oficiale în iulie 2026** — de reținut ca fiind curente: (1) transportul **SSE e deprecat**; pentru servere remote se folosește **HTTP** (în JSON: `http`, alias `streamable-http`); (2) scope-urile sunt **`local` (default) / `project` / `user`**, iar **doar `project` scrie `.mcp.json`**; (3) **tool search e activ by default** — uneltele MCP nu se încarcă în context la pornire, ci sunt descoperite la nevoie, deci un server în plus costă aproape nimic în context până e chiar folosit. Comenzile de install pentru cele trei servere (Atlassian, Playwright, tempo-mcp) sunt verificate la sursă în iulie 2026 — reverifică-le înainte de sesiune, se pot schimba.

---

## S6 — MCP: Claude Code vorbește cu lumea din afara repo-ului

A treia sesiune din **Faza 2 — Extensii proprii**. Până acum ai construit componente care schimbă cum lucrează Claude **în interiorul** uneltei: fapte în `CLAUDE.md` (S2), proceduri în skills (S3), muncă izolată în subagenți (S4), garanții deterministe în hooks (S5). Toate operează cu uneltele proprii ale Claude Code — `Read`, `Grep`, `Bash`, `Edit`. Azi deschizi ușa spre exterior: **MCP** îi dă unelte noi, care ajung la sisteme reale.

**Forma sesiunii de azi e un tur de unelte concrete, nu o expunere abstractă.** Instalăm patru servere, live, în ordine crescătoare de implicare:

1. **Jira MCP** — remote, oficial, cu OAuth. „Cloud partajat, îl conectez, nu-l scriu."
2. **Playwright MCP** — local, stdio, zero cont. „Browser pentru o echipă care se mută spre full-stack."
3. **tempo-mcp** — server custom, scris de noi, clonat din git. „Am scris un server, îl dau echipei."
4. **Serverul tău** — un MCP de SQL, construit în sesiune. „Îl scriu eu, de la zero."

Fiecare pas adaugă exact o idee nouă peste anteriorul: Jira = remote+OAuth; Playwright = stdio+de ce; tempo = custom+distribuție prin git; serverul tău = anatomia internă. La final fiecare are patru servere conectate și unul propriu.

### Legătura cu S5 — de la „ce face Claude" la „la ce ajunge Claude"

Până acum ai controlat **comportamentul**: ce știe (S2), ce proceduri urmează (S3), unde face munca grea (S4), ce se întâmplă determinist (S5). MCP schimbă altceva: **suprafața de acțiune**. Un server MCP e un proces separat care expune Claude-ului unelte noi, prin protocol — nu prin `Bash`, nu prin copy-paste din alt tool.

Semnalul practic că ai nevoie de MCP e mereu același: **te prinzi copiind date dintr-un alt sistem în chat**. Un rând de query rulat manual în SSMS și lipit în conversație, un ticket din Jira parafrazat, un log copiat dintr-un dashboard. Fiecare copy-paste e un tool care lipsește.

Un singur criteriu ține sesiunea:

- **Claude trebuie să *raționeze iterativ* pe un sistem viu** → server MCP. Interoghează, se uită la rezultat, întreabă altceva, corelează. Are nevoie de acces, nu de un output.
- **E o operație one-shot, cu output previzibil** → un script sau o comandă CLI, chemată cu `Bash` (sau împachetată într-un skill, ca în S3). Nu-ți trebuie protocol pentru un `sqlcmd`.

### Obiective de învățare

La final, fiecare știe:
- Ce e MCP, concret: un **protocol deschis** client-server. Claude Code e clientul; un **server MCP** e un proces (local sau remote) care expune unelte, resurse și prompturi.
- Ce expune un server, **dincolo de tools**: **resources** (referențiate cu `@server:protocol://cale`, ca fișierele) și **prompts** (apar ca `/mcp__server__prompt`).
- Cele **două transporturi** care contează azi, văzute pe viu: `http` (remote, OAuth — Jira) și `stdio` (proces local — Playwright, tempo, serverul propriu). Plus `sse` (**deprecat**) și `ws`, ca să le recunoască.
- Cum instalezi un server **remote cu OAuth** (Jira), unul **stdio dintr-un pachet npm** (Playwright), și unul **custom clonat din git** (tempo) — și de ce `--` e obligatoriu la stdio.
- Cele **trei scope-uri** și ce fișier scrie fiecare: `local` → `~/.claude.json`, `project` → **`.mcp.json` comis în repo**, `user` → `~/.claude.json`.
- Cum **verifici** că merge: `claude mcp list`, `claude mcp get`, `/mcp`.
- Cum **restrângi perimetrul**: reguli de permisiuni pe `mcp__server__tool`, token read-only, și de ce „serverul poate face X" nu înseamnă „Claude are voie să facă X".
- Cum **scrii un server MCP propriu**, minimal, pe `stdio`, care expune un tool intern al echipei.

> **Notă de scop pentru facilitator:** miezul de azi e **turul de unelte** (segmentele 3–5) plus **serverul propriu** (segmentul 7). Conceptul care oprește derapajul (MCP vs. script) stă în segmentul 1 și se reia în capcane. Dacă timpul strânge, comprimă segmentul 4 (Playwright devine un demo de 8 minute) și segmentul 7 (serverul propriu devine demo, scrisul rămâne temă). **Protejează segmentele 2, 3 și 5** — anatomia + Jira (primul OAuth) + tempo (primul server custom, momentul cross-tool). Capcana clasică a zilei rămâne: oamenii vor un server pentru fiecare idee și ajung cu șase servere pornite din care folosesc unul.

### Structura zilei

| Bloc | Durată |
|------|--------|
| Tutorial | 95–120 min |
| Lucru aplicat | 70–85 min |
| Schimb de practici | 15–20 min |

---

### Tutorial (95–120 min)

Șapte segmente. Primele două așază conceptul și mecanica; 3–5 sunt turul de unelte; 6 e costul și perimetrul; 7 e serverul propriu.

#### 1. De ce MCP — și când NU (10–15 min)

- **Simptomul care se vede:** te prinzi copiind date în chat. Rulezi un `SELECT` în SSMS și lipești rezultatul. Deschizi un ticket Jira, îl parafrazezi. De fiecare dată **tu** ești transportul dintre Claude și sistem.
- **Ce schimbă MCP:** Claude primește unelte noi, care vorbesc direct cu sistemul. Nu mai lipești rezultate — ceri ce vrei să afli, iar Claude iterează singur.
- **De ce nu e „doar un wrapper peste Bash":** un server MCP întoarce **date structurate** cu **schemă de unealtă**, nu text pe stdout care trebuie ghicit. Și, spre deosebire de un script, se partajează ca **configurație**.
- **Criteriul, pus din prima ca să nu apară derapajul:** merită un server MCP când poți numi **întrebările** pe care Claude le va pune sistemului. Dacă poți numi doar **comanda** pe care ai rula-o tu — e script, și `Bash` îl face deja. Ține-l pe tablă toată ziua; la fiecare server din tur, întreabă grupul „e MCP sau ar fi fost script?".

**Demo:** pornește de la eșec. Cere-i lui Claude, fără niciun server conectat: „ce tickete deschise am eu în Jira?" Arată ce face — spune onest că nu ajunge la Jira, sau ghicește. Ăsta e golul pe care-l umple segmentul 3.

> **Firul S4, dus mai departe:** economia de context nu dispare cu MCP — se mută. Tool search e activ by default, deci uneltele unui server nu intră în context la pornire; Claude le caută când are nevoie. Fixează asta acum, ca să nu apară frica de „patru servere = context plin". Costul real nu e definiția uneltei, e **output-ul** ei — segmentul 6.

#### 2. Cum funcționează: anatomie, transport, scope (20–25 min)

Segmentul de mecanică. E cel pe care se sprijină tot turul; fă-l încet, o dată, ca să nu-l repeți la fiecare server.

**Ce expune un server MCP** — nu doar tools:

| Ce expune | Cum îl folosești | Exemplu |
|-----------|------------------|---------|
| **Tools** | Claude le cheamă singur | `searchJiraIssuesUsingJql`, `tempo_worklog_create` |
| **Resources** | tu le referențiezi cu `@`: `@server:protocol://cale` | `@github:issue://123` |
| **Prompts** | apar ca slash commands: `/mcp__server__prompt` | `/mcp__jira__create_issue "Bug" high` |

- **Resources** se completează cu `@`, apar în autocomplete lângă fișiere — puntea spre S3: un server bun îți dă și *context* la cerere, nu doar acțiuni.
- **Prompts** sunt slash commands venite de la server, exact forma din S3, definite în altă parte.

**Transporturile** — azi vezi două pe viu:

| Transport | Ce e | Unde azi |
|-----------|------|----------|
| `stdio` | proces local, pe stdin/stdout | Playwright, tempo, serverul tău. **Default pentru ce rulezi local.** |
| `http` | server remote (JSON: `http`, alias `streamable-http`) | Jira. **Singurul cu OAuth.** |
| `sse` | **deprecat** | doar dacă serviciul n-are altceva |
| `ws` | bidirecțional, servere care împing evenimente | doar prin JSON, autentificare doar prin header |

> ⚠️ **Corecție față de intuiția comună:** „SSE = pentru echipă" e greșit pe două planuri. SSE e deprecat, și **partajarea nu e o proprietate a transportului** — e a **scope-ului**. Un server `stdio` pus în `.mcp.json` e partajat cu echipa; un server `http` în scope `local` nu e partajat cu nimeni.

**Cele trei scope-uri** — tabelul care rămâne pe tablă:

| Scope | Se încarcă în | Partajat cu echipa | Scris în |
|-------|---------------|--------------------|----------|
| `local` (**default**) | doar proiectul curent | nu | `~/.claude.json` |
| `project` | doar proiectul curent | **da, prin git** | **`.mcp.json`** în rădăcina repo-ului |
| `user` | toate proiectele tale | nu | `~/.claude.json` |

- **Default-ul e `local`.** Dacă nu pui `--scope`, serverul e al tău, doar aici. Azi instalăm în `local` pe parcursul turului, și comităm în `.mcp.json` (`project`) abia la lucrul aplicat.
- **`project` e singurul care produce fișier de comis**, cu expansiune `${VAR}` / `${VAR:-default}` în `command`, `args`, `env`, `url`, `headers`. Mecanismul care face fișierul comisibil: token-ul diferă de la om la om.
- **Precedență:** `local` > `project` > `user` > plugin > conectori claude.ai. Se ia **întreaga** definiție din sursa câștigătoare — câmpurile nu se combină.

**Verificarea, trei comenzi:**

```bash
claude mcp list    # status: ✔ Connected / ! Needs authentication / ✘ Failed / ⏸ Pending
claude mcp get <nume>
claude mcp remove <nume>
```

Plus `/mcp` în sesiune: status, **numărul de tool-uri**, autentificare, toggle care dezactivează fără să pierzi configurația.

**Demo:** deschide `/mcp` cu ce ai deja conectat (`sql-recon` e un exemplu bun — server SQL matur). Arată lista, statusul, numărul de tool-uri, meniul unui server. Tastează `@` și arată resources; `/` și arată prompturile `mcp__...`.

#### 3. Jira MCP — remote, HTTP, OAuth (15–18 min)

Primul server din tur. Ideea nouă: **remote + autentificare OAuth**, adăugat **fără credențiale**.

```bash
claude mcp add --transport http atlassian https://mcp.atlassian.com/v1/mcp/authv2
```

- **Nu-i dai token la adăugare.** `claude mcp add` scrie configurația și confirmă — nu validează nimic.
- La prima folosire: `/mcp` → **sign-in în browser** (OAuth 2.1). Din shell: `claude mcp login atlassian` / `claude mcp logout atlassian`. Token-urile se stochează și se reîmprospătează singure.
- `claude mcp list` arată `! Needs authentication` până te loghezi, apoi `✔ Connected`. OAuth merge pe HTTP — de-aia e HTTP, nu stdio.

**Demo** — pune-l să lucreze, nu doar să se conecteze:
- „Ce tickete deschise am eu în sprintul curent?" (JQL sub capotă)
- „Rezumă-mi ticketul DC-142 și subtask-urile."
- **„Care e accountId-ul meu Jira?"** — cere-le tuturor să-l rețină. E cheia pentru tempo (segmentul 5): pontajul are nevoie de `accountId`, nu de email.

> Verifică endpointul înainte de sesiune — Atlassian a pornit istoric pe SSE și a migrat pe HTTP; forma de mai sus e cea curentă (iulie 2026), dar reconfirmă pe pagina lor oficială de Remote MCP Server.

#### 4. Playwright MCP — de ce, pentru o echipă SQL (12–15 min)

Al doilea server. Ideea nouă: **stdio dintr-un pachet npm, zero cont** — și un „de ce" care contează pentru publicul ăsta.

**De ce Playwright, pentru noi:** suntem în tranziție spre full-stack (Vue + .NET). La SQL vezi **datele**; cu Playwright vezi **ce vede utilizatorul** din aceleași date.
- Verifici că o schimbare în DB **ajunge în UI** — clic prin app, nu doar `SELECT`.
- Reproduci un bug raportat în **aplicație**, nu în query.
- Generezi teste E2E din „mergi pe pagina asta și verifică".

Lucrează pe **accessibility tree** (structură), nu pe screenshot-uri — structurat, ieftin, determinist. Exact tema MCP: date structurate, nu pixeli de ghicit.

```bash
claude mcp add playwright npx @playwright/mcp@latest
```

- `stdio`, local. `npx` trage pachetul `@playwright/mcp` la prima pornire; primul apel poate descărca browserul — răbdare.
- Reflexul cu `--` rămâne bun când un server are flag-uri proprii: `claude mcp add playwright -- npx @playwright/mcp@latest`. Aici `npx` n-are conflict, dar arată-le forma sigură.

**Demo:** „Deschide `localhost:5173`, mergi la lista de concedii, verifică că apare rândul pe care tocmai l-am modificat." Închide cu „generează-mi un test Playwright pentru fluxul ăsta". Puntea: la SQL confirmi cu un `SELECT`; aici, cu ochii aplicației.

#### 5. tempo-mcp — un server custom, clonat din git (18–22 min)

Al treilea server, și miezul practic al zilei. Ideea nouă: **un server pe care l-am scris noi, distribuit ca repo**. E prima dată când nu conectezi ceva de-a gata, ci **construiești un artefact local** dintr-un cod sursă.

**Ce e:** server MCP pentru Tempo REST API v4 — pontaj, plans, teams, accounts. ~81 de tool-uri. Node, stdio.
Repo public: `https://github.com/donciotironni-creator/tempo-mcp`

```bash
git clone https://github.com/donciotironni-creator/tempo-mcp
cd tempo-mcp
npm install
npm run build
```

Token: **Tempo → Settings → Data Access → API integration → Generate token.** Apoi:

```bash
claude mcp add \
  --env TEMPO_TOKEN=<token> \
  --env TEMPO_BASE_URL=https://api.eu.tempo.io \
  --transport stdio tempo -- node C:/cale/tempo-mcp/dist/index.js
```

- **`--` obligatoriu la stdio** — separă flag-urile Claude Code de comanda serverului. Fără el, comanda cade.
- **Nu pune numele serverului (`tempo`) imediat după `--env`** — e citit ca încă un `KEY=value`. Pune `--transport` între ele, ca mai sus.
- EU: `api.eu.tempo.io`. US: `api.tempo.io`. Alternativ, blocul `mcpServers` din README, direct în `~/.claude/settings.json`.

**Momentul cross-tool — nu-l rata, e cel mai bun al zilei.** Pontarea cere `authorAccountId`, care e Jira account ID, nu email:

1. Jira MCP (segmentul 3): „care e accountId-ul meu?"
2. tempo MCP: „loghează 1h pe DC-142, azi, descrierea «review PR»."

```
tempo_worklog_create({ authorAccountId, issueId, startDate, timeSpentSeconds: 3600 })
```

Aici se vede de ce ai un **ecosistem**, nu un tool izolat: un server furnizează inputul altuia, iar Claude leagă cele două fără copy-paste. Valori de timp: 30 min = `1800`, 1h = `3600`, 2h = `7200`, 8h = `28800`.

> **Fitilul spre S7:** tempo-mcp l-ai dat azi ca **repo de clonat**. Fiecare a făcut build, a lipit un token, a scris o cale absolută proprie. Trei oameni, trei configurări divergente. Ăsta e exact simptomul pe care-l rezolvă un **plugin** (S7) — reține-l, nu-l desface azi.

#### 6. Costul real și perimetrul (15–18 min)

Firul de siguranță din S1, aplicat pe cele patru servere conectate.

**Costul — contextul:**
- Tool search e activ by default, deci definițiile de unelte sunt amânate — patru servere nu-ți umplu contextul. Ce-l umple e **output-ul**. Claude Code avertizează peste **10.000 de tokens** și taie la **25.000** implicit (`MAX_MCP_OUTPUT_TOKENS` ridică plafonul). Un `SELECT *` pe o tabelă mare, sau un `tempo_worklog_list` pe tot anul, e exact greșeala. Legătura cu S4: rezumate, nu dump-uri.

**Costul — procesele:**
- Patru servere = patru procese care pot să nu pornească, să atârne, să pice. `claude mcp list` îți arată care. `MCP_TIMEOUT` la pornire; `timeout` per server (ms) per apel. Un apel din conversația principală peste 2 minute trece automat în background — `/tasks`.
- `alwaysLoad: true` încarcă uneltele în față, ocolind tool search. Bun pentru 2–3 unelte; scump pe tot.

**Perimetrul — două straturi.** „Serverul poate face X" **≠** „Claude are voie să facă X".
- **Stratul 1 — ce poate serverul:** un **token read-only** (Tempo, Jira) sau un **user de bază de date read-only** e cea mai eficientă graniță. Citește lista de tool-uri **înainte** să conectezi: tempo expune `..._delete`, unele servere SQL expun `execute_sql` care acceptă `DROP`.
- **Stratul 2 — ce are voie Claude:** reguli de permisiuni în `settings.json` (S1), comise în repo:

| Regulă | Ce prinde |
|--------|-----------|
| `mcp__tempo` | orice unealtă a serverului |
| `mcp__tempo__*` | la fel, wildcard explicit |
| `mcp__tempo__tempo_worklog_list` | exact acea unealtă |
| `mcp__*` (**doar în `deny`**) | toate uneltele MCP |

- În `allow`, wildcard-ul merge **doar după prefixul literal `mcp__<server>__`**. Un `allow` neancorat (`"*"`, `"mcp__*"`) e ignorat cu warning. În `deny`, `mcp__*` e valid și taie tot.
- Tiparul pe tempo/Jira: `allow` pe citire (`_list`, `_get`, `_search`), `ask`/`deny` pe `_create` / `_update` / `_delete`.

> **Fitilul pentru S9 (îl numim, nu-l desfacem):** un server MCP citește conținut pe care nu l-ai scris tu — descrieri de tickete Jira, pagini web prin Playwright, rânduri din bază. Conținutul ăla ajunge în context și **poate conține instrucțiuni** → prompt injection. A doua față: date care **ies** — Jira și tempo sunt remote, văd ce le trimiți. Ambele în S9. Azi: **verifică în cine te încrezi înainte să conectezi**, și restrânge de la început.

**Demo:** adaugă o regulă care lasă `mcp__tempo__tempo_worklog_list` pe `allow` și pune `mcp__tempo__tempo_worklog_delete` pe `deny`. Cere-i lui Claude să șteargă un worklog și arată refuzul. Punctează: serverul putea, Claude n-a avut voie.

#### 7. Serverul tău MCP, stdio minimal — și cum verifici (20–25 min)

Ținta finală: cine ajunge aici pleacă cu un **server propriu**, care expune un tool intern. Îl facem pe SQL, dar deliberat **mic**.

**Ce NU construim:** un clone de `sql-recon`. Ai deja un MCP de SQL matur conectat (`search_objects`, `describe_object`, lineage) — un mini-clone n-are rost. Construim ceva mic și al echipei, care predă mecanica. Trei idei, alege una:

| Idee | Ce face | De ce bună la demo |
|------|---------|--------------------|
| **`tsql-snippets`** ⭐ | `get_snippet(pattern)` → patternul binecuvântat (MERGE upsert, paging `OFFSET/FETCH`, `TRY/CATCH`) | pură logică, zero I/O — demo curat, deterministic |
| `proc-catalog` | `find_proc(keyword)` scanează un folder de `.sql`, întoarce fișier + semnătură | atinge filesystem, utilitate reală |
| `sql-standards` | `validate_object_name(name, type)` → verifică `usp_`, `vw_`, `fn_` | arată direct de ce contează descrierea uneltei |

**Exemplul lucrat — `tsql-snippets`, Node:**

```bash
npm install @modelcontextprotocol/server zod
```

```javascript
import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { z } from "zod";

const SNIPPETS = {
  upsert: "MERGE INTO ... USING ... WHEN MATCHED THEN UPDATE ... WHEN NOT MATCHED THEN INSERT ...;",
  paging: "... ORDER BY id OFFSET @skip ROWS FETCH NEXT @take ROWS ONLY;",
  trycatch: "BEGIN TRY ... END TRY BEGIN CATCH ...; THROW; END CATCH",
};

const server = new McpServer({ name: "tsql-snippets", version: "1.0.0" });

server.registerTool(
  "get_snippet",
  {
    description: "Întoarce patternul T-SQL binecuvântat al echipei pentru un caz dat.",
    inputSchema: z.object({ pattern: z.enum(["upsert", "paging", "trycatch"]) }),
  },
  async ({ pattern }) => ({ content: [{ type: "text", text: SNIPPETS[pattern] }] }),
);

await server.connect(new StdioServerTransport());
```

> **Atenție la numele pachetului:** e `@modelcontextprotocol/server`. Tutorialele vechi spun `@modelcontextprotocol/sdk` — dacă cineva copiază de acolo, instalează altceva.

**Python**, dacă preferă cineva: `uv add "mcp[cli]"`, un `@mcp.tool()` pe o funcție cu docstring (docstring-ul **e** descrierea uneltei), `mcp.run(transport="stdio")`.

**Nu-l scriem manual** — îi cerem lui Claude, ca orice altă sarcină, și **citim fișierul înainte de accept** (regula S1–S5). Alternativ, plugin oficial de scaffolding: `/plugin install mcp-server-dev@claude-plugins-official`, apoi `/mcp-server-dev:build-mcp-server`.

**Conectarea și verificarea, trei pași:**

```bash
claude mcp add --transport stdio tsql-snippets -- node C:/cale/server.js
claude mcp list    # ✔ Connected?
```
apoi `/mcp` → serverul apare cu numărul corect de tool-uri, și în final **întrebarea reală**: „dă-mi patternul de upsert al echipei" — și verifici că a fost chemată unealta.

**Dovada care contează, în ordine:**
1. **Se conectează?** `claude mcp list` → `✔ Connected`. La stdio, cauza tipică e comanda greșită sau o cale relativă.
2. **Uneltele se văd?** `/mcp` → numărul de tool-uri. Zero la un server conectat = rulează, dar nu declară nimic.
3. **Claude o cheamă pe cea potrivită?** Dacă nu → aceeași lecție ca la skills (S3) și subagenți (S4): problema e **descrierea** uneltei, nu implementarea. Descrierile se taie la 2KB — ce e important, la început.

**Demo:** cere-i lui Claude serverul `tsql-snippets`, citește fișierul cu grupul, conectează-l, arată cei trei pași. Dacă rămâne timp: schimbă descrierea uneltei în ceva vag și arată cum Claude nu o mai cheamă.

---

### Lucru aplicat (70–85 min)

**Brief:** fiecare iese cu **patru servere conectate** (Jira, Playwright, tempo, plus serverul propriu) și cu **o configurație comisă în `.mcp.json`** — plus regulile de permisiuni care îi restrâng perimetrul.

1. **Jira** — adaugă serverul, autentifică-te în browser, pune-i trei întrebări reale. **Reține-ți `accountId`-ul.**
2. **Playwright** — adaugă-l, pune-l să navigheze o pagină reală și să verifice ceva vizibil în UI.
3. **tempo-mcp** — clonează repo-ul, `npm install` + `npm run build`, generează token, conectează pe stdio. **Loghează o oră reală**, folosind accountId-ul din pasul 1.
4. **Restrânge perimetrul** — permisiuni pe `mcp__tempo__*` / `mcp__atlassian__*`: citirea permisă, `_create`/`_update`/`_delete` pe `ask` sau `deny`. Verifică că regula chiar prinde.
5. **Serverul tău** (capstone) — `tsql-snippets` (sau `proc-catalog` / `sql-standards`), stdio minimal, conectat și verificat pe cei trei pași.
6. **De la tine la echipă** — mută configurația în `.mcp.json`, scope `project`, cu token-ul ca `${TEMPO_TOKEN}` și calea ca `${TEMPO_MCP_DIR}`, și **comite-l**.

**Extensie (dacă ai terminat):** adaugă `alwaysLoad: true` pe un server și vezi diferența în `/context`. Sau: leagă Jira → Playwright — „deschide în browser ticketul pe care Jira mi-l dă ca fiind blocat".

### Artefact al sesiunii

Un artefact real, comis — nu notițe:
- **`.mcp.json` comis** în repo, cu cel puțin serverul tempo și serverul propriu, token-uri ca `${VAR}`, plus regulile de permisiuni. Oricine clonează repo-ul primește aceeași configurație, fără instrucțiuni de setup (mai puțin token-ul lui personal și build-ul local al tempo — exact tensiunea care duce spre S7).

### Schimb de practici (15–20 min)

Fiecare, ~2 min:
- Care server i-a fost cel mai util și de ce **acela**. Ce triaj a făcut: ce a rămas MCP și ce s-ar fi rezolvat cu un script.
- Un moment „aici s-a văzut diferența" — momentul cross-tool Jira→tempo, un UI verificat cu Playwright, sau un perimetru restrâns conștient.

Se notează în docul „AI Wins & Fails", coloana „Candidat standard?" — de-aici alegeți, în Faza 3, ce servere intră în setul de referință al echipei. Fitilul spre S7: tempo l-ați configurat în trei feluri; aia e exact problema pe care o rezolvă un **plugin**.

---

### Capcane comune (note pentru facilitator)

- **Un server MCP pentru fiecare idee.** Capcana zilei. Testul: *poți numi întrebările pe care Claude le-ar pune sistemului? Dacă poți numi doar comanda, e script.*
- **`--` uitat la stdio** (tempo, Playwright, serverul propriu). Cea mai frecventă eroare de sintaxă. Dacă un `claude mcp add` cade cu „unknown option", verifică `--` întâi.
- **Numele serverului imediat după `--env`** (la tempo, cu două `--env`-uri). CLI-ul îl citește ca `KEY=value` și îl respinge. Pune `--transport` între ele.
- **Jira „nu merge" imediat după add.** Normal: apare `! Needs authentication`. Trebuie `/mcp` → sign-in. `add` nu autentifică.
- **`npm run build` sărit la tempo.** `node dist/index.js` cade cu „cannot find module" dacă n-ai buildat. Ordinea: clone → install → build → add.
- **Token tempo hardcodat în `.mcp.json`.** Fișierul se comite. Token-ul în `${TEMPO_TOKEN}`, calea în `${TEMPO_MCP_DIR}`.
- **Scope greșit.** Cineva adaugă în `local` (default!) și se miră că nu e în repo. Întrebarea de control: *vreau să-l aibă echipa? → `project`. Toate proiectele mele? → `user`. Doar aici, doar eu? → `local`.*
- **Output nefiltrat.** `SELECT *`, sau `tempo_worklog_list` pe tot anul → avertisment de output, context plin. „Numără / rezumă, nu lista tot."
- **„Serverul poate, deci Claude are voie."** Confuzia dintre cele două straturi. Un `..._delete` expus nu e aprobat — permisiunile sunt separate, și se comit.
- **Wildcard neancorat în `allow`.** `"mcp__*"` în `allow` e ignorat cu warning. Merge doar în `deny`.
- **Server conectat, zero tool-uri** (la serverul propriu). Se vede în `/mcp`. Rulează dar nu declară nimic — eroare în înregistrarea uneltei, nu în transport.
- **Încredere oarbă în server străin.** Un server MCP rulează cu privilegiile tale și citește conținut pe care nu-l controlezi. Verifică sursa înainte să conectezi — inclusiv tempo-mcp, deși e al nostru: citește codul, e public exact ca să poată fi citit.

### Întrebări avansate — note pentru facilitator (opțional, NU e în cele 7 segmente)

Grupul e senior; pot apărea întrebări dincolo de instalare și scope. Răspunsuri scurte, verificate pe docul oficial (iulie 2026). **Nu le preda proactiv** — protejează turul de unelte.

- **`claude mcp add-json <nume> '<json>'`** — server direct din JSON, util când copiezi configurația din documentația unui serviciu. Singura cale pentru `ws`.
- **`claude mcp add-from-claude-desktop`** — importă serverele din Claude Desktop (macOS, WSL). La `claude mcp` numele acceptă doar litere, cifre, `-`, `_`.
- **`claude mcp serve`** — pornește **Claude Code însuși** ca server MCP pe stdio. Nu tipărește nimic; terminal blocat și silențios = merge.
- **Nume rezervate** — `workspace`, `claude-in-chrome`, `computer-use`, `Claude Preview`, `Claude Browser`. `add` respinge un nume rezervat.
- **`headersHelper`** — comandă care generează headerele la conectare, pentru autentificare non-OAuth (Kerberos, SSO intern, token-uri scurte). JSON pe stdout, timeout 10s. **Execută shell arbitrar** → la scope de proiect rulează doar după dialogul de încredere.
- **`oauth.scopes`** — fixează scope-urile OAuth cerute (listă separată prin spații). Adiacent: `oauth.callbackPort`, `--client-id`, `--client-secret`, `authServerMetadataUrl`.
- **`ENABLE_TOOL_SEARCH`** — `true` (default) / `auto` / `auto:N` / `false`. `alwaysLoad: true` per server ocolește amânarea și blochează pornirea până se conectează (plafon 5s).
- **Reconectare** — HTTP și SSE se reconectează singure, backoff exponențial, până la 5 încercări. `stdio` **nu** se reconectează: procese locale.
- **Elicitation** — un server poate cere input structurat în mijlocul unui task (formular sau URL de aprobare); dialogul apare automat. Se poate auto-răspunde cu un hook `Elicitation` (fitil S5).
- **`list_changed`** — un server poate anunța dinamic că și-a schimbat uneltele/resursele/prompturile; Claude Code reîmprospătează fără reconectare.
- **Conectori claude.ai** — dacă ești logat cu cont claude.ai, apar automat în `/mcp`. Nu se încarcă pe `ANTHROPIC_API_KEY` sau alt provider. `disableClaudeAiConnectors: true` îi taie.
- **Servere din plugin-uri (fitil S7)** — numele uneltelor e `mcp__plugin_<plugin>_<server>__<tool>`; o regulă scrisă pe cheia scurtă **nu** prinde.
- **`roots/list`** — un server care vrea să-și limiteze singur accesul la disc implementează `roots/list`; Claude Code răspunde cu directorul sesiunii plus fiecare `--add-dir`.
- **Configurație gestionată (S9/S10)** — `managed-mcp.json`, plus `allowedMcpServers` / `deniedMcpServers`.

---

### Prep pentru S7

Temă de 5 minute: fiecare notează **ce din tot ce a construit până acum ar vrea să aibă și colegul de lângă, fără să-i explice nimic**. Uită-te la ce ai în `.claude/`: un `CLAUDE.md` (S2), un skill (S3), un subagent (S4), un hook (S5), o configurație MCP (S6). Fiecare a fost partajat altfel — sau deloc. Ai văzut fitilul azi cu tempo-mcp: l-ai dat ca repo de clonat, și trei oameni l-au configurat în trei feluri — build local, token propriu, cale absolută diferită. Problema nu e serverul, e **distribuția**. În S7: **plugins** — un bundle versionat care livrează împreună skills, subagenți, comenzi, hooks și definiții MCP, instalabil cu o comandă. De la „am scris un server" la „l-am publicat".
