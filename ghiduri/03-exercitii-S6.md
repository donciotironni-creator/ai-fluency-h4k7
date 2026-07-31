# Tur de patru servere MCP — Exerciții · S6

*Pentru participanți. Continuarea programului AI Fluency, după S0–S5.*

> **Regula de siguranță:** un server MCP e un proces care rulează **cu privilegiile tale** și care poate ajunge la sisteme reale — Jira, un browser, API-ul de pontaj, baza ta. Înainte să conectezi un server pe care nu l-ai scris tu: uită-te ce tool-uri expune și de unde vine. Și restrânge de la început — un token read-only și câteva reguli de permisiuni (S1) fac mai mult decât toată bunăvoința. Nu pune niciodată parole sau token-uri în `.mcp.json`: fișierul se comite; folosește `${VAR}`.

---

## S6 — De la copy-paste la acces

În S5 ai transformat o regulă ratată într-o garanție deterministă. Până acum, tot ce ai construit lucrează cu uneltele **proprii** ale Claude Code, în interiorul lui. Azi îi dai **unelte noi**: **MCP** (Model Context Protocol) conectează Claude la sisteme reale. Conectezi patru servere, în ordine crescătoare de implicare — Jira, Playwright, un server custom clonat din git, și unul pe care-l scrii tu.

Criteriul care ține toată ziua: *Claude trebuie să raționeze iterativ pe un sistem viu → server MCP; e o operație one-shot cu output previzibil → un script chemat cu `Bash`.*

Ținta zilei, concret: la final ai **patru servere conectate** (Jira, Playwright, tempo, serverul tău) și o **configurație comisă în `.mcp.json`** pe repo-ul tău — plus regulile de permisiuni care îi limitează perimetrul. Cele șase exerciții urmează segmentele din tutorial.

> **Recuperare rapidă (ai lipsit / intri târziu):** minimul ca să poți intra în S7 e (a) cel puțin un server MCP conectat care răspunde la o întrebare reală, și (b) un `.mcp.json` comis în repo. Dacă nu le ai, fă doar **Ex. 3** (tempo-mcp) + **Ex. 6** (mutarea în `.mcp.json` și commit). Restul (Jira din Ex. 1, Playwright din Ex. 2, permisiunile din Ex. 4, serverul propriu din Ex. 5) le poți relua ulterior — Ex. 4 în special merită recuperat înainte de S9.

---

## Prerechizite de mediu (≈15 min) — fă-le înainte de exerciții

Patru lucruri, verificate rapid.

1. **`node` și `npm` merg.** Rulează `node -v` (minim 22 pentru tempo) și `npm -v`. Îți trebuie la Ex. 2, 3 și 5.
2. **`git` merge.** `git --version`. Îți trebuie ca să clonezi tempo-mcp la Ex. 3.
3. **Cont Jira.** Confirmă că te loghezi în Jira în browser — la Ex. 1 autentificarea e prin OAuth, cu contul tău.
4. **Token Tempo.** Generează-l acum: **Tempo → Settings → Data Access → API integration → Generate token.** Salvează-l undeva sigur (nu în repo). Îți trebuie la Ex. 3.

> **Siguranță:** token-ul Tempo e o credențială reală. Nu-l lipi în `.mcp.json` și nu-l comite. La Ex. 3 îl dai prin `--env`, iar la Ex. 6 îl referențiezi cu `${TEMPO_TOKEN}` — niciodată valoarea.

**Reușit dacă:** `node -v` întoarce ≥22, `git --version` merge, te loghezi în Jira, și ai un token Tempo generat.

---

### Exercițiul 1 — Jira MCP: remote, cu OAuth (≈15 min)

**Antrenează:** server remote, autentificare OAuth în browser (segmentele 2, 3).

Primul server. Ideea: un serviciu cloud, adăugat **fără credențiale**, autentificat pe urmă prin browser.

```
claude mcp add --transport http atlassian https://mcp.atlassian.com/v1/mcp/authv2
```

**Ce faci:**
1. Rulează comanda. `claude mcp list` → serverul apare `! Needs authentication`. Normal — `add` nu te loghează.
2. În sesiune: `/mcp` → deschide serverul `atlassian` → **sign-in în browser** (OAuth). După autentificare, `claude mcp list` → `✔ Connected`.
3. **Trei întrebări reale**, în română: „Ce tickete deschise am eu în sprintul curent?" · „Rezumă-mi ticketul [cod real] și subtask-urile lui." · **„Care e accountId-ul meu Jira?"**
4. **Notează-ți `accountId`-ul.** E Jira account ID (nu email) și îți trebuie la Ex. 3 ca să poți ponta.

> **De ce HTTP, nu stdio:** e un serviciu remote și e singurul transport care suportă OAuth. Token-urile se stochează și se reîmprospătează singure — nu le mai introduci.

**Reușit dacă:** `atlassian` e `✔ Connected`, Claude a răspuns la trei întrebări despre Jira-ul tău, și ți-ai notat accountId-ul.

---

### Exercițiul 2 — Playwright MCP: un browser pentru Claude (≈15 min)

**Antrenează:** server stdio dintr-un pachet npm, și un „de ce" concret (segmentul 4).

Al doilea server. Ideea: `stdio` dintr-un pachet npm, zero cont. Iar „de ce" contează pentru o echipă SQL care se mută spre full-stack: la SQL vezi **datele**; cu Playwright vezi **ce vede utilizatorul** din aceleași date.

```
claude mcp add playwright npx @playwright/mcp@latest
```

**Ce faci:**
1. Rulează comanda. Primul apel poate descărca browserul — răbdare. `claude mcp list` → `✔ Connected`.
2. Pune-l să navigheze ceva **real**: o pagină a aplicației tale (`localhost`), sau o pagină publică. „Deschide [URL], spune-mi ce titlu are și ce butoane principale vezi."
3. Leagă-l de date: dacă ai o aplicație pe baza ta, „mergi la pagina X și verifică că apare rândul pe care l-am modificat". Sau cere „generează-mi un test Playwright pentru fluxul ăsta".

> **Ce reține:** Playwright lucrează pe **accessibility tree** (structură), nu pe screenshot-uri. E ieftin și determinist — exact tema MCP: date structurate, nu pixeli de ghicit.

**Reușit dacă:** `playwright` e `✔ Connected`, și Claude a navigat o pagină reală și ți-a raportat ce a găsit acolo.

---

### Exercițiul 3 — tempo-mcp: un server custom, clonat din git (≈25 min)

**Antrenează:** build-ul unui server custom din sursă + momentul cross-tool (segmentul 5).

Al treilea server, și miezul practic al zilei. Prima dată când nu conectezi ceva de-a gata, ci **construiești** serverul din cod sursă și-l legi cu Jira.

**1. Clonează și build** (în afara repo-ului tău de curs — nu vrem codul lui în repo):

```
git clone https://github.com/donciotironni-creator/tempo-mcp
cd tempo-mcp
npm install
npm run build
```

Dacă sari `npm run build`, pasul următor cade cu „cannot find module": ordinea e clone → install → build.

**2. Conectează, cu token-ul din Prep:**

```
claude mcp add \
  --env TEMPO_TOKEN=<token-ul tău> \
  --env TEMPO_BASE_URL=https://api.eu.tempo.io \
  --transport stdio tempo -- node C:/cale/tempo-mcp/dist/index.js
```

Două lucruri din tutorial: **`--`** înainte de `node`, și **numele serverului (`tempo`) nu vine imediat după `--env`** — de asta e `--transport stdio` între ele. (EU: `api.eu.tempo.io`. US: `api.tempo.io`.)

**3. Momentul cross-tool — folosește Jira din Ex. 1:**
1. `claude mcp list` → `tempo` e `✔ Connected`. `/mcp` → apare cu ~81 de tool-uri.
2. Pontarea cere `authorAccountId` = Jira account ID (cel notat la Ex. 1). Cere-i lui Claude: „loghează 1h pe ticketul [cod], azi, cu descrierea «[ce ai lucrat]», folosind accountId-ul meu."
3. Observă cum Claude leagă cele două servere: ia accountId-ul (din Jira sau din ce i-ai spus) și cheamă `tempo_worklog_create`. Fără copy-paste între sisteme.

> ⚠️ **Nu cere `tempo_worklog_list` pe tot anul.** Vei vedea avertismentul de output MCP (peste 10.000 de tokens) și contextul se umple degeaba. Cere intervale scurte și numărători. Aceeași lecție ca la subagenți în S4: rezumate, nu dump-uri.

**Reușit dacă:** ai clonat și buildat tempo-mcp, e `✔ Connected`, și ai logat o oră reală de pontaj folosind accountId-ul din Jira.

---

### Exercițiul 4 — Restrânge perimetrul (≈15 min)

**Antrenează:** cele două straturi de control (segmentul 6), pe firul de siguranță din S1.

Serverele tale pot, în principiu, mai mult decât vrei să le lași. tempo expune `tempo_worklog_delete`, Jira expune `createJiraIssue` și `editJiraIssue`. „Serverul poate face X" nu înseamnă „Claude are voie" — sunt două straturi, și al doilea îl controlezi tu, în `settings.json`.

**Ce faci:**
1. Fă inventarul: `/mcp` → deschide `tempo` și **notează numele** tool-urilor de scriere/ștergere. Numele complet e `mcp__<server>__<tool>` — ex. `mcp__tempo__tempo_worklog_delete`.
2. Decide politica: citirea permisă, scrierea/ștergerea pe `ask` sau `deny`.
3. Cere-i lui Claude să scrie regulile:
   > „Adaugă în `.claude/settings.json` reguli de permisiuni pentru serverul MCP `tempo`: `allow` pe uneltele de citire (`tempo_worklog_list`, `tempo_worklog_get`, `tempo_worklog_search`), și `deny` pe `tempo_worklog_delete`. Folosește forma `mcp__tempo__<tool>`. Arată-mi diff-ul înainte."
4. **Verifică că regula chiar prinde.** Cere-i lui Claude să șteargă un worklog și observă refuzul. Apoi cere o listare permisă și observă că trece fără prompt.

**Două capcane de reținut:**
- În `allow`, wildcard-ul merge **doar după prefixul literal `mcp__<server>__`**. `mcp__tempo__tempo_worklog_*` e valid; `mcp__*` în `allow` e ignorat cu warning. În `deny` însă, `mcp__*` e valid și taie tot MCP-ul.
- Stratul 1 rămâne cel mai puternic: pentru un serviciu real, un **token read-only** nu poate scrie, indiferent ce cere modelul. O regulă de permisiune protejează sesiunea ta; un token read-only protejează sistemul de oricine.

**Reușit dacă:** ai reguli comise care permit citirea și blochează ștergerea pe `tempo`, și **ai demonstrat** că regula de `deny` se declanșează.

---

### Exercițiul 5 — Serverul tău MCP, pe SQL (≈20 min)

**Antrenează:** ce e de fapt un server MCP (capstone, segmentul 7).

Până acum ai **consumat** servere. Acum scrii unul — mic, dar real. **Nu** un clone de `sql-recon` (ai deja un MCP de SQL matur). Ceva mic și al echipei. Alege una din trei:

- **`tsql-snippets`** ⭐ — `get_snippet(pattern)` întoarce patternul binecuvântat: MERGE upsert, paging `OFFSET/FETCH`, `TRY/CATCH`. Pură logică, zero I/O — cel mai curat de scris și verificat.
- `proc-catalog` — `find_proc(keyword)` scanează un folder de `.sql`, întoarce fișierul și semnătura. Atinge filesystem.
- `sql-standards` — `validate_object_name(name, type)` verifică `usp_`, `vw_`, `fn_`.

**Ce faci:**
1. Cere-i lui Claude serverul (exemplu pe `tsql-snippets`):
   > „Scrie-mi un server MCP minimal, pe transport `stdio`, în Node, care expune **un singur tool**: `get_snippet(pattern)`, unde `pattern` e unul din `upsert` / `paging` / `trycatch`, și întoarce patternul T-SQL corespunzător. Folosește pachetul `@modelcontextprotocol/server` (**nu** `@modelcontextprotocol/sdk` — ăla e numele vechi) și `zod` pentru schema de parametri. Pune-l într-un folder separat. **Descrierea uneltei e interfața** — scrie-o ca să știe Claude când s-o cheme, ca la skills în S3. Arată-mi fișierul înainte să-l scrii."
2. Citește codul. E scurt: un `new McpServer(...)`, un `server.registerTool(nume, { description, inputSchema }, handler)`, și un `server.connect(new StdioServerTransport())`.
3. Conectează-l și verifică pe cei trei pași din tutorial:
   ```
   claude mcp add --transport stdio <nume> -- node C:\cale\absoluta\server.js
   claude mcp list      # ✔ Connected?
   ```
   apoi `/mcp` → apare cu **1 tool**? Și în final: pune o întrebare pe care **doar** unealta ta poate răspunde („dă-mi patternul de upsert al echipei"), și verifică în transcript că a fost chemată.
4. **Testul care contează:** dacă Claude **nu** cheamă unealta, nu umbla la implementare — reglează **descrierea** ei. Aceeași lecție ca la skills (S3) și subagenți (S4): descrierea e interfața de invocare.

**Alternativă, dacă vrei scaffolding în loc de scris de la zero:** există un plugin oficial — `/plugin install mcp-server-dev@claude-plugins-official`, apoi `/mcp-server-dev:build-mcp-server`, care te întreabă ce vrei și generează structura.

**Extensie (doar dacă ai terminat):** strică intenționat descrierea uneltei (fă-o vagă: „procesează date") și observă că Claude nu o mai cheamă. Repar-o. Ăsta e cel mai rapid mod de a simți de ce descrierea e interfața.

**Reușit dacă:** ai un server stdio propriu, `✔ Connected`, cu un tool pe care Claude l-a chemat singur la o întrebare potrivită.

---

### Exercițiul 6 — De la tine la echipă: `.mcp.json` comis (≈15 min)

**Antrenează:** scope-urile și fișierul de echipă (segmentul 2). Aici se produce artefactul zilei.

Până acum serverele sunt în scope `local` — în `~/.claude.json`, doar la tine. Dacă cineva clonează repo-ul, nu primește nimic. Acum muți serverul tempo (și, opțional, serverul tău propriu) în scope `project`, adică în `.mcp.json`, comis.

**Ce faci:**
1. Cere-i lui Claude mutarea, cu grija pentru ce e specific fiecărui om:
   > „Mută serverul MCP `tempo` din scope `local` în scope `project`, adică în `.mcp.json` în rădăcina repo-ului. Token-ul și calea către server diferă de la coleg la coleg, deci **nu le hardcoda**: folosește expansiune de variabile de mediu — `${TEMPO_TOKEN}`, `${TEMPO_MCP_DIR}`, și `${TEMPO_BASE_URL:-https://api.eu.tempo.io}`. Arată-mi fișierul înainte să-l scrii. Spune-mi și ce variabile trebuie să-mi setez ca să meargă la mine."
2. **Citește `.mcp.json` înainte de accept.** Zero token-uri, zero căi absolute de pe mașina ta. Token-ul e `${TEMPO_TOKEN}`, calea e `${TEMPO_MCP_DIR}`.
3. Scoate versiunea veche, ca să nu ai două definiții: `claude mcp remove tempo` (scoate cea din `local`; reține precedența — `local` bate `project`).
4. Repornește sesiunea. Serverul din `.mcp.json` **nu pornește necerut** — apare ca `⏸ Pending approval`. Aprobă-l, apoi confirmă `✔ Connected`.
5. **Comite** (`chore: add tempo MCP server to project config`). Comite și regulile de permisiuni din Ex. 4.

> Dacă vrei să reiei decizia de aprobare: `claude mcp reset-project-choices`. La nivel de echipă, `enabledMcpjsonServers` în `settings.json` pre-aprobă servere anume, fără prompt.

**Reușit dacă:** ai un `.mcp.json` comis, fără token sau cale specifică mașinii tale hardcodate, iar după o repornire serverul apare `✔ Connected`. Un coleg care clonează repo-ul, buildează tempo-mcp și își setează variabilele are exact aceeași configurație.

---

## Artefact & schimb de practici

La finalul sesiunii, două lucruri concrete.

**1. Artefactul (deja produs în exerciții).** Nu mai scrii nimic separat — îl ai deja:
- Un `.mcp.json` **comis** în repo, cu cel puțin serverul tempo și serverul propriu, token-uri și căi ca `${VAR}`, plus regulile de permisiuni care îi limitează uneltele. Oricine clonează repo-ul primește aceeași configurație — mai puțin token-ul lui personal și build-ul local al tempo.

**2. Schimbul de practici (15–20 min, ~2 min/persoană).** Pe rând, fiecare spune grupului:
- Care server i-a fost cel mai util și de ce **acela**. Ce triaj a făcut: ce a rămas MCP și ce s-ar fi rezolvat cu un script.
- Un moment „aici s-a văzut diferența" — momentul cross-tool Jira→tempo, un UI verificat cu Playwright, sau un perimetru restrâns conștient.

Notați aceste puncte în docul partajat **„AI Wins & Fails"**. Coloana „Candidat standard?" e cea din care, în Faza 3, alegeți ce servere MCP intră în setul de referință al echipei.

---

### Notă pentru facilitator

- **Ex. 3 e miezul — protejează-l.** E momentul cross-tool Jira→tempo, plus primul server construit din sursă. Dacă cineva rămâne blocat pe build (Node vechi, `npm run build` eșuat), rezolvă-l rapid; nu lăsați o instalare să mănânce 20 de minute.
- **Testează tot turul tu, înainte de curs.** Jira (endpoint + OAuth), Playwright (`npx`), și mai ales tempo — clone + `npm install` + `npm run build` + un `claude mcp add` reușit cu token-ul tău. Reverifică endpointul Jira pe pagina oficială Atlassian; a migrat de la SSE la HTTP.
- **Ex. 1 dă cheia pentru Ex. 3.** AccountId-ul din Jira e input pentru pontaj. Cine sare Ex. 1 se împiedică la Ex. 3 — asigură-te că fiecare și-l notează.
- **Dacă timpul strânge**, comprimă Ex. 2 (Playwright se vede repede) și fă Ex. 5 demo colectiv în loc de individual. Nu comprima Ex. 3 și Ex. 6 — fără Ex. 6 nu există artefact.
- **Capcana zilei: scope-ul.** Aproape sigur cineva va adăuga serverele cu default-ul (`local`) și se va mira că nu-s în repo. Prinde-o la Ex. 6, pe tabelul cu cele trei scope-uri.
- **A doua capcană: `--` lipsă** (la tempo, Playwright, serverul propriu). Dacă un `claude mcp add` cade cu „unknown option", verifică `--` întâi.
- **A treia: build sărit la tempo.** `node dist/index.js` cade cu „cannot find module" fără `npm run build`.
- **Nu deschide discuția de securitate în profunzime.** Menționează prompt injection și datele care ies din perimetru (Jira/tempo sunt remote), spune „S9", și treci.
- **Token-ul Tempo e credențială reală** — spre deosebire de bazele de curs pe autentificare Windows. Insistă: `--env` la conectare, `${TEMPO_TOKEN}` în fișierul comis, niciodată valoarea. Dacă cineva îl lipește în `.mcp.json`, oprește-te 1 minut pe distincția „variabilă de mediu vs. fișier comis".
- Claude Code se schimbă des: un `/help` și un `claude mcp --help` la începutul sesiunii pentru flag-urile curente. Reține: **SSE e deprecat** (remote → `http`), și scope-urile se numesc `local`/`project`/`user` (nu `project`/`global`, ca în docurile mai vechi).
