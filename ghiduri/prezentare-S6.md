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

## De unde venim → unde mergem

- **S2–S5:** ai schimbat cum lucrează Claude **în interiorul** uneltei — fapte, proceduri, subagenți, hooks.
- Toate operează cu uneltele lui proprii: `Read`, `Grep`, `Bash`, `Edit`.
- **S6:** îi dai **unelte noi**, care ajung la sisteme reale.
- Premisa vine din prep-ul S5: un sistem extern la care ai vrea ca Claude să ajungă.

---

## Simptomul care se vede

Te prinzi **copiind date în chat**.

- Rulezi un `SELECT` în SSMS → lipești rezultatul.
- Deschizi un PR → îl parafrazezi.
- Copiezi un log din dashboard.

> De fiecare dată **tu** ești transportul dintre Claude și sistem.
> Fiecare copy-paste e un tool care lipsește.

---

## Criteriul care ține sesiunea

| Ai nevoie de... | Ce faci |
|---|---|
| Claude **raționează iterativ** pe un sistem viu (interoghează, se uită, întreabă altceva) | **server MCP** |
| operație **one-shot**, output previzibil (`git log`, `dotnet test`) | **script / CLI**, prin `Bash` |

> Regula de aur: merită MCP când poți numi **întrebările** pe care Claude le va pune sistemului. Dacă poți numi doar **comanda** — e script.

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
| **Tools** | Claude le cheamă singur | `list_tables`, `execute_sql` |
| **Resources** | tu, cu `@`: `@server:protocol://cale` | `@github:issue://123` |
| **Prompts** | slash command: `/mcp__server__prompt` | `/mcp__jira__create_issue "Bug" high` |

- **Resources** apar în autocomplete la `@`, lângă fișiere.
- **Prompts** sunt slash commands venite de la server (forma din S3, definită în altă parte).

---

## Transporturi — care contează azi

| Transport | Când |
|---|---|
| `stdio` | proces **local** — tool propriu, baza ta de date. Default-ul pentru ce construiești singur. |
| `http` | remote **recomandat** (în JSON: `http`, alias `streamable-http`). **Singurul cu OAuth.** |
| `sse` | ⚠️ **deprecat** — doar dacă serviciul n-are altceva |
| `ws` | servere care **împing** evenimente; doar prin JSON, autentificare doar prin header |

---

## ⚠️ Corecție: „SSE = pentru echipă" e greșit

Pe două planuri:

1. **SSE e deprecat.** Pentru remote → `http`.
2. **Partajarea nu e o proprietate a transportului** — e o proprietate a **scope-ului**.

> Un server `stdio` pus în `.mcp.json` e partajat cu toată echipa.
> Un server `http` pus în scope `local` nu e partajat cu nimeni.

---

## Instalare — trei forme

```bash
# remote, HTTP
claude mcp add --transport http notion https://mcp.notion.com/mcp

# remote, cu token
claude mcp add --transport http github https://api.githubcopilot.com/mcp/ \
  --header "Authorization: Bearer <PAT>"

# local, stdio — tot ce e după `--` e comanda serverului
claude mcp add --env DB_NAME=LMS_Ionut --transport stdio db -- npx -y pachetul
```

- **`--` e obligatoriu la stdio** — separă flag-urile Claude Code de comanda serverului.
- **Nu pune numele serverului imediat după `--env`** — e citit ca încă un `KEY=value`.

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

## `.mcp.json` — fișierul de echipă

```json
{
  "mcpServers": {
    "lms-db": {
      "type": "stdio",
      "command": "dotnet",
      "args": ["C:/tools/mssql-mcp/MSSQL.MCP.dll"],
      "env": {
        "MSSQL_CONNECTION_STRING":
          "Server=${SQL_SERVER};Database=${LMS_DB:-LMS_Demo};Trusted_Connection=True;TrustServerCertificate=True"
      }
    }
  }
}
```

- **`${VAR}` și `${VAR:-default}`** — în `command`, `args`, `env`, `url`, `headers`.
- Ăsta e mecanismul care face fișierul **comisibil**: baza diferă de la om la om.

---

## Aprobare & verificare

- Un server din `.mcp.json` **nu pornește necerut** — apare `⏸ Pending approval`.
- Reiei decizia: `claude mcp reset-project-choices`.
- La nivel de echipă: `enabledMcpjsonServers` / `disabledMcpjsonServers` în `settings.json` (S1).

```bash
claude mcp list    # ✔ Connected / ! Needs authentication / ✘ Failed / ⏸ Pending
claude mcp get lms-db
claude mcp remove lms-db
```

`/mcp` în sesiune: status, **numărul de tool-uri**, autentificare, toggle care dezactivează fără să pierzi configurația.

---

## Servere remote & OAuth

- Le adaugi **fără credențiale**, apoi te autentifici.
- În sesiune: `/mcp` → sign-in în browser.
- Din shell: `claude mcp login <nume>` / `claude mcp logout <nume>`.
- Token-urile se stochează și se reîmprospătează singure.
- **OAuth merge pe HTTP.**

---

## Costul real — contextul

- Tool search e **activ by default** → definițiile de unelte sunt **amânate**. Un server în plus nu-ți umple contextul.
- Ce-l umple e **output-ul**: avertisment peste **10.000 de tokens**, tăiere la **25.000** (`MAX_MCP_OUTPUT_TOKENS` ridică plafonul).
- `SELECT *` pe o tabelă mare = exact greșeala care se vede aici.

> Legătura cu S4: **rezumate, nu dump-uri.** Regula n-a schimbat, doar sursa dump-ului.

---

## Costul real — procesele

- Un server în plus e un **proces în plus**: poate să nu pornească, să atârne, să pice. `claude mcp list` îți spune care.
- `MCP_TIMEOUT` la pornire; `timeout` per server (ms) pentru un apel de unealtă.
- Un apel din conversația principală care trece de **2 minute** trece automat în background — îl vezi în `/tasks`.
- `alwaysLoad: true` încarcă uneltele în față, ocolind tool search. Bun pentru 2–3 unelte; scump pe tot.

---

## Perimetrul: două straturi

**„Serverul poate face X" ≠ „Claude are voie să facă X".**

**Stratul 1 — ce poate serverul:**
- Un **user de bază de date read-only** e cea mai eficientă graniță din toată sesiunea.
- Citește lista de tool-uri înainte să conectezi: unele expun `execute_sql`, care acceptă și `DROP`.

**Stratul 2 — ce are voie Claude:** reguli de permisiuni (S1), comise în repo.

---

## Permisiuni pe unelte MCP

| Regulă | Ce prinde |
|---|---|
| `mcp__lms-db` | orice unealtă a serverului |
| `mcp__lms-db__*` | la fel, wildcard explicit |
| `mcp__lms-db__list_tables` | exact acea unealtă |
| `mcp__*` (**doar în `deny`**) | toate uneltele MCP |

- În `allow`, wildcard-ul merge **doar după prefixul literal `mcp__<server>__`**. Un `allow` neancorat (`"*"`, `"mcp__*"`) e ignorat cu warning.
- Tiparul pe bază de date: `allow` pe citire, `ask`/`deny` pe SQL arbitrar.

---

## Fitilul spre S9 (îl numim, nu-l desfacem)

Un server MCP citește conținut **pe care nu l-ai scris tu** — rânduri din bază, descrieri de tickete, pagini web.

- Conținutul ăla intră în contextul modelului și **poate conține instrucțiuni** → **prompt injection**.
- A doua față: date care **ies** din perimetru — un server remote vede ce-i trimiți.

> Ambele se tratează serios în **S9**. Azi reține: **verifică în cine te încrezi înainte să conectezi**, și restrânge de la început.

---

## Serverul tău, stdio minimal

```javascript
import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { z } from "zod";

const server = new McpServer({ name: "lms-tools", version: "1.0.0" });

server.registerTool("get_naming_rules", {
  description: "Întoarce convențiile de denumire ale echipei.",
  inputSchema: z.object({ layer: z.enum(["db", "api"]) }),
}, async ({ layer }) => ({ content: [{ type: "text", text: "..." }] }));

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

## Lucru aplicat (~70–85 min)

1. **Triază** sistemele din prep-ul S5 — MCP sau script?
2. **Un server existent**, zero cod (filesystem / browser).
3. **Baza ta prin MCP** — SQL Server, autentificare Windows, trei întrebări reale.
4. **Restrânge perimetrul** — permisiuni pe `mcp__<server>__*`.
5. **De la tine la echipă** — `.mcp.json`, scope `project`, `${VAR}`, comis.
6. **Serverul tău** — stdio minimal, cu un tool intern.

---

## Capcane comune

- **Un server pentru fiecare idee.** → testul întrebărilor vs. comanda.
- **`--` uitat la stdio.** → flag-urile serverului sunt citite de Claude Code.
- **Numele serverului după `--env`.** → citit ca `KEY=value`, respins.
- **Scope greșit.** → `local` e default; nu ajunge în repo.
- **Credențiale în `.mcp.json`.** → `${VAR}`, fișierul se comite.
- **`SELECT *` pe tabelă mare.** → avertisment de output, context plin.
- **„Serverul poate, deci are voie."** → două straturi separate.
- **`mcp__*` în `allow`.** → ignorat; merge doar în `deny`.

---

## Cu ce pleci — checklist

- [ ] `.mcp.json` **comis**, cu cel puțin serverul de bază de date.
- [ ] Numele bazei ca `${VAR}`, nu hardcodat. Zero credențiale în fișier.
- [ ] `claude mcp list` arată `✔ Connected`.
- [ ] Reguli de permisiuni: citirea permisă, SQL arbitrar pe `ask`/`deny`.
- [ ] Trei întrebări reale la care Claude a răspuns pe baza **ta**.
- [ ] *(capstone)* un server stdio propriu, cu un tool intern.

---

## Prep pentru S7

- Notează **ce din tot ce ai construit ai vrea să aibă și colegul de lângă, fără să-i explici nimic**.
- Uită-te în `.claude/`: `CLAUDE.md` (S2), skill (S3), subagent (S4), hook (S5), configurație MCP (S6).
- Fiecare a fost partajat altfel — sau deloc.
- Dacă trei oameni au configurat același server în trei feluri, problema nu e serverul, e **distribuția**.
- În S7: **plugins** — de la „am configurat" la „am publicat".

---

# Întrebări?

Următorul pas: **S7 — Plugins**

---

<!-- APPENDIX — slide-uri de backup, doar dacă apar întrebări avansate. Nu fac parte din flux. -->

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
