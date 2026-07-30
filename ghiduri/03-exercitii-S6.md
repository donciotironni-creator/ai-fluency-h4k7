# Proiectul-școală LMS — Exerciții · S6

*Pentru participanți. Continuarea proiectului LMS început în S0–S5.*

> **Regula de siguranță:** un server MCP e un proces care rulează **cu privilegiile tale** și care poate ajunge la sisteme reale — baza ta de date, un API, internetul. Înainte să conectezi un server pe care nu l-ai scris tu: uită-te ce tool-uri expune și de unde vine. Și restrânge de la început — un user de bază de date read-only și câteva reguli de permisiuni (S1) fac mai mult decât toată bunăvoința. Nu pune niciodată parole sau token-uri în `.mcp.json`: fișierul se comite.

---

## S6 — De la copy-paste la acces

În S5 ai transformat o regulă ratată într-o garanție deterministă. Până acum, tot ce ai construit lucrează cu uneltele **proprii** ale Claude Code, în interiorul lui. Azi îi dai **unelte noi**: **MCP** (Model Context Protocol) conectează Claude la sisteme reale — începând cu cel mai relevant pentru tine, baza ta de date.

Criteriul care ține toată ziua: *Claude trebuie să raționeze iterativ pe un sistem viu → server MCP; e o operație one-shot cu output previzibil → un script chemat cu `Bash`.*

Ținta zilei, concret: la final ai o **configurație MCP funcțională, comisă în `.mcp.json`** pe repo-ul tău — minim serverul de bază de date, care răspunde la întrebări reale despre baza **ta** — plus regulile de permisiuni care îi limitează perimetrul. Cele șase exerciții urmează segmentele din tutorial.

---

## Prerechizite de mediu (≈15 min) — fă-le înainte de exerciții

Trei lucruri, verificate rapid. Peste tot mai jos înlocuiește `<Nume>` cu al tău (ex. Ionut → baza `LMS_Ionut`) și `<SERVER>` cu serverul de baze de date pe care ți-l dă facilitatorul (dacă baza e pe mașina ta, `<SERVER>` e `localhost`).

1. **Baza ta răspunde.** Ai deja baza `LMS_<Nume>` din S4, cu cel puțin o tabelă și un rând scris prin EF. Confirmă că te conectezi cu **contul tău de Windows**, fără parolă: connection string-ul e de forma `Server=<SERVER>;Database=LMS_<Nume>;Trusted_Connection=True;TrustServerCertificate=True`.
2. **`dotnet` merge.** Rulează `dotnet --list-sdks` și notează versiunile. Îți trebuie la exercițiul 3, calea A.
3. **`node` și `npm` merg.** Rulează `node -v` și `npm -v`. Îți trebuie la exercițiul 6.

> **Siguranță:** connection string-ul de mai sus **nu conține parolă** — autentificarea e cu contul tău de Windows. Ăsta e și motivul pentru care îl putem pune într-un fișier comis. Dacă la un moment dat lucrezi cu o bază care cere user și parolă, parola merge în variabilă de mediu și în fișier pui `${VAR}` — niciodată valoarea.

**Reușit dacă:** ai o bază `LMS_<Nume>` la care ajungi cu autentificare Windows, și `dotnet --list-sdks` + `node -v` întorc ceva.

---

### Exercițiul 1 — Triază sistemele: MCP sau script? (≈10 min)

**Antrenează:** criteriul care ține sesiunea (segmentele 1, 4).

Înainte să conectezi ceva, decide **ce** merită conectat. Nu tot ce e extern are nevoie de un server MCP — multe lucruri sunt deja acoperite de `Bash` sau de un skill din S3.

**Ce faci:**
1. Ia lista din prep-ul S5 (sistemele externe la care ai vrea ca Claude să ajungă). Dacă n-ai una, scrie trei acum: baza ta de date, repo-ul tău remote, un dashboard sau API pe care-l deschizi des.
2. Pentru fiecare, aplică testul: **poți numi întrebările** pe care Claude le-ar pune sistemului? („ce tabele are?", „care e cea mai mare?", „ce coloane are asta?") → **MCP**. Poți numi doar **comanda** pe care ai rula-o tu (`git log`, `dotnet test`) → **script**, chemat cu `Bash`, eventual împachetat într-un skill.
3. Pentru cel care rămâne MCP, scrie într-o frază **ce ai lăsa să facă acolo**: doar citire, sau și scriere? Ai nevoie de răspunsul asta la exercițiul 4.

**Reușit dacă:** ai cel puțin un sistem clasificat „MCP" cu întrebările numite, și cel puțin unul pe care l-ai respins conștient ca fiind treabă de script.

---

### Exercițiul 2 — Primul server, zero cod (≈15 min)

**Antrenează:** `claude mcp add`, scope-ul default, verificarea (segmentele 2, 3).

Începe cu un server care nu cere credențiale și nu poate face pagube. Scopul e mecanica: comanda, statusul, `/mcp`.

**Ce faci:**
1. Cere-i lui Claude să-ți dea comanda, în loc s-o cauți:
   > „Vreau să conectez la Claude Code un server MCP de **filesystem** (sau de browser automation), limitat la directorul acestui repo. Dă-mi comanda `claude mcp add` exactă pentru Windows, cu transport `stdio`, în scope `local`. Explică-mi ce face fiecare parte din comandă, inclusiv de ce e nevoie de `--`. Nu o rula tu — o rulez eu."
2. **Citește comanda înainte s-o rulezi.** Verifică: transportul e `stdio`? Directorul pe care-l dai serverului e chiar repo-ul tău, nu `C:\`? Există `--` înainte de comanda serverului?
3. Rulează-o, apoi verifică pe trei căi:
   - `claude mcp list` → serverul apare cu `✔ Connected`?
   - `claude mcp get <nume>` → configurația e cea pe care ai vrut-o?
   - în sesiune, `/mcp` → serverul apare, cu **câte tool-uri**?
4. Pune-i o întrebare care are nevoie de el, și observă că Claude cheamă o unealtă `mcp__...` în loc de `Read`/`Bash`.

**De ce contează:** ai adăugat serverul în scope `local` (default-ul) — adică în `~/.claude.json`, doar pentru tine, doar în proiectul asta. **Nu** e în repo. Ține minte asta pentru exercițiul 5.

**Reușit dacă:** un server apare `✔ Connected` în `claude mcp list`, îl vezi în `/mcp` cu tool-urile lui, și Claude a chemat cel puțin o unealtă venită de la el.

---

### Exercițiul 3 — Baza ta prin MCP (≈25 min)

**Antrenează:** miezul practic al zilei — Claude interoghează baza **ta** (segmentele 1, 3).

Ăsta e exercițiul pentru care există sesiunea. La final, îi pui întrebări în română despre baza ta și primești răspunsuri corecte, fără să scrii SQL.

Ai **două căi**. Alege una; a doua e plasa de siguranță.

#### Calea A — un server existent (mai rapid, dacă ai .NET 9)

Serverul `mssql-mcp` (terță parte, .NET, open-source: `github.com/Aaronontheweb/mssql-mcp`) se conectează la SQL Server cu **autentificare Windows** și expune trei tool-uri: `list_schemas`, `list_tables`, `execute_sql`. Ținta e `net9.0`, deci ai nevoie de SDK-ul 9 în `dotnet --list-sdks`. **Dacă nu-l ai, mergi pe calea B** — nu instala un SDK la curs.

1. Clonează-l **în afara repo-ului tău** (nu vrem codul lui în repo-ul de curs) și publică-l:
   ```
   git clone https://github.com/Aaronontheweb/mssql-mcp C:\tools\mssql-mcp-src
   dotnet publish C:\tools\mssql-mcp-src\src\MSSQL.MCP -c Release -o C:\tools\mssql-mcp
   ```
2. Conectează-l, cu connection string-ul **tău** (fără parolă — autentificare Windows):
   ```
   claude mcp add --env "MSSQL_CONNECTION_STRING=Server=<SERVER>;Database=LMS_<Nume>;Trusted_Connection=True;TrustServerCertificate=True" --transport stdio lms-db -- C:\tools\mssql-mcp\MSSQL.MCP.exe
   ```
   Atenție la două lucruri din tutorial: **`--`** înainte de executabil, și **numele serverului (`lms-db`) nu vine imediat după `--env`** — de asta e `--transport stdio` între ele.
3. **Uită-te la ce ai conectat, înainte să-l folosești.** `execute_sql` acceptă orice T-SQL, inclusiv `DROP`. Nu e o problemă acum (e baza ta de curs), dar e exact situația pe care o restrângi la exercițiul 4.

#### Calea B — îi ceri lui Claude un server minimal, read-only

Mai lent de scris, dar înțelegi tot codul și e read-only din construcție. Merge cu orice versiune de .NET sau cu Node.

> „Scrie-mi un server MCP minimal, pe transport `stdio`, care se conectează la baza mea SQL Server `LMS_<Nume>` de pe `<SERVER>` cu **autentificare Windows** (`Trusted_Connection=True`, fără parolă — connection string-ul îl citești din variabila de mediu `MSSQL_CONNECTION_STRING`). Expune **doar două tool-uri, ambele read-only**: `list_tables` (schema, nume, număr de rânduri) și `run_select`, care acceptă **doar** interogări `SELECT` — respinge orice altceva, explicit, cu un mesaj clar. Alege limbajul care merge cu ce am instalat (verifică `dotnet --list-sdks` și `node -v`) și pune serverul într-un folder separat, în afara repo-ului. **Arată-mi fișierul înainte să-l scrii.** Apoi dă-mi comanda `claude mcp add` care îl conectează, dar nu o rula tu."

Citește codul înainte de accept. Verifică în special: `run_select` chiar refuză non-`SELECT`? Connection string-ul e citit din mediu, nu hardcodat?

#### Ambele căi — verificarea care contează

1. `claude mcp list` → `lms-db` e `✔ Connected`. Dacă e `✘ Failed to connect`, cauzele tipice, în ordine: calea din comandă e greșită, connection string-ul are altă bază, sau contul tău nu are drepturi pe `LMS_<Nume>`.
2. `/mcp` → serverul apare cu tool-urile lui. **Zero tool-uri** la un server conectat înseamnă că pornește, dar nu declară nimic.
3. **Trei întrebări reale, în română**, despre baza ta. Nu inventa — întreabă ce chiar există acolo:
   - „Ce tabele am în baza mea și câte rânduri are fiecare?"
   - „Ce coloane are tabela pe care am creat-o în S4 și ce tipuri au?"
   - „Arată-mi ultimele 5 rânduri scrise, cele mai recente primele."
4. Observă **ce unelte cheamă** Claude și în ce ordine. La întrebarea a doua, de obicei întâi listează tabelele, apoi se uită la cea relevantă — asta e „raționamentul iterativ" din segmentul 1, văzut cu ochii tăi.

> ⚠️ **Nu cere `SELECT *` pe tabela cea mai mare.** Vei vedea avertismentul de output MCP (peste 10.000 de tokens) și contextul se umple degeaba. Cere numărători și eșantioane: „câte rânduri", „primele 5". Aceeași lecție ca la subagenți în S4: rezumate, nu dump-uri.

**Reușit dacă:** Claude a răspuns corect la trei întrebări despre baza **ta**, prin unelte MCP, iar tu poți arăta în transcript care unealtă a fost chemată pentru fiecare.

---

### Exercițiul 4 — Restrânge perimetrul (≈15 min)

**Antrenează:** cele două straturi de control (segmentul 5), pe firul de siguranță din S1.

Serverul tău de bază de date poate, în principiu, mai mult decât vrei să-i lași. „Serverul poate face X" nu înseamnă „Claude are voie să facă X" — sunt două straturi separate, și al doilea îl controlezi tu, în `settings.json`.

**Ce faci:**
1. Fă inventarul: `/mcp` → deschide serverul `lms-db` și **notează numele exacte** ale tool-urilor lui. Numele complet al unei unelte MCP e `mcp__<server>__<tool>` — ex. `mcp__lms-db__list_tables`.
2. Decide politica, pornind de la răspunsul tău din exercițiul 1 (doar citire, sau și scriere?). Tiparul recomandat: citirea permisă, SQL arbitrar pe `ask` sau `deny`.
3. Cere-i lui Claude să scrie regulile:
   > „Adaugă în `.claude/settings.json` reguli de permisiuni pentru serverul MCP `lms-db`: `allow` pe uneltele de citire (`list_tables`, `list_schemas`), și `deny` pe unealta care execută SQL arbitrar. Folosește forma `mcp__lms-db__<tool>`. Arată-mi diff-ul înainte."
4. **Verifică că regula chiar prinde.** Cere-i lui Claude ceva ce ar avea nevoie de unealta blocată („șterge tabela de test din baza mea") și observă refuzul. Apoi cere ceva permis și observă că trece fără prompt.

**Două capcane de reținut:**
- În `allow`, wildcard-ul merge **doar după prefixul literal `mcp__<server>__`**. `mcp__lms-db__get_*` e valid; `mcp__*` în `allow` e ignorat cu warning și nu aprobă nimic. În `deny` însă, `mcp__*` e valid și taie tot MCP-ul.
- Stratul 1 rămâne cel mai puternic: pe orice bază care contează, **user de bază de date cu drepturi minime**. O regulă de permisiune protejează sesiunea ta; un user read-only protejează baza de oricine.

**Reușit dacă:** ai reguli comise care permit citirea și blochează scrierea pe serverul tău de bază de date, și **ai demonstrat** că regula de `deny` se declanșează.

---

### Exercițiul 5 — De la tine la echipă: `.mcp.json` comis (≈15 min)

**Antrenează:** scope-urile și fișierul de echipă (segmentul 3). Aici se produce artefactul zilei.

Până acum serverul e în scope `local` — în `~/.claude.json`, doar la tine. Dacă cineva clonează repo-ul, nu primește nimic. Acum îl muți în scope `project`, adică în `.mcp.json`, comis.

**Ce faci:**
1. Cere-i lui Claude mutarea, cu grija pentru ce e specific fiecărui om:
   > „Mută serverul MCP `lms-db` din scope `local` în scope `project`, adică în `.mcp.json` în rădăcina repo-ului. Numele bazei și serverul diferă de la coleg la coleg, deci **nu le hardcoda**: folosește expansiune de variabile de mediu, cu default-uri rezonabile — `${SQL_SERVER:-localhost}` și `${LMS_DB}`. Arată-mi fișierul înainte să-l scrii. Spune-mi și ce variabile trebuie să-mi setez ca să meargă la mine."
2. **Citește `.mcp.json` înainte de accept.** Lista de verificare:
   - Zero parole, zero token-uri. (La noi e simplu: autentificare Windows.)
   - Numele bazei e `${LMS_DB}`, nu `LMS_Ionut`.
   - Căile către executabil: dacă e o cale absolută de pe mașina ta, e tot ceva specific — pune-o și pe ea în variabilă, sau notează în README că trebuie ajustată.
3. Scoate versiunea veche, ca să nu ai două definiții: `claude mcp remove lms-db` (scoate cea din `local`; reține precedența — `local` bate `project`, deci cât timp ambele există, se folosește cea locală).
4. Repornește sesiunea. Serverul din `.mcp.json` **nu pornește necerut** — Claude Code cere aprobare, și până atunci apare ca `⏸ Pending approval` în `claude mcp list`. Aprobă-l, apoi confirmă `✔ Connected`.
5. **Comite** (`chore: add lms-db MCP server to project config`). Comite și regulile de permisiuni din exercițiul 4, dacă nu le-ai comis deja.

> Dacă vrei să reiei decizia de aprobare (ai aprobat greșit, sau vrei să vezi din nou promptul): `claude mcp reset-project-choices`. La nivel de echipă, `enabledMcpjsonServers` în `settings.json` pre-aprobă servere anume, fără prompt.

**Reușit dacă:** ai un `.mcp.json` comis, fără nimic specific mașinii tale hardcodat, iar după o repornire serverul apare `✔ Connected`. Un coleg care clonează repo-ul și își setează două variabile de mediu are exact același acces.

---

### Exercițiul 6 (Capstone) — Serverul tău MCP, stdio minimal (≈20 min)

**Antrenează:** ce e de fapt un server MCP (segmentul 6).

Până acum ai **consumat** servere. Acum scrii unul — mic, dar real: un tool intern pe care doar echipa ta îl are.

**Alege ce expune.** Nu baza de date (ai deja). Candidați buni, mici și utili:
- convențiile de denumire ale echipei (tabele, proceduri, endpoint-uri), întoarse structurat;
- starea unui environment intern, citită din un fișier sau un endpoint;
- un calcul pe care îl faci des și îl greșești (zile lucrătoare între două date, conversie de coduri interne).

**Ce faci:**
1. Cere-i lui Claude serverul:
   > „Scrie-mi un server MCP minimal, pe transport `stdio`, în Node, care expune **un singur tool**: [descrie tool-ul: nume, ce parametri primește, ce întoarce]. Folosește pachetul `@modelcontextprotocol/server` (**nu** `@modelcontextprotocol/sdk` — ăla e numele vechi) și `zod` pentru schema de parametri. Pune-l într-un folder separat. **Descrierea uneltei e interfața** — scrie-o ca să știe Claude când s-o cheme, ca la skills în S3. Arată-mi fișierul înainte să-l scrii."
2. Citește codul. E scurt: un `new McpServer(...)`, un `server.registerTool(nume, { description, inputSchema }, handler)`, și un `server.connect(new StdioServerTransport())`. Dacă nu înțelegi o linie, întreabă — e miezul exercițiului.
3. Conectează-l și verifică pe cei trei pași din tutorial:
   ```
   claude mcp add --transport stdio <nume> -- node C:\cale\absoluta\server.js
   claude mcp list      # ✔ Connected?
   ```
   apoi `/mcp` → apare cu **1 tool**? Și în final: pune o întrebare pe care **doar** unealta ta poate răspunde, și verifică în transcript că a fost chemată.
4. **Testul care contează:** dacă Claude **nu** cheamă unealta, nu umbla la implementare — reglează **descrierea** ei. Aceeași lecție ca la skills (S3) și subagenți (S4): descrierea e interfața de invocare.

**Alternativă, dacă vrei scaffolding în loc de scris de la zero:** există un plugin oficial — `/plugin install mcp-server-dev@claude-plugins-official`, apoi `/mcp-server-dev:build-mcp-server`, care te întreabă ce vrei și generează structura.

**Extensie (doar dacă ai terminat):** strică intenționat descrierea uneltei (fă-o vagă: „procesează date") și observă că Claude nu o mai cheamă. Repar-o. Ăsta e cel mai rapid mod de a simți de ce descrierea e interfața.

**Reușit dacă:** ai un server stdio propriu, `✔ Connected`, cu un tool pe care Claude l-a chemat singur la o întrebare potrivită.

---

## Artefact & schimb de practici

La finalul sesiunii, două lucruri concrete.

**1. Artefactul (deja produs în exerciții).** Nu mai scrii nimic separat — îl ai deja:
- O configurație MCP funcțională pentru un flux propriu: **`.mcp.json` comis** în repo, cu cel puțin serverul de bază de date, plus regulile de permisiuni care îi limitează uneltele. Oricine clonează repo-ul primește același acces, fără instrucțiuni de setup.

**2. Schimbul de practici (15–20 min, ~2 min/persoană).** Pe rând, fiecare spune grupului:
- Ce a conectat și de ce **acela** primul. Ce triaj a făcut la Ex. 1: ce a rămas MCP și ce s-a dovedit script.
- Un moment „aici s-a văzut diferența" — fie o întrebare la care Claude a răspuns corect pe baza lui, fie un perimetru pe care l-a restrâns conștient.

Notați aceste puncte în docul partajat **„AI Wins & Fails"**. Coloana „Candidat standard?" e cea din care, în Faza 3, alegeți ce servere MCP intră în setul de referință al echipei.

---

### Notă pentru facilitator

- **Ex. 3 e miezul — protejează-l.** E momentul în care fiecare vede Claude interogându-și propria bază. Dacă cineva rămâne blocat pe calea A (SDK lipsă, build eșuat), mută-l pe calea B fără discuție; nu lăsați o instalare să mănânce 20 de minute.
- **Testează calea A tu, înainte de curs.** Clonare + `dotnet publish` + un `claude mcp add` reușit pe baza ta. Dacă nu merge la tine, prezintă direct calea B ca fiind singura, și ține calea A ca notă.
- **Ex. 1 e scurt și decizional — nu-l sări.** E singurul care oprește oamenii să vrea un server MCP pentru fiecare unealtă. Cine ratează triajul ajunge cu șase servere pornite din care folosește unul.
- **Dacă timpul strânge**, comprimă Ex. 2 (mecanica se vede repede) și fă Ex. 6 demo colectiv în loc de individual. Nu comprima Ex. 3 și Ex. 5 — fără Ex. 5 nu există artefact.
- **Capcana zilei: scope-ul.** Aproape sigur cineva va adăuga serverul cu default-ul (`local`) și se va mira că nu e în repo. Prinde-o la Ex. 5, pe tabelul cu cele trei scope-uri.
- **A doua capcană: `--` lipsă.** Dacă un `claude mcp add` cade cu eroare de opțiune necunoscută, verifică `--` întâi.
- **Nu deschide discuția de securitate în profunzime.** Menționează prompt injection și datele care ies din perimetru, spune „S9", și treci. Ziua asta e despre acces și perimetru, nu despre modelul de amenințare.
- **Zero credențiale**, tot timpul. Bazele de curs merg pe autentificare Windows, deci n-ar trebui să apară parole nicăieri. Dacă cineva scrie una într-un fișier sau în chat, oprește-te 1 minut pe distincția „variabilă de mediu vs. fișier comis".
- Claude Code se schimbă des: un `/help` și un `claude mcp --help` la începutul sesiunii pentru flag-urile curente. Reține: **SSE e deprecat** (remote → `http`), și scope-urile se numesc `local`/`project`/`user` (nu `project`/`global`, ca în docurile mai vechi).
