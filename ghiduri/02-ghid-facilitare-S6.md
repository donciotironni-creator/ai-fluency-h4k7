# Claude Code Fluency — Ghid de facilitare · S6

*Publicul: echipă senior, cu fundamentele AI deja acoperite. Formatul de joi: tutorial → lucru aplicat → schimb de practici.*

> **Notă:** Claude Code publică des. Numele comenzilor, flag-urile și transporturile se pot schimba de la o lună la alta. La începutul fiecărei sesiuni rulează `/help` și verifică docul oficial (`code.claude.com/docs/en/mcp`). Acest ghid predă principii care rezistă, nu sintaxă care se schimbă săptămânal. **Verificat pe docul oficial în iulie 2026** — trei lucruri de reținut ca fiind curente: (1) transportul **SSE e deprecat**; pentru servere remote se folosește **HTTP** (în JSON: `http`, alias `streamable-http`), iar SSE doar dacă serviciul nu expune altceva; (2) scope-urile se numesc acum **`local` (default) / `project` / `user`** — variantele vechi erau `project` și `global`, iar **doar `project` scrie `.mcp.json`**; `local` și `user` stau în `~/.claude.json`; (3) **tool search e activ by default** — uneltele MCP nu se încarcă în context la pornire, ci sunt descoperite la nevoie, deci un server în plus costă aproape nimic în context până e chiar folosit.

---

## S6 — MCP: Claude Code vorbește cu lumea din afara repo-ului

A treia sesiune din **Faza 2 — Extensii proprii**. Până acum ai construit componente care schimbă cum lucrează Claude **în interiorul** uneltei: fapte în `CLAUDE.md` (S2), proceduri în skills (S3), muncă izolată în subagenți (S4), garanții deterministe în hooks (S5). Toate operează cu uneltele proprii ale Claude Code — `Read`, `Grep`, `Bash`, `Edit`. Azi deschizi ușa spre exterior: **MCP** îi dă unelte noi, care ajung la sisteme reale.

Premisa vine direct din prep-ul de la finalul S5: fiecare a notat **un sistem extern la care ar vrea ca Claude să ajungă** — baza de date a echipei, un API intern, Jira, Bitbucket, un serviciu de monitorizare. Azi conectăm exact acele sisteme, începând cu cel mai relevant pentru voi: **baza de date**.

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
- Cele **trei transporturi** care contează azi: `stdio` (proces local), `http` (remote, recomandat, suportă OAuth), `sse` (**deprecat**, doar dacă serviciul n-are altceva). Plus `ws`, pentru servere care împing evenimente.
- Cum instalezi: `claude mcp add`, cu `--transport`, `--env`, `--header`, `--scope` — și de ce `--` e obligatoriu la stdio.
- Cele **trei scope-uri** și ce fișier scrie fiecare: `local` → `~/.claude.json` (doar tu, doar acest proiect), `project` → **`.mcp.json` comis în repo** (toată echipa), `user` → `~/.claude.json` (doar tu, toate proiectele).
- Cum **verifici** că merge: `claude mcp list` (status de sănătate), `claude mcp get <nume>`, `/mcp` în sesiune.
- Cum **restrângi perimetrul**: reguli de permisiuni pe `mcp__server__tool`, un user de bază de date read-only, și de ce „serverul poate face X" nu înseamnă „Claude are voie să facă X".
- Cum **scrii un server MCP propriu**, minimal, pe `stdio`, care expune un tool intern al echipei.

> **Notă de scop pentru facilitator:** S6 e o sesiune cu **două miezuri**. Conceptual, miezul e **segmentul 4** (MCP vs. script/CLI — judecata care oprește oamenii să împacheteze tot în servere). Practic, miezul e **segmentul 3 + exercițiul pe baza de date** — momentul în care fiecare vede Claude interogându-și propria bază, în română, fără să scrie SQL. Dacă timpul strânge, comprimă segmentul 2 (anatomia devine un `/mcp` comentat 5 minute) și segmentul 6 (serverul propriu devine demo, iar scrisul lui rămâne temă). **Protejează 3 și 4.** Capcana clasică a zilei: oamenii vor un server MCP pentru fiecare unealtă care le trece prin cap — și ajung cu șase servere pornite din care folosesc unul.

### Structura zilei

| Bloc | Durată |
|------|--------|
| Tutorial | 90–110 min |
| Lucru aplicat | 70–85 min |
| Schimb de practici | 15–20 min |

---

### Tutorial (90–110 min)

Concret, cu demo pe repo-ul de nisip și pe o bază de date reală. Șase segmente.

#### 1. De ce MCP — ce lipsește când Claude n-are acces (10–15 min)

- **Punctul de plecare:** sistemul extern notat în prep-ul S5. Întreabă în cerc: „ce ai conecta primul?" Notează răspunsurile pe tablă — le folosim la segmentul 4 ca material de triaj.
- **Simptomul care se vede:** te prinzi copiind date în chat. Rulezi un `SELECT` în SSMS și lipești rezultatul. Deschizi Bitbucket, citești un PR, îl parafrazezi. De fiecare dată **tu** ești transportul dintre Claude și sistem.
- **Ce schimbă MCP:** Claude primește unelte noi, care vorbesc direct cu sistemul. Nu mai lipești rezultate — ceri ce vrei să afli, iar Claude iterează singur: se uită la schema, vede că îi lipsește o coloană, o caută, corelează două tabele.
- **De ce nu e „doar un wrapper peste Bash":** un server MCP întoarce **date structurate** cu **schemă de unealtă** (ce parametri acceptă, ce înseamnă), nu text pe stdout care trebuie ghicit. Și, spre deosebire de un script, poate fi partajat cu echipa ca **configurație**, nu ca fișier de copiat.

**Demo:** pornește de la eșec. Cere-i lui Claude, fără MCP: „ce tabele are baza `LMS_<Nume>` și câte rânduri are cea mai mare?" Arată ce face — încearcă `Bash` cu `sqlcmd`, ghicește, sau spune onest că nu ajunge la bază. Apoi (păstrează pentru segmentul 3) aceeași întrebare cu serverul MCP conectat.

> **Firul S4, dus mai departe:** economia de context nu dispare cu MCP — se mută. Tool search e activ by default, deci uneltele unui server nu intră în context la pornire; Claude le caută când are nevoie. Fixează asta acum, ca să nu apară frica de „prea multe servere = context plin". Costul real nu e definiția uneltei, e **output-ul** ei — vezi segmentul 4.

#### 2. Anatomia unui server: tools, resources, prompts — și transportul (15–20 min)

**Ce expune un server MCP** — majoritatea documentației vorbește doar de tools, dar sunt trei lucruri:

| Ce expune | Cum îl folosești | Exemplu |
|-----------|------------------|---------|
| **Tools** | Claude le cheamă singur, ca orice unealtă | `list_tables`, `execute_sql` |
| **Resources** | tu le referențiezi cu `@`, ca fișierele: `@server:protocol://cale` | `@github:issue://123`, `@postgres:schema://users` |
| **Prompts** | apar ca slash commands: `/mcp__server__prompt` (cu argumente separate prin spațiu) | `/mcp__jira__create_issue "Bug în login" high` |

- **Resources** se completează cu `@` în prompt — apar în autocomplete lângă fișiere, și se atașează la conversație când le referențiezi. E puntea directă spre S3: un server bun îți dă și *context* la cerere, nu doar acțiuni.
- **Prompts** sunt slash commands venite de la server — exact forma din S3, doar că definite în altă parte. Numele se normalizează (spațiile devin `_`).

**Transporturile** — care contează azi:

| Transport | Ce e | Când îl folosești |
|-----------|------|-------------------|
| `stdio` | proces local, pornit de Claude Code, care vorbește pe stdin/stdout | tool local, acces la sistemul tău, baza ta de date, scripturi proprii. **Default-ul pentru ce construiești singur.** |
| `http` | server remote (în JSON: `http`, alias `streamable-http`) | servicii cloud partajate; **singurul care suportă OAuth**. Recomandarea pentru remote. |
| `sse` | **deprecat** | doar dacă serviciul nu expune decât un endpoint SSE |
| `ws` | WebSocket, conexiune bidirecțională persistentă | servere care **împing** evenimente spre tine, neîntrebate. Se configurează doar prin JSON, autentificare doar prin header. |

> ⚠️ **Corecție față de intuiția comună:** „SSE = pentru servicii partajate de echipă" e greșit pe două planuri. SSE e deprecat, și **partajarea nu e o proprietate a transportului** — e o proprietate a **scope-ului** (segmentul 3). Un server `stdio` pus în `.mcp.json` e partajat cu toată echipa; un server `http` pus în scope `local` nu e partajat cu nimeni.

- **Un detaliu util la `stdio`:** Claude Code pune `CLAUDE_PROJECT_DIR` în mediul procesului pornit, deci serverul tău poate rezolva căi relative la rădăcina proiectului fără să depindă de directorul curent.

**Demo:** rulează `/mcp` cu un server deja conectat. Arată: lista de servere, statusul fiecăruia, **numărul de tool-uri**, și meniul unui server (autentificare, dezactivare). Apoi tastează `@` și arată resources în autocomplete, și `/` și arată prompturile `mcp__...`.

#### 3. Instalare și scope — unde trăiește configurația (20–25 min)

Ăsta e segmentul de mecanică, și e cel pe care se sprijină tot lucrul aplicat. Fă-l încet.

**Cele trei forme de `claude mcp add`:**

```bash
# remote, HTTP (recomandat pentru servicii cloud)
claude mcp add --transport http notion https://mcp.notion.com/mcp

# remote, cu token în header
claude mcp add --transport http github https://api.githubcopilot.com/mcp/ \
  --header "Authorization: Bearer <PAT>"

# local, stdio — tot ce e după `--` e comanda serverului
claude mcp add --env DB_NAME=LMS_Ionut --transport stdio db -- npx -y pachetul-serverului
```

- **`--` (dublă cratimă) e obligatoriu la stdio.** Separă opțiunile Claude Code (`--transport`, `--env`, `--scope`) de comanda serverului. Fără el, un `--port 8080` al serverului e citit de Claude Code ca flag propriu și comanda eșuează.
- **`--env` / `-e`** acceptă mai multe `KEY=value`. Capcană reală: **nu pune numele serverului imediat după `--env`** — CLI-ul îl citește ca încă o pereche și îl respinge. Pune cel puțin o altă opțiune între ele (ca în exemplul de sus).
- **`--header` / `-H`** pentru autentificare cu token. `--transport` / `-t` are și formă scurtă.
- `claude mcp add` **nu validează credențialele** — scrie configurația și confirmă cu `Added ...`. Un token greșit se vede abia la conectare.

**Cele trei scope-uri** — tabelul care trebuie să rămână pe tablă toată ziua:

| Scope | Se încarcă în | Partajat cu echipa | Scris în |
|-------|---------------|--------------------|----------|
| `local` (**default**) | doar proiectul curent | nu | `~/.claude.json`, sub calea proiectului |
| `project` | doar proiectul curent | **da, prin git** | **`.mcp.json`** în rădăcina repo-ului |
| `user` | toate proiectele tale | nu | `~/.claude.json` |

- **Default-ul e `local`** — dacă nu pui `--scope`, serverul e al tău și doar în proiectul asta. Bun pentru experimente și pentru servere cu credențiale.
- **`project` e singurul care produce un fișier de comis.** Structura lui:

```json
{
  "mcpServers": {
    "lms-db": {
      "type": "stdio",
      "command": "dotnet",
      "args": ["C:/tools/mssql-mcp/MSSQL.MCP.dll"],
      "env": {
        "MSSQL_CONNECTION_STRING": "Server=${SQL_SERVER};Database=${LMS_DB:-LMS_Demo};Trusted_Connection=True;TrustServerCertificate=True"
      }
    }
  }
}
```

- **Expansiune de variabile de mediu în `.mcp.json`:** `${VAR}` și `${VAR:-default}`, în `command`, `args`, `env`, `url` și `headers`. Ăsta e mecanismul care face un `.mcp.json` **comisibil**: numele bazei diferă de la om la om, deci îl lași ca variabilă. Dacă variabila nu e setată și n-are default, configurația se încarcă oricum, dar `claude mcp list` raportează un warning și textul `${VAR}` rămâne neexpandat.
- **Aprobare la `project` scope:** un server din `.mcp.json` nu pornește necerut — Claude Code cere aprobare prima dată. Până atunci apare ca `⏸ Pending approval`. Dacă ai aprobat greșit și vrei să reiei decizia: `claude mcp reset-project-choices`. La nivel de echipă, `enabledMcpjsonServers` / `disabledMcpjsonServers` / `enableAllProjectMcpServers` în `settings.json` (S1) pre-aprobă sau resping servere fără prompt.
- **Precedență**, când același nume apare în mai multe locuri: `local` > `project` > `user` > servere din plugin-uri > conectori claude.ai. Se ia **întreaga** definiție din sursa câștigătoare — câmpurile nu se combină.

**Verificarea, în trei comenzi:**

```bash
claude mcp list          # toate serverele + status: ✔ Connected / ! Needs authentication / ✘ Failed to connect / ⏸ Pending approval
claude mcp get lms-db    # detaliile unui server
claude mcp remove lms-db # scoate-l
```

Plus `/mcp` în sesiune: status, număr de tool-uri, autentificare, și un toggle care dezactivează un server **fără** să-i pierzi configurația.

- **Servere remote cu OAuth:** le adaugi fără credențiale, apoi te autentifici din `/mcp` (sau, din shell, `claude mcp login <nume>` / `claude mcp logout <nume>`). Token-urile se stochează și se reîmprospătează singure. OAuth merge pe HTTP.

**Demo:** instalează live un server care nu cere nimic (filesystem sau browser), arată-l în `claude mcp list`, deschide `/mcp`. Apoi conectează serverul de bază de date și **repetă întrebarea din segmentul 1** — „ce tabele are baza mea și care e cea mai mare?". Ăsta e momentul „aha" al zilei; nu-l grăbi. La final arată același server mutat în `.mcp.json` și explică de ce fișierul se comite.

#### 4. MCP vs. script/CLI — și costul real (20–25 min)

Miezul conceptual al zilei — echivalentul segmentului „când merită" din S3/S4/S5. Ia lista de sisteme de pe tablă din segmentul 1 și **triază-o live, cu grupul**.

**Merită un server MCP când:**
- Claude trebuie să **raționeze iterativ** pe sistem: interoghează, se uită, întreabă altceva. O bază de date e cazul canonic.
- **Mai multe sesiuni sau mai mulți oameni** folosesc același acces — se configurează o dată, în `.mcp.json`, și merge la toți.
- Sistemul are **multe operații înrudite** care beneficiază de scheme de unelte (ce parametri, ce înseamnă), nu de un CLI cu flag-uri ghicite.

**E suficient un script / o comandă CLI când:**
- E o operație **one-shot** cu output previzibil: `git log`, `dotnet test`, `curl` pe un endpoint. `Bash` le face deja.
- Fluxul e o **procedură**, nu un acces: atunci e un **skill** (S3), eventual unul care cheamă un script.
- Ai deja un CLI bun. Un server MCP care doar reîmpachetează `az` sau `gh` adaugă un proces și zero capabilitate.

> **Regula de aur:** un server MCP merită când poți numi **întrebările** pe care Claude le va pune sistemului. Dacă poți numi doar **comanda** pe care ai rula-o tu, e script.

**Costul, ca să nu-l descoperiți în practică:**
- **Contextul:** tool search e activ by default, deci definițiile de unelte sunt amânate — un server în plus nu-ți umple contextul. Ce-l umple e **output-ul**. Claude Code avertizează când un tool MCP întoarce peste **10.000 de tokens** și taie la **25.000** implicit (`MAX_MCP_OUTPUT_TOKENS` ridică plafonul). Un `SELECT *` pe o tabelă mare e exact greșeala care se vede aici. Legătura cu S4: rezumate, nu dump-uri — regula nu s-a schimbat, doar sursa dump-ului.
- **Un server în plus e un proces în plus** care poate să nu pornească, să atârne sau să pice. `claude mcp list` îți arată care. Timeout-uri: `MCP_TIMEOUT` la pornire, `timeout` per server (milisecunde) pentru un apel de unealtă. Un apel din conversația principală care trece de 2 minute trece automat în background, ca task — îl vezi în `/tasks`.
- **`alwaysLoad: true`** pe un server îi încarcă uneltele în context la pornire, ocolind tool search. Util pentru 2–3 unelte de care Claude are nevoie la fiecare tură; scump dacă îl pui pe tot.

**Demo:** ia din listă un candidat prost (ex. „vreau un server MCP care rulează testele") și arată de ce e script/skill, nu MCP. Apoi ia unul bun (baza de date) și arată-l lucrând. Închide cu un `SELECT` prea larg pe baza demo, ca să apară avertismentul de output — se învață mai bine văzut.

#### 5. Perimetrul: ce lași uneltele să facă (15–20 min)

Firul de siguranță din S1, aplicat pe MCP. Aici stabilim **granițele**; suprafața de risc propriu-zisă (prompt injection, exfiltrare) se tratează serios în **S9** — azi doar o numim.

**Distincția care contează:** „serverul poate face X" **≠** „Claude are voie să facă X". Sunt două straturi separate, și le controlezi separat.

**Stratul 1 — ce poate serverul.** Ține de configurația lui, nu de Claude Code:
- Un **user de bază de date read-only** în connection string e cea mai eficientă graniță din toată sesiunea. Un server care nu are drept de scriere nu poate scrie, indiferent ce cere modelul. Pentru azi, pe bazele de curs, contul de Windows e suficient — dar reflexul pentru orice bază reală e user dedicat, drepturi minime.
- Unele servere expun deliberat o unealtă atotputernică (`execute_sql` acceptă și `DROP`). Citește lista de tool-uri **înainte** să conectezi ceva la o bază care contează.

**Stratul 2 — ce are voie Claude.** Reguli de permisiuni în `settings.json` (S1), pe nume de unealtă MCP:

| Regulă | Ce prinde |
|--------|-----------|
| `mcp__lms-db` | orice unealtă a serverului `lms-db` |
| `mcp__lms-db__*` | la fel, cu wildcard explicit |
| `mcp__lms-db__list_tables` | exact acea unealtă |
| `mcp__*` (doar în `deny`) | toate uneltele MCP |

- **Wildcard-urile în `allow` merg doar după prefixul literal `mcp__<server>__`.** Segmentul cu numele serverului trebuie să fie fără glob — o regulă de `allow` neancorată (`"*"`, `"mcp__*"`) e ignorată cu warning și nu aprobă nimic. În `deny` însă, `mcp__*` e valid și taie tot.
- Tiparul practic pe baza de date: `allow` pe uneltele de citire, `ask` sau `deny` pe cea care execută SQL arbitrar. Se citește ca o politică, și se comite în repo ca orice altă regulă din S1.

> **Fitilul pentru S9 (îl numim, nu-l desfacem):** un server MCP citește conținut pe care nu l-ai scris tu — rânduri din bază, descrieri de tickete, pagini web. Conținutul ăla ajunge în contextul modelului și **poate conține instrucțiuni**. Asta e prompt injection, și e vectorul serios al MCP-ului. A doua față: date care **ies** din perimetru — un server remote vede ce-i trimiți. Ambele se tratează în S9, cu tot ce trebuie. Azi reține doar: **verifică în cine te încrezi înainte să conectezi**, și restrânge de la început.

**Demo:** adaugă o regulă de permisiuni care blochează unealta de SQL arbitrar și lasă doar citirea. Cere-i lui Claude ceva ce ar necesita scriere și arată promptul/refuzul. Punctează: serverul putea, Claude n-a avut voie.

#### 6. Serverul tău MCP, stdio minimal — și cum verifici (20–25 min)

Ținta finală a zilei: fiecare pleacă cu o **configurație MCP funcțională, comisă** — iar cine ajunge până aici, și cu un **server propriu** care expune un tool intern.

Un server MCP minimal e surprinzător de mic: declari un tool cu un nume, o descriere și o schemă de parametri, apoi asculți pe stdio.

**Node (verificat pe doc, iulie 2026):**

```bash
npm install @modelcontextprotocol/server zod
```

```javascript
import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { z } from "zod";

const server = new McpServer({ name: "lms-tools", version: "1.0.0" });

server.registerTool(
  "get_naming_rules",
  {
    description: "Întoarce convențiile de denumire ale echipei pentru tabele și proceduri.",
    inputSchema: z.object({ layer: z.enum(["db", "api"]) }),
  },
  async ({ layer }) => ({
    content: [{ type: "text", text: layer === "db" ? "Tabele: PascalCase..." : "Endpoint-uri: kebab-case..." }],
  }),
);

const transport = new StdioServerTransport();
await server.connect(transport);
```

> **Atenție la numele pachetului:** e `@modelcontextprotocol/server`. Tutorialele mai vechi (și multe răspunsuri de pe net) spun `@modelcontextprotocol/sdk` — dacă cineva copiază de acolo, va instala altceva.

**Python**, dacă preferă cineva: `uv add "mcp[cli]"`, apoi `from mcp.server import MCPServer`, un `@mcp.tool()` pe o funcție cu docstring (docstring-ul **e** descrierea uneltei), și `mcp.run(transport="stdio")`.

**Nu-l scriem manual** — îi cerem lui Claude, ca orice altă sarcină. Alternativ, există un plugin oficial care face scaffolding-ul: `/plugin install mcp-server-dev@claude-plugins-official`, apoi `/mcp-server-dev:build-mcp-server`.

**Conectarea și verificarea, în trei pași:**

```bash
claude mcp add --transport stdio lms-tools -- node C:/path/to/server.js
claude mcp list          # apare ✔ Connected?
```
apoi, în sesiune, `/mcp` → serverul apare cu numărul corect de tool-uri, și în final **întrebarea reală**: ceri ceva ce doar unealta ta poate răspunde, și verifici că a fost chemată.

**Dovada care contează la MCP** — trei lucruri, în ordine:
1. **Se conectează?** `claude mcp list` arată `✔ Connected`, nu `✘ Failed to connect`. La un server stdio, cauza tipică e comanda greșită sau o cale relativă.
2. **Uneltele se văd?** `/mcp` arată numărul de tool-uri. Zero tool-uri la un server conectat = serverul rulează, dar nu declară nimic.
3. **Claude o cheamă pe cea potrivită?** Aici e aceeași lecție ca la skills (S3) și subagenți (S4): dacă unealta nu e chemată, problema e aproape mereu **descrierea** ei, nu implementarea. Descrierile de unelte și instrucțiunile de server se taie la 2KB — pune ce e important la început.

**Demo:** cere-i lui Claude un server stdio minimal cu un tool intern (ex. „întoarce-mi convențiile de denumire ale echipei"), **citește fișierul cu grupul înainte de accept** (regula S1–S5), conectează-l, și arată cei trei pași de verificare. Dacă rămâne timp: schimbă descrierea uneltei în ceva vag și arată cum Claude nu o mai cheamă.

---

### Lucru aplicat (70–85 min)

**Brief:** fiecare iese cu o **configurație MCP funcțională, comisă în `.mcp.json`** pe repo-ul lui de curs — minim serverul de bază de date, care răspunde la întrebări reale despre baza lui — plus regulile de permisiuni care îi restrâng perimetrul.

1. **Triază sistemele** — lista din prep-ul S5. Pentru fiecare: server MCP sau script/skill? Poți numi întrebările pe care Claude le-ar pune sistemului?
2. **Un server existent, zero cod** — instalează unul care nu cere credențiale (filesystem sau browser), verifică-l cu `claude mcp list` + `/mcp`.
3. **Baza ta prin MCP** — conectează un server de SQL Server la baza ta `LMS_<Nume>`, cu autentificare Windows. Pune-i trei întrebări reale, în română.
4. **Restrânge perimetrul** — reguli de permisiuni pe `mcp__<server>__*`: citirea permisă, SQL arbitrar pe `ask` sau `deny`. Verifică că regula chiar prinde.
5. **De la tine la echipă** — mută serverul în `.mcp.json` cu scope `project`, cu numele bazei ca `${VAR}`, și **comite-l**.
6. **Serverul tău** (capstone) — un server stdio minimal, cu un tool intern, conectat și verificat.

**Extensie (dacă ai terminat):** adaugă `alwaysLoad: true` pe serverul de bază de date și vezi diferența în `/context`. Sau: conectează un server remote cu OAuth (`/mcp` → autentificare) și observă fluxul.

### Artefact al sesiunii

Un artefact real, comis — nu notițe:
- O configurație MCP funcțională pentru un flux propriu: **`.mcp.json` comis** în repo, cu cel puțin serverul de bază de date, plus regulile de permisiuni care îi limitează uneltele. Oricine clonează repo-ul primește același acces, fără instrucțiuni de setup.

### Schimb de practici (15–20 min)

Fiecare, ~2 min:
- Ce a conectat și de ce **acela** primul. Ce triaj a făcut: ce a rămas MCP și ce s-a dovedit script.
- Un moment „aici s-a văzut diferența" — fie o întrebare la care Claude a răspuns corect pe baza lui, fie un perimetru pe care l-a restrâns conștient.

Se notează în docul „AI Wins & Fails", coloana „Candidat standard?" — de-aici alegeți, în Faza 3, ce servere MCP intră în setul de referință al echipei. Fitilul spre S7: dacă trei oameni au configurat același server în trei feluri, aia e exact problema pe care o rezolvă un **plugin**.

---

### Capcane comune (note pentru facilitator)

- **Un server MCP pentru fiecare idee.** Capcana zilei. Cineva vrea servere pentru teste, pentru build, pentru git — toate lucruri pe care `Bash` le face deja. Testul: *poți numi întrebările pe care Claude le-ar pune sistemului? Dacă poți numi doar comanda, e script.*
- **`--` uitat la stdio.** Cea mai frecventă eroare de sintaxă. Fără `--`, flag-urile serverului sunt citite ca flag-uri Claude Code. Dacă un `claude mcp add` cade cu o eroare de opțiune necunoscută, verifică `--` întâi.
- **Numele serverului imediat după `--env`.** CLI-ul îl citește ca încă un `KEY=value` și îl respinge. Pune altă opțiune între ele.
- **Scope greșit.** Cineva adaugă serverul în `local` (default!) și se miră că nu e în repo. Sau invers: pune un server cu token personal în `.mcp.json` comis. Întrebarea de control: *vreau să-l aibă echipa? → `project`. Vreau să-l am pe toate proiectele mele? → `user`. Doar aici, doar eu? → `local`.*
- **Credențiale în `.mcp.json`.** Fișierul se comite. Token-uri și parole se pun în variabile de mediu și se referențiază cu `${VAR}`. Pe bazele noastre nu e problemă (autentificare Windows, fără parolă) — dar reflexul se formează azi.
- **`SELECT *` pe o tabelă mare.** Apare avertismentul de output MCP (peste 10.000 de tokens), și contextul se umple. Aceeași lecție ca la subagenți: cere rezumate, nu dump-uri. Aici o pui în promptul spre Claude: „numără, nu lista".
- **„Serverul poate, deci Claude are voie."** Confuzia dintre cele două straturi. Un `execute_sql` expus nu înseamnă aprobat — permisiunile sunt separate, și se comit.
- **Wildcard neancorat în `allow`.** `"mcp__*"` în `allow` e ignorat cu warning. Merge doar în `deny`. Dacă cineva crede că a permis tot și nu se schimbă nimic, e asta.
- **Server conectat, zero tool-uri.** Se vede în `/mcp`. Serverul rulează dar nu declară nimic — de obicei o eroare în înregistrarea uneltelor, nu în transport.
- **Încredere oarbă în server străin.** Un server MCP rulează cu privilegiile tale și citește conținut pe care nu-l controlezi. Verifică sursa înainte să conectezi, exact ca la skills (S3) și hooks (S5).

### Întrebări avansate — note pentru facilitator (opțional, NU e în cele 6 segmente)

Grupul e senior; pot apărea întrebări dincolo de instalare și scope. Astea sunt răspunsuri scurte, verificate pe docul oficial (iulie 2026). **Nu le preda proactiv** — protejează segmentele 3 și 4.

- **`claude mcp add-json <nume> '<json>'`** — adaugi un server direct din JSON, util când copiezi configurația din documentația unui serviciu. Singura cale pentru transportul `ws`.
- **`claude mcp add-from-claude-desktop`** — importă serverele configurate în Claude Desktop (macOS și WSL). Numele cu spații nu pot fi importate: la `claude mcp` numele acceptă doar litere, cifre, `-` și `_`.
- **`claude mcp serve`** — pornește **Claude Code însuși** ca server MCP pe stdio, ca alt client să-i folosească uneltele. Comanda nu tipărește nimic; un terminal blocat și silențios înseamnă că merge.
- **Nume rezervate** — `workspace`, `claude-in-chrome`, `computer-use`, `Claude Preview`, `Claude Browser` sunt ale serverelor built-in. `claude mcp add` respinge un nume rezervat.
- **`headersHelper`** — o comandă care generează headerele la conectare, pentru autentificare care nu e OAuth (Kerberos, SSO intern, token-uri scurte). Scrie un obiect JSON pe stdout; rulează la fiecare conectare, cu timeout de 10 secunde. **Execută shell arbitrar**, deci la scope de proiect rulează doar după ce accepți dialogul de încredere al workspace-ului.
- **`oauth.scopes`** — fixează scope-urile OAuth cerute, ca listă separată prin spații. Calea corectă când securitatea vrea un subset aprobat. Adiacent: `oauth.callbackPort`, `--client-id`, `--client-secret`, `authServerMetadataUrl` pentru servere care nu suportă înregistrare dinamică de client.
- **`ENABLE_TOOL_SEARCH`** — `true` (default: totul amânat), `auto` / `auto:N` (încarcă în față dacă încap în N% din context), `false` (totul în față). `alwaysLoad: true` per server ocolește amânarea. `alwaysLoad` blochează și pornirea până se conectează serverul (plafonat la 5 secunde).
- **Reconectare** — HTTP și SSE se reconectează singure, cu backoff exponențial, până la cinci încercări. Serverele `stdio` **nu** se reconectează automat: sunt procese locale.
- **Elicitation** — un server poate cere input structurat de la tine în mijlocul unui task (formular sau URL de aprobare); dialogul apare automat, fără configurare. Se poate auto-răspunde cu un hook `Elicitation` (fitil spre S5).
- **`list_changed`** — un server poate anunța dinamic că și-a schimbat uneltele/resursele/prompturile; Claude Code reîmprospătează fără reconectare.
- **Conectori claude.ai** — dacă ești logat cu cont claude.ai, conectorii adăugați acolo apar automat în `/mcp`. Nu se încarcă dacă autentificarea activă e prin `ANTHROPIC_API_KEY` sau alt provider. `disableClaudeAiConnectors: true` îi taie.
- **Servere din plugin-uri (fitil S7)** — un plugin poate împacheta servere MCP; se pornesc când activezi plugin-ul. Numele uneltelor lor e mai lung: `mcp__plugin_<plugin>_<server>__<tool>` — o regulă de permisiune scrisă pe cheia scurtă a serverului **nu** prinde.
- **`roots/list`** — un server care vrea să-și limiteze singur accesul la disc ar trebui să implementeze `roots/list`; Claude Code răspunde cu directorul sesiunii plus fiecare director adăugat cu `--add-dir`.
- **Configurație gestionată (S9/S10)** — administratorii pot livra un set fix de servere prin `managed-mcp.json` și pot restrânge ce poate configura un utilizator cu `allowedMcpServers` / `deniedMcpServers`.

---

### Prep pentru S7

Temă de 5 minute: fiecare notează **ce din tot ce a construit până acum ar vrea să aibă și colegul de lângă, fără să-i explice nimic**. Uită-te la ce ai în `.claude/`: un `CLAUDE.md` (S2), un skill (S3), un subagent (S4), un hook (S5), o configurație MCP (S6). Fiecare a fost partajat altfel — sau n-a fost partajat deloc. Ai văzut fitilul azi: dacă trei oameni au configurat același server MCP în trei feluri, problema nu e serverul, e **distribuția**. În S7: **plugins** — un bundle versionat care livrează împreună skills, subagenți, comenzi, hooks și definiții MCP, instalabil cu o comandă. De la „am configurat" la „am publicat".
