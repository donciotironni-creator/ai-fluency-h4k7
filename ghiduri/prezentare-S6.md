<!--
Prezentare S6 — MCP
Format slide-uri: fiecare "---" separă un slide, fiecare "##" e titlul slide-ului.
Compatibil Marp / reveal.js / pandoc→pptx. Pentru Marp, decomentează frontmatter-ul de mai jos.
-->
<!--
---
marp: true
theme: default
paginate: true
---
-->

# S6 — MCP

## Claude Code vorbește cu lumea din afara repo-ului

Faza 2 · Extensii proprii · ~3h

*Programul de joi — AI Fluency pe Claude Code*

---

## Traseul de azi

1. **Ce e MCP, cum funcționează, de ce.**
2. **Jira MCP** — un server remote, oficial, cu OAuth.
3. **Playwright MCP** — și de ce o echipă SQL vrea browser.
4. **tempo-mcp** — un server custom, scris de noi, clonat din git.
5. **Serverul tău** — construim unul, pe SQL.

> Tur de unelte reale, nu teorie. Fiecare pas se instalează live.

---

## De unde venim → unde mergem

- **S2–S5:** ai schimbat cum lucrează Claude **în interiorul** uneltei — fapte, proceduri, subagenți, hooks.
- Toate operează cu uneltele lui proprii: `Read`, `Grep`, `Bash`, `Edit`.
- **S6:** îi dai **unelte noi**, care ajung la sisteme reale — Jira, un browser, API-ul de pontaj, baza ta.

---

## Simptomul care se vede

Te prinzi **copiind date în chat**.

- Rulezi un `SELECT` în SSMS → lipești rezultatul.
- Deschizi un ticket Jira → îl parafrazezi.
- Copiezi un log dintr-un dashboard.

> De fiecare dată **tu** ești transportul dintre Claude și sistem.
> Fiecare copy-paste e un tool care lipsește.

---

## Ce e MCP, concret

Un **protocol deschis**, client–server.

- **Claude Code = clientul.**
- **Serverul MCP** = un proces (local sau remote) care expune capabilități.
- Nu e un wrapper peste `Bash`: întoarce **date structurate**, cu **schemă de unealtă**.
- Și, spre deosebire de un script, se partajează ca **configurație**, nu ca fișier de copiat.

---

## Ce expune un server — nu doar tools

| Ce | Cum îl folosești | Exemplu |
|---|---|---|
| **Tools** | Claude le cheamă singur | `searchJiraIssuesUsingJql`, `execute_sql` |
| **Resources** | tu, cu `@`: `@server:protocol://cale` | `@github:issue://123` |
| **Prompts** | slash command: `/mcp__server__prompt` | `/mcp__jira__create_issue "Bug" high` |

- **Resources** apar în autocomplete la `@`, lângă fișiere.
- **Prompts** sunt slash commands venite de la server (forma din S3, definită în altă parte).

---

## Cum funcționează — transporturile

| Transport | Când |
|---|---|
| `stdio` | proces **local** — Playwright, tempo-mcp, serverul tău. Default-ul pentru ce rulezi la tine. |
| `http` | remote **recomandat** (în JSON: `http`, alias `streamable-http`). **Singurul cu OAuth.** Jira. |
| `sse` | ⚠️ **deprecat** — doar dacă serviciul n-are altceva |
| `ws` | servere care **împing** evenimente; doar prin JSON, autentificare doar prin header |

> Azi atingem ambele care contează: `http` la Jira, `stdio` la Playwright / tempo / serverul tău.

---

## Partajarea ≠ transport

Intuiția „SSE = pentru echipă" e greșită pe două planuri:

1. **SSE e deprecat.** Pentru remote → `http`.
2. **Partajarea e o proprietate a scope-ului**, nu a transportului.

> Un server `stdio` pus în `.mcp.json` e partajat cu toată echipa.
> Un server `http` pus în scope `local` nu e partajat cu nimeni.

---

## De ce MCP — și când NU

| Ai nevoie de... | Ce faci |
|---|---|
| Claude **raționează iterativ** pe un sistem viu (interoghează, se uită, întreabă altceva) | **server MCP** |
| operație **one-shot**, output previzibil (`git log`, `dotnet test`) | **script / CLI**, prin `Bash` |

> Regula de aur: merită MCP când poți numi **întrebările** pe care Claude le va pune sistemului. Dacă poți numi doar **comanda** — e script.

---

## Cele trei scope-uri

| Scope | Se încarcă în | Partajat | Scris în |
|---|---|---|---|
| `local` (**default**) | doar proiectul curent | nu | `~/.claude.json` |
| `project` | doar proiectul curent | **da, prin git** | **`.mcp.json`** |
| `user` | toate proiectele tale | nu | `~/.claude.json` |

- Doar `project` produce un **fișier de comis**.
- Precedență: `local` > `project` > `user` > plugin > conectori claude.ai. Se ia **întreaga** definiție, nu se combină câmpuri.

---

# 1 · Jira MCP

## Un server remote, oficial, cu OAuth

---

## Jira — de ce primul

- **Remote + HTTP + OAuth** — cazul „cloud partajat". Îl adaugi **fără credențiale**, te autentifici în browser.
- E oficial (Atlassian), deci nu-l construiești tu — doar îl conectezi.
- Îl folosim ca **temelie** pentru tempo: pontajul are nevoie de `accountId`-ul tău din Jira.

---

## Jira — instalare

```bash
claude mcp add --transport http atlassian https://mcp.atlassian.com/v1/mcp/authv2
```

- Nu-i dai token la adăugare. La prima folosire: `/mcp` → **sign-in în browser** (OAuth 2.1).
- Din shell: `claude mcp login atlassian` / `claude mcp logout atlassian`.
- Token-urile se stochează și se reîmprospătează singure.

> `claude mcp list` → `! Needs authentication` până te loghezi, apoi `✔ Connected`.

---

## Jira — ce întrebi

- „Ce tickete deschise am eu în sprintul curent?"
- „Rezumă-mi ticketul DC-142 și subtask-urile lui."
- „Creează un bug: titlu, descriere, prioritate high."
- „Care e **accountId**-ul meu Jira?" ← reține răspunsul, îl folosim la tempo.

> Claude iterează: caută cu JQL, citește ticketul, corelează. Nu mai parafrazezi tu.

---

# 2 · Playwright MCP

## De ce o echipă SQL vrea un browser

---

## Playwright — de ce, pentru noi

Suntem în tranziție spre full-stack (Vue + .NET). La SQL vezi **datele**. Cu Playwright vezi **ce vede utilizatorul** din aceleași date.

- Verifici că o schimbare în DB **ajunge în UI** — clic prin app, nu doar `SELECT`.
- Reproduci un bug raportat în **aplicație**, nu în query.
- Generezi teste E2E din „mergi pe pagina asta și verifică".

> Lucrează pe **accessibility tree** (structură), nu pe screenshot-uri. Structurat, ieftin, determinist — exact tema MCP.

---

## Playwright — instalare

```bash
claude mcp add playwright npx @playwright/mcp@latest
```

- `stdio`, local. `npx` trage pachetul `@playwright/mcp` la prima pornire.
- Zero credențiale, zero cont.
- Prima rulare poate descărca browserul — răbdare la primul apel.

> Formă sigură când un server are flag-uri proprii: `claude mcp add playwright -- npx @playwright/mcp@latest`. Aici `npx` n-are conflict, dar reflexul cu `--` e bun.

---

## Playwright — demo

- „Deschide `localhost:5173`, loghează-te ca user de test, mergi la lista de concedii."
- „Verifică că apare rândul pe care tocmai l-am modificat în DB."
- „Generează-mi un test Playwright pentru fluxul ăsta."

> Puntea: la SQL confirmi cu un `SELECT`; aici confirmi cu **ochii aplicației**.

---

# 3 · tempo-mcp

## Un server custom, scris de noi, clonat din git

---

## tempo-mcp — ce e

Server MCP pentru **Tempo REST API v4** — pontaj (worklogs), plans, teams, accounts. ~81 de tool-uri.

- Scris de mine, în Node. **stdio**, local.
- Se distribuie ca **repo clonabil** — fiecare îl instalează la el.
- Cazul „am scris un server și-l dau echipei" — fără plugin (ăla e S7).

> https://github.com/donciotironni-creator/tempo-mcp

---

## tempo-mcp — instalare (1/2)

```bash
git clone https://github.com/donciotironni-creator/tempo-mcp
cd tempo-mcp
npm install
npm run build
```

Token: **Tempo → Settings → Data Access → API integration → Generate token.**

```
TEMPO_TOKEN=<token-ul tău>
TEMPO_BASE_URL=https://api.eu.tempo.io
```

> EU: `api.eu.tempo.io`. US: `api.tempo.io`.

---

## tempo-mcp — instalare (2/2)

```bash
claude mcp add \
  --env TEMPO_TOKEN=<token> \
  --env TEMPO_BASE_URL=https://api.eu.tempo.io \
  --transport stdio tempo -- node C:/cale/tempo-mcp/dist/index.js
```

- **`--` obligatoriu la stdio** — separă flag-urile Claude Code de comanda serverului.
- **Nu pune numele serverului imediat după `--env`** — e citit ca încă un `KEY=value`.

> Alternativ: blocul `mcpServers` din README, direct în `~/.claude/settings.json`.

---

## tempo-mcp — momentul cross-tool

Pontarea cere `authorAccountId` — care e **Jira account ID**, nu email.

1. Jira MCP (pasul 1): „care e accountId-ul meu?"
2. tempo MCP: „loghează 1h pe DC-142, azi, cu descrierea «review PR»."

```
tempo_worklog_create({ authorAccountId, issueId, startDate, timeSpentSeconds: 3600 })
```

> Două servere care se completează. Aici se vede de ce ai un ecosistem, nu un tool.

---

# 4 · Serverul tău

## Construim unul, pe SQL

---

## Ce construim — și ce NU

**NU rescriem `sql-recon`.** Ai deja un MCP de SQL matur conectat (`search_objects`, `describe_object`, lineage). Un mini-clone n-are rost.

Construim ceva **mic și al echipei**, care predă mecanica. Trei idei:

| Idee | Ce face | De ce bună la demo |
|---|---|---|
| **`tsql-snippets`** ⭐ | întoarce patternul binecuvântat (MERGE upsert, paging, TRY/CATCH) | pură logică, zero I/O — demo curat |
| `proc-catalog` | caută o procedură într-un folder de `.sql` | atinge filesystem, tot simplu |
| `sql-standards` | validează un nume (`usp_`, `vw_`, `fn_`) | arată de ce contează descrierea |

---

## `tsql-snippets` — serverul, stdio minimal

```javascript
import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { z } from "zod";

const SNIPPETS = {
  upsert: "MERGE INTO ... USING ... WHEN MATCHED ...",
  paging: "... ORDER BY id OFFSET @skip ROWS FETCH NEXT @take ROWS ONLY;",
  trycatch: "BEGIN TRY ... END TRY BEGIN CATCH ... THROW; END CATCH",
};

const server = new McpServer({ name: "tsql-snippets", version: "1.0.0" });

server.registerTool("get_snippet", {
  description: "Întoarce patternul T-SQL binecuvântat al echipei pentru un caz dat.",
  inputSchema: z.object({ pattern: z.enum(["upsert", "paging", "trycatch"]) }),
}, async ({ pattern }) => ({ content: [{ type: "text", text: SNIPPETS[pattern] }] }));

await server.connect(new StdioServerTransport());
```

> Pachetul e `@modelcontextprotocol/server`. Tutorialele vechi spun `.../sdk` — altceva.

---

## Nu-l scrii manual

- Îi ceri lui Claude, ca orice altă sarcină. **Citești fișierul înainte de accept** (regula S1–S5).
- Sau plugin oficial de scaffolding:
  `/plugin install mcp-server-dev@claude-plugins-official`
  → `/mcp-server-dev:build-mcp-server`
- Python, dacă preferi: `uv add "mcp[cli]"`, `@mcp.tool()`, `mcp.run(transport="stdio")`. Docstring-ul **e** descrierea uneltei.

---

## Cum verifici că merge — trei pași

1. **Se conectează?** `claude mcp list` → `✔ Connected`. La stdio, cauza tipică e comanda sau o cale relativă.
2. **Uneltele se văd?** `/mcp` → numărul de tool-uri. Zero la un server conectat = rulează, dar nu declară nimic.
3. **Claude o cheamă pe cea potrivită?** Dacă nu → **descrierea** uneltei, nu implementarea.

> Aceeași lecție ca la skills (S3) și subagenți (S4). Descrierile se taie la 2KB: ce e important, la început.

---

## Costul real — contextul

- Tool search e **activ by default** → definițiile de unelte sunt **amânate**. Patru servere conectate azi nu-ți umplu contextul.
- Ce-l umple e **output-ul**: avertisment peste **10.000 de tokens**, tăiere la **25.000** (`MAX_MCP_OUTPUT_TOKENS` ridică plafonul).
- `SELECT *` pe o tabelă mare, sau un worklog list nefiltrat = exact greșeala care se vede aici.

> Legătura cu S4: **rezumate, nu dump-uri.** Regula n-a schimbat, doar sursa dump-ului.

---

## Costul real — procesele

- Patru servere = patru **procese**: pot să nu pornească, să atârne, să pice. `claude mcp list` îți spune care.
- `MCP_TIMEOUT` la pornire; `timeout` per server (ms) pentru un apel de unealtă.
- Un apel din conversația principală care trece de **2 minute** trece automat în background — îl vezi în `/tasks`.
- `alwaysLoad: true` încarcă uneltele în față, ocolind tool search. Bun pentru 2–3 unelte; scump pe tot.

---

## Perimetrul: două straturi

**„Serverul poate face X" ≠ „Claude are voie să facă X".**

**Stratul 1 — ce poate serverul:**
- Un **token read-only** (Tempo, Jira) sau un **user de bază de date read-only** e cea mai eficientă graniță.
- Citește lista de tool-uri înainte să conectezi: unele expun `execute_sql`, care acceptă și `DROP`; tempo expune `..._delete`.

**Stratul 2 — ce are voie Claude:** reguli de permisiuni (S1), comise în repo.

---

## Permisiuni pe unelte MCP

| Regulă | Ce prinde |
|---|---|
| `mcp__tempo` | orice unealtă a serverului |
| `mcp__tempo__*` | la fel, wildcard explicit |
| `mcp__tempo__tempo_worklog_list` | exact acea unealtă |
| `mcp__*` (**doar în `deny`**) | toate uneltele MCP |

- În `allow`, wildcard-ul merge **doar după prefixul literal `mcp__<server>__`**. Un `allow` neancorat (`"*"`, `"mcp__*"`) e ignorat cu warning.
- Tiparul pe tempo/Jira: `allow` pe citire (`_list`, `_get`, `_search`), `ask`/`deny` pe `_create` / `_update` / `_delete`.

---

## Fitilul spre S9 (îl numim, nu-l desfacem)

Un server MCP citește conținut **pe care nu l-ai scris tu** — descrieri de tickete Jira, pagini web prin Playwright, rânduri din bază.

- Conținutul ăla intră în contextul modelului și **poate conține instrucțiuni** → **prompt injection**.
- A doua față: date care **ies** din perimetru — Jira și tempo sunt remote, văd ce le trimiți.

> Ambele se tratează serios în **S9**. Azi reține: **verifică în cine te încrezi înainte să conectezi**, și restrânge de la început.

---

## Lucru aplicat (~70–85 min)

1. **Jira** — adaugă serverul, autentifică-te, pune-i trei întrebări reale. Reține-ți `accountId`-ul.
2. **Playwright** — adaugă-l, pune-l să navigheze o pagină reală și să verifice ceva.
3. **tempo-mcp** — clonează, build, token, conectează. Loghează o oră reală, folosind accountId-ul din Jira.
4. **Restrânge perimetrul** — permisiuni: citirea permisă, `_create`/`_delete` pe `ask`/`deny`.
5. **Serverul tău** — `tsql-snippets` (sau `proc-catalog`), stdio minimal, conectat și verificat.
6. **De la tine la echipă** — configurația în `.mcp.json`, scope `project`, `${VAR}` pentru token, comis.

---

## Capcane comune

- **Un server pentru fiecare idee.** → testul întrebărilor vs. comanda.
- **`--` uitat la stdio.** → flag-urile serverului sunt citite de Claude Code.
- **Numele serverului după `--env`.** → citit ca `KEY=value`, respins.
- **Scope greșit.** → `local` e default; nu ajunge în repo.
- **Token în `.mcp.json`.** → `${TEMPO_TOKEN}`, fișierul se comite; token-ul nu.
- **Output nefiltrat** (`SELECT *`, worklog list pe tot anul). → avertisment de output, context plin.
- **„Serverul poate, deci are voie."** → două straturi separate.
- **`mcp__*` în `allow`.** → ignorat; merge doar în `deny`.

---

## Cu ce pleci — checklist

- [ ] Jira **conectat și autentificat** (`✔ Connected`), accountId-ul tău știut.
- [ ] Playwright conectat, a navigat o pagină reală.
- [ ] tempo-mcp clonat, build-uit, conectat — o oră logată real.
- [ ] Token ca `${VAR}`, nu hardcodat. Zero credențiale în fișierul comis.
- [ ] Reguli de permisiuni: citirea permisă, scriere/ștergere pe `ask`/`deny`.
- [ ] *(capstone)* un server stdio propriu (`tsql-snippets`), cu un tool intern.

---

## Prep pentru S7

- Notează **ce din tot ce ai construit ai vrea să aibă și colegul de lângă, fără să-i explici nimic**.
- Uită-te în `.claude/`: `CLAUDE.md` (S2), skill (S3), subagent (S4), hook (S5), configurație MCP (S6).
- tempo-mcp l-ai dat azi ca **repo de clonat** — fiecare a făcut build, a pus token, a scris calea. Trei oameni, trei configurări.
- Dacă trei oameni configurează același server în trei feluri, problema nu e serverul, e **distribuția**.
- În S7: **plugins** — de la „am scris un server" la „l-am publicat, se instalează cu o comandă".

---

# Întrebări?

Următorul pas: **S7 — Plugins**

---

<!-- APPENDIX — slide-uri de backup, doar dacă apar întrebări avansate. Nu fac parte din flux. -->

## Appendix · `.mcp.json` — fișierul de echipă

```json
{
  "mcpServers": {
    "tempo": {
      "type": "stdio",
      "command": "node",
      "args": ["${TEMPO_MCP_DIR}/dist/index.js"],
      "env": {
        "TEMPO_TOKEN": "${TEMPO_TOKEN}",
        "TEMPO_BASE_URL": "${TEMPO_BASE_URL:-https://api.eu.tempo.io}"
      }
    }
  }
}
```

- **`${VAR}` și `${VAR:-default}`** — în `command`, `args`, `env`, `url`, `headers`.
- Ăsta e mecanismul care face fișierul **comisibil**: token-ul și calea diferă de la om la om.

---

## Appendix · Aprobare & verificare

- Un server din `.mcp.json` **nu pornește necerut** — apare `⏸ Pending approval`.
- Reiei decizia: `claude mcp reset-project-choices`.
- La nivel de echipă: `enabledMcpjsonServers` / `disabledMcpjsonServers` în `settings.json` (S1).

```bash
claude mcp list    # ✔ Connected / ! Needs authentication / ✘ Failed / ⏸ Pending
claude mcp get tempo
claude mcp remove tempo
```

`/mcp` în sesiune: status, **numărul de tool-uri**, autentificare, toggle care dezactivează fără să pierzi configurația.

---

## Appendix · Comenzi și forme mai rare

- **`claude mcp add-json <nume> '<json>'`** — configurație direct din JSON; singura cale pentru `ws`.
- **`claude mcp add-from-claude-desktop`** — import din Claude Desktop (macOS, WSL). Numele acceptă doar litere, cifre, `-`, `_`.
- **`claude mcp serve`** — pornește **Claude Code însuși** ca server MCP pe stdio. Nu tipărește nimic: terminal blocat = merge.
- **Nume rezervate:** `workspace`, `claude-in-chrome`, `computer-use`, `Claude Preview`, `Claude Browser`.

---

## Appendix · Autentificare avansată & tool search

- **`headersHelper`** — comandă care generează headerele la conectare (Kerberos, SSO intern, token-uri scurte). JSON pe stdout, timeout 10s. **Execută shell arbitrar** → la scope de proiect rulează doar după dialogul de încredere.
- **`oauth.scopes`** — fixează scope-urile cerute (listă separată prin spații). Plus `oauth.callbackPort`, `--client-id`, `--client-secret`, `authServerMetadataUrl`.
- **`ENABLE_TOOL_SEARCH`** — `true` / `auto` / `auto:N` / `false`. `alwaysLoad: true` ocolește amânarea, per server.
- **Reconectare** — HTTP/SSE: backoff exponențial, până la 5 încercări. **`stdio` nu se reconectează**: e proces local.

---

## Appendix · Alte fapte utile

- **Elicitation** — serverul poate cere input structurat în mijlocul unui task (formular sau URL). Dialogul apare automat; se poate auto-răspunde cu un hook `Elicitation` (S5).
- **`list_changed`** — un server își poate schimba dinamic uneltele/resursele/prompturile, fără reconectare.
- **Conectori claude.ai** — apar automat în `/mcp` dacă ești logat cu cont claude.ai; nu se încarcă pe `ANTHROPIC_API_KEY` sau alt provider. `disableClaudeAiConnectors: true` îi taie.
- **Servere din plugin-uri (S7)** — numele uneltelor e `mcp__plugin_<plugin>_<server>__<tool>`; o regulă scrisă pe cheia scurtă **nu** prinde.
- **Guvernanță (S9/S10)** — `managed-mcp.json`, `allowedMcpServers` / `deniedMcpServers`.
