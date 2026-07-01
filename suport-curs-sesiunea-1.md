# Suport de curs — Sesiunea 1
## Prima zi cu Claude: de la SQL developer la AI-assisted developer

**Echipa:** Dev SQL (BufferSap / SMT-FAT-SQLB01) · **Trainer:** Ciotir Ionut · **Durată:** ~2,5–3 h
**Format:** Tutorial (~60') → Lucru aplicat (~90') → Harta ecosistemului (~10') → Schimb de practici (~20')

> **Scopul sesiunii:** la final, fiecare a făcut **3 lucruri reale și utile** cu Claude pe propria muncă SQL, cunoaște **câteva comenzi de bază**, și înțelege cum folosim Claude astfel încât să respecte **standardele echipei noastre** — nu exemple de jucărie, ci cod ca al nostru.

---

## De ce sesiunea asta, și de ce acum

Echipa trece de la SQL pur spre full-stack cu AI. Nu învățăm „un tool care se schimbă săptămânal”, ci un **mod de a lucra cu Claude** care rămâne valabil indiferent ce model sau buton se schimbă. Principiul: Claude nu e un autocomplete și nici un Google mai deștept — e un **coleg junior foarte rapid și foarte citit**, pe care tu îl conduci și al cărui rezultat tu îl verifici și ți-l asumi.

Regula de aur a acestei echipe rămâne valabilă și cu AI: **correctness > performance > cleverness**. Claude scrie repede; responsabilitatea rămâne a noastră.

### Obiective de învățare (măsurabile)
La finalul sesiunii, fiecare participant:
1. Poate explica, în cuvintele lui, cele 4 momente ale lucrului cu Claude (delegare → descriere → discernământ → diligență).
2. A folosit Claude pe **o procedură / query reală** din munca lui (documentare, review, optimizare).
3. Cunoaște și a folosit **cel puțin 5 comenzi de bază** + `@fișier`.
4. A văzut cum Claude produce cod **în standardul echipei** (header, logging, reguli).
5. Pleacă cu **un artefact personal**: un „cheat card” + o procedură reală documentată/revizuită.

---

## Prerechizite — de trimis echipei cu o zi înainte

**Obligatoriu pentru toți — de făcut ÎNAINTE de sesiune (nu în timpul ei):**

1. **Cont Claude** (Pro / Team / Enterprise) — necesar și pentru login-ul din Claude Code.
2. **Claude Code instalat și logat local.** Instalare (o singură comandă):
   ```bash
   # macOS / Linux / WSL
   curl -fsSL https://claude.ai/install.sh | sh
   # sau, pe orice sistem, cu npm:
   npm install -g @anthropic-ai/claude-code
   # verificare:
   claude --version
   ```
   La prima rulare îți cere să te loghezi cu contul Claude (fără cheie API dacă ești pe plan Pro/Team/Enterprise). **Verifică că `claude --version` merge înainte de sesiune** — nu pierdem timpul de curs pe instalări.
3. **Repo-ul de lucru clonat local**, cel care conține skill-ul `sql-enterprise` / `CLAUDE.md` (ca să demonstrăm în 1.4 că „Claude știe standardele noastre”).
4. **Un obiect real, dar NEsensibil**, din munca ta: o procedură stocată sau un query pe care le cunoști bine (de preferat din DEV). Ex: o variantă simplificată a unui sync, un raport, o procedură de pe care lucrezi acum.

> Lucrăm azi **în Claude Code** (toți îl aveți instalat). `claude.ai` din browser rămâne pentru întrebări rapide fără repo, dar mediul de lucru al echipei este Claude Code.

> ⚠️ **Înainte de sesiune, citește Anexa 2 (Ce NU trimiți niciodată).** Lucrăm în distribuție farma — datele reale de clienți/stocuri și credențialele nu ies niciodată din mediul nostru. Aduceți obiecte din DEV, curățate.

---

# PARTEA 1 — Tutorial (~60 min)

## 1.1 Modelul mental: bucla celor 4D, pe un exemplu SQL (15')

Un singur cadru de reținut. Îl demonstrăm live pe un query lent, nu pe teorie.

| Pas | Întrebarea | Pe exemplul nostru SQL |
|-----|-----------|------------------------|
| **1. Delegare** | Merită AI aici? Ce parte îi dau, ce țin la mine? | „Am un query lent pe `[trans].[WarehouseStock]`. Îi cer lui Claude ipoteze de optimizare — dar decizia de a atinge PROD rămâne a mea.” |
| **2. Descriere** | Cât de clar îi spun ce vreau + ce context are nevoie? | Îi dau query-ul, planul de execuție (dacă îl am) și **standardele noastre**: fără `SELECT *`, tipuri care se potrivesc în JOIN, etc. |
| **3. Discernământ** | E bun ce mi-a dat? Unde greșește? | Verific: respectă regulile? Propunerea de index e justificată sau e „ghicit”? A inventat o coloană? |
| **4. Diligență** | Pot să-mi pun numele pe asta? | Testez în DEV, validez în UAT, trec prin code review. **„Claude a zis așa” nu e niciodată o scuză.** |

**Demonstrație live (trainerul):** ia un query real simplu, parcurge cei 4 pași cu voce tare. Ideea de transmis: pașii 2 și 3 (descriere + verificare) sunt „skill-urile de prompting” — dar pașii 1 și 4 (ce delegăm și ce ne asumăm) sunt la fel de importanți și acolo greșește lumea.

## 1.2 Cele două fețe ale lui Claude (10')

| | **claude.ai** (browser) | **Claude Code** (terminal / IDE) |
|--|------------------------|----------------------------------|
| Unde | Oriunde, fără setup | În repo-ul tău, lângă cod |
| Bun pentru | întrebări, explicații, brainstorm, schițe | citește fișiere, rulează comenzi, modifică cod, **știe standardele noastre** |
| Cum îi dai context | copiezi text, sau **Projects** cu instrucțiuni | vede fișierele direct cu `@fișier`, plus `CLAUDE.md` |
| Rolul în tranziția noastră | întrebări rapide, fără repo | **mediul nostru de lucru — pasul spre full-stack** |

Azi lucrăm **integral în Claude Code** (toți îl aveți instalat și logat). Deschideți un terminal în folderul repo-ului și scrieți `claude`. `claude.ai` din browser e util pentru o întrebare rapidă când nu ești în cod, dar restul sesiunii e în Claude Code.

## 1.3 Comenzile de bază — setul minim (15')

Nu învățăm 60 de comenzi. Doar cele pe care le folosești din prima zi. (Scrie `/` în Claude Code ca să le vezi pe toate — variază după versiune.)

| Comandă | Ce face | Când o folosești |
|---------|---------|------------------|
| `claude` | pornește o sesiune în folderul curent | la început, în folderul repo-ului |
| `/init` | scanează proiectul și creează `CLAUDE.md` (memoria proiectului) | o singură dată, la setup |
| `/help` | listează comenzile disponibile | când nu-ți amintești o comandă |
| `@fisier.sql` | aduce un fișier în context | **în loc de copy-paste** — mai curat, apare în audit |
| `/clear` | șterge conversația, context curat | când începi un **task nou** (contextul vechi încurcă) |
| `/compact` | comprimă istoricul, eliberează context | când sesiunea devine lungă (la 20-30 min de lucru) |
| `/model` | schimbă modelul | task greu (raționament) vs. task simplu (viteză) |
| `/review` | code review pe modificări | înainte să dai ceva mai departe |

**De știut, onest:**
- Comenzile **consumă token-i** — nu sunt gratis (până și `/compact` costă puțin context).
- O comandă rulează în **contextul curent**, nu într-unul curat (de-aia există `/clear`).
- Pe lângă comenzi built-in, `@fișier` și limbajul natural fac 80% din treabă la început. „Revizuiește modificările după standardele noastre” funcționează la fel de bine ca o comandă.

## 1.4 Superputerea noastră: Claude cunoaște standardele echipei (15')

Aici e diferența între „AI generic” și „AI care ne folosește nouă”.

Am scris standardele noastre — **formatul de header, pattern-ul de logging cu `RunId`, regulile de naming, ce e interzis** — într-un fișier pe care Claude îl citește automat (un *skill* / `CLAUDE.md`). Rezultatul: când ceri o procedură, iese **în formatul nostru**, nu într-unul oarecare de pe internet.

**Demonstrație (before / after):**
- *Before* (fără context): „scrie-mi o procedură care sincronizează un stoc” → cod generic, fără header-ul nostru, poate cu `SELECT *`.
- *After* (cu standardele încărcate): aceeași cerere → procedură cu header-ul `[Create] Ciotir Ionut ...`, `SET NOCOUNT ON`, `TRY/CATCH` cu logare în `logs.ProcError`, `RunId`, fără `SELECT *`.

**Ideea de transmis:** cu cât îi dăm mai bine contextul o dată (standardele, serverul `SMT-FAT-SQLB01`, baza `BufferSap`, pattern-urile noastre), cu atât prompturile de zi cu zi devin mai scurte și rezultatul mai bun. Ăsta e „context engineering” — subiectul unei sesiuni viitoare, dar îl simțim de azi.

> **Cum se numește, de fapt:** fișierul cu regulile noastre pe care Claude îl aplică automat este un **Skill** (`.claude/skills/sql-enterprise/SKILL.md`). Îl poți chema explicit cu `/sql-enterprise`, sau Claude îl folosește singur când vede un task SQL. E prima dintre cele patru cărămizi ale ecosistemului (skills, MCP, agenți, plugins) — pe care le vezi la finalul sesiunii — și e **deja a voastră**.

---

# PARTEA 2 — Lucru aplicat (~90 min)

Fiecare lucrează pe **obiectul real, curățat**, pe care l-a adus. Trei exerciții, în dificultate crescătoare. Prompturile de mai jos sunt de copiat și adaptat.

> Toate prompturile presupun că lipești obiectul tău la final. Dacă folosești skill-ul `sql-enterprise` / `CLAUDE.md`, poți scoate detaliile de standard din prompt — Claude le știe deja.

## Exercițiul A — Documentează & explică o procedură reală (25')
**Competențe: Descriere + Discernământ.** Rezultat imediat util (documentăm oricum în Confluence).

**Prompt de pornit:**
```
Ești dezvoltator SQL Server senior în echipa noastră (SQL 2017+, server SMT-FAT-SQLB01, baza BufferSap).
Îți dau o procedură stocată. Fă trei lucruri:

1) Explică-mi în română, pe scurt (max 8 rânduri), ce face și în ce flux se încadrează.
2) Verifică dacă are header-ul standard al echipei. Dacă lipsește sau e incomplet, generează-l:
   format cu liniile [Create]/[Update]/[Modify], autor "Ciotir Ionut", dată DD.MM.YYYY,
   SERVER: SMT-FAT-SQLB01, BD: BufferSap, plus un exemplu EXEC realist.
3) Scrie o schiță de pagină de Confluence: scop, parametri, tabele atinse,
   ce loghează (logs.*), riscuri și dependențe.

Procedura:
<lipești aici>
```

**De verificat (discernământ):** a înțeles corect fluxul? A inventat vreo coloană/tabel? Header-ul e chiar în formatul nostru? → corectează în dialog.

## Exercițiul B — Găsește probleme & optimizează (30')
**Competențe: Discernământ + Diligență.** Aici înveți să NU ai încredere oarbă.

**Prompt de pornit:**
```
Fă un code review pe procedura de mai jos, în ordinea echipei: corectitudine → securitate → performanță → stil.
Verifică explicit regulile noastre:
- fără SELECT * (coloane explicite)
- SET NOCOUNT ON prezent; SET XACT_ABORT ON pentru tranzacții
- TRY/CATCH cu logare în logs.ProcError (RunId)
- fără cursoare dacă se poate set-based
- tranzacții scurte; obiecte schema-qualified ([schema].[obiect])
- fără conversii implicite în JOIN/WHERE

Listează problemele pe priorități P0/P1/P2 și propune varianta corectată.
NU-mi da recomandări de index fără să-mi spui pe baza a ce le faci (plan de execuție, DMV).

Procedura:
<lipești aici>
```

**Opțional (nivel mid/senior):** dă-i și output-ul de la query-ul „top queries by CPU” din pattern-urile noastre, sau planul de execuție, și cere ipoteze de optimizare.

> **Momentul-cheie al sesiunii:** sugestiile de index sunt **puncte de plecare, nu comenzi**. Se verifică față de indecșii existenți și se testează în DEV. Claude e junior-ul rapid; tu ești cel care semnează.

## Exercițiul C — Podul spre full-stack: de la un SELECT la un endpoint (30')
**Competențe: Delegare + Descriere.** Primul pas concret spre full-stack.

Luăm ceva ce știm (o interogare pe stoc) și îl ducem până la un mic API — exact drumul pe care îl facem ca echipă.

**Prompt de pornit:**
```
Am tabelul [trans].[WarehouseStock] (coloane relevante: <enumeră câteva, ex: ProductCode, Quantity, ReservationsSto, WarehouseId, UpdatedAt>).
Vreau să expun stocul disponibil pentru un ProductCode printr-un mic API read-only.

1) Scrie o procedură parametrizată [dbo].[WarehouseStock_GetByProduct] în standardul nostru
   (header complet, SET NOCOUNT ON, fără SELECT *, TRY/CATCH cu logare, coloane explicite).
   Disponibil = Quantity - ISNULL(ReservationsSto, 0).
2) Scrie un endpoint minimal care apelează procedura și întoarce JSON, în <FastAPI / .NET minimal API>.
   Ține-l scurt (sub ~40 de linii) și explică-mi fiecare parte, ca cineva care vine din SQL.

Nu presupune nimic ce nu ți-am zis; dacă îți lipsește o informație, întreabă-mă întâi.
```

> **Stack — deschis, la alegere.** Ambele variante sunt valide: **.NET minimal API** (natural, fiind pe stack Microsoft) sau **Python / FastAPI** (mai aproape de zona AI). Fiecare alege limbajul spre care vrea să meargă — sau, dacă are timp, cere-i lui Claude *ambele variante* și compară-le (exercițiu excelent de „delegare + descriere”). Înlocuiește `<FastAPI / .NET minimal API>` din prompt cu ce ai ales.

**De transmis:** nu mai scriem doar T-SQL. Cu Claude, drumul de la un `SELECT` la un endpoint funcțional e de câteva minute — dar procedura tot trebuie să treacă prin standardele și code review-ul nostru.

---

# Harta ecosistemului Claude — unde mergem de aici (~10 min)

Azi ai lucrat în Claude Code și ai văzut un **Skill** în acțiune. Astea sunt cele **patru cărămizi** pe care se construiește tot restul. Azi le vezi doar pe hartă — mergem în adâncime în sesiunile următoare. Le legăm de munca noastră, nu de teorie.

### 1. Skills — regulile noastre, aplicate automat  ✅ *deja le aveți*
Un fișier `SKILL.md` care spune lui Claude **cum lucrăm** (header, logging cu `RunId`, ce e interzis). Îl chemi cu `/nume` sau îl folosește singur.
**Pentru noi:** `sql-enterprise` e deja skill-ul echipei. Pasul următor: fiecare își scrie skill-uri mici pentru task-uri repetitive (ex: „scrie o procedură de sync în standardul nostru”).

### 2. MCP — Claude conectat la sistemele noastre
MCP (Model Context Protocol) e „portul USB-C” prin care Claude vorbește cu unelte externe — baza de date, Jira, Confluence — **fără copy-paste**. Îl gestionezi cu `/mcp`.
**Pentru noi, concret:**
- **SQL Server:** MCP-ul **oficial Microsoft** (*SQL MCP Server*, pe Data API builder) — expune tabele, view-uri și **proceduri stocate** ca unelte sigure. Construit intenționat să **NU** lase modelul să genereze SQL liber pe date critice: determinist și controlat. Fix pentru cultura noastră „correctness first”.
- **Jira / Confluence:** MCP-ul **oficial Atlassian** (dacă sunteți pe Cloud) sau varianta comunitară `sooperset/mcp-atlassian` (pentru **Server / Data Center** on-prem, în spatele VPN-ului). Claude poate citi un tichet, sumariza un sprint sau scrie o pagină de documentație.

> ⚠️ **Regula de aur MCP:** un MCP acționează cu **permisiunile tale**. Îl pornim pe **DEV / read-only** întâi, cu un user cu drepturi minime. Nu conectăm nimic care poate modifica date direct pe `BufferSap` PROD fără discuție în echipă. Se aplică toate regulile din Anexa 2.

### 3. Agents (subagenți) — deleghezi fluxuri, nu doar întrebări
Un agent e un asistent specializat căruia îi dai o sarcină pe **mai mulți pași**; lucrează (chiar în paralel cu alți agenți) și îți întoarce un rezumat, fără să-ți umple contextul. Îi gestionezi cu `/agents`.
**Pentru noi:** un subagent „reviewer” care verifică orice procedură nouă după standardele noastre; altul care scrie documentația. E fix bucla 4D: delegare + verificare.

### 4. Plugins — setup-ul echipei, într-un singur pachet
Un plugin **împachetează** skill-uri + comenzi + agenți + configurări MCP într-un pachet pe care-l instalezi cu o comandă și îl distribui întregii echipe (`/plugin`). „Standardul echipei, la cheie.”
**Pentru noi:** un plugin intern „bufferSap-dev” care aduce dintr-o mișcare skill-ul `sql-enterprise`, agenții de review/documentare și conexiunile MCP — ca orice coleg nou să fie productiv din prima zi.

**Ordinea în care le adoptăm** (de la ce ai deja, spre avansat): **Skills → MCP → Agents → Plugins.** Detaliile, în sesiunile următoare (vezi schița de mai jos).

---

# PARTEA 3 — Schimb de practici (~20 min)

Fiecare, pe rând (2 minute): **un lucru care a mers, un lucru care NU a mers.** Se notează într-un doc partajat **„AI Wins & Fails”** (Confluence sau un doc comun). Fără judecată — și eșecurile sunt aur, arată unde greșește AI-ul și unde trebuie noi mai atenți.

Întrebări de ghidat discuția:
- Unde te-a ajutat cel mai mult? Unde ai pierdut timp?
- A inventat ceva? Cum ți-ai dat seama?
- Ce prompt a funcționat surprinzător de bine? (îl salvăm pentru toți)

---

# Artefacte — ce rămâne cu tine

1. **Cheat card personal** (Anexa 1) — comenzile + 2-3 prompturi care ți-au mers azi.
2. **O procedură reală** documentată sau revizuită, gata de pus în Confluence / de dat la review.
3. **Docul „AI Wins & Fails”** al echipei — pornit azi, completat la fiecare sesiune.

---

# Sesiunile următoare (propunere de secvențiere)

Fiecare cărămidă din hartă devine o sesiune, în ordinea în care ne folosește. E o *propunere* — se așază peste programul de 10 săptămâni, nu îl înlocuiește.

| Sesiune | Tema | Ce construim concret |
|---------|------|----------------------|
| **S2** | Context engineering + **Skills** | fiecare își scrie primul skill pentru un task repetitiv al lui |
| **S3** | **MCP** — Claude conectat la datele noastre | conectăm MCP-ul SQL Server pe **DEV / read-only** + Jira/Confluence |
| **S4** | **Agenți & subagenți** | un agent de code-review pe standardele echipei |
| **S5** | **Plugins** | împachetăm setup-ul echipei într-un plugin intern „bufferSap-dev” |

Restul temelor din programul original (evaluarea output-ului, cost/latență, securitate & GDPR aprofundat, playbook-ul de echipă) rămân valabile — le reașezăm după S5, când grupul stăpânește deja ecosistemul.

---

# Anexa 1 — Cheat card (de printat / lipit)

**Comenzi (Claude Code):**
```
claude            pornește sesiunea în folderul curent
/init             creează CLAUDE.md (memoria proiectului) — o dată
/help             listează comenzile
@fisier.sql       aduce un fișier în context (în loc de copy-paste)
/clear            context curat pentru un task nou
/compact          comprimă istoricul când sesiunea e lungă
/model            schimbă modelul (greu vs. rapid)
/review           code review pe modificări
/                 (scrie doar „/") vezi toate comenzile disponibile
```

**Prompturi de bază, reutilizabile:**
- *Explică:* „Explică-mi în română, pe scurt, ce face codul de mai jos și în ce flux se încadrează.”
- *Review:* „Fă code review după standardele echipei (corectitudine → securitate → performanță → stil), pe priorități P0/P1/P2.”
- *Documentează:* „Generează header-ul standard și o schiță de pagină Confluence pentru procedura de mai jos.”
- *Verifică-te:* „Ce presupuneri ai făcut? Ce ar putea fi greșit în ce mi-ai dat?”

**Regula de aur:** tu delegi, tu descrii, tu verifici, tu semnezi. Testează în DEV → UAT → PROD.

---

# Anexa 2 — Ce NU trimiți niciodată către Claude (data safety & GDPR)

Suntem în distribuție farma. Tratăm asta serios de la prima zi (e și subiectul unei sesiuni viitoare dedicate).

**NU trimiți niciodată:**
- Date reale de clienți / pacienți / parteneri (nume, coduri, adrese, comenzi reale).
- Connection strings, parole, chei API, token-uri.
- Dump-uri de date de PROD.
- Nume de utilizatori + informații care, combinate, identifică persoane.

**Ce faci în schimb:**
- Lucrezi pe obiecte din **DEV**, cu date de test / anonimizate.
- Înlocuiești valorile reale cu exemple (`ProductCode = 'TEST123'`).
- Pentru scheme și proceduri e ok — structura codului nu e dată sensibilă. **Datele din tabele sunt.**

> Când folosim un tool extern (inclusiv NotebookLM, care e cloud Google), verificăm întâi ce conține materialul. Acest suport are nume interne de obiecte/server/echipă, dar **nu** conține credențiale sau date de clienți.

---

# Note de facilitare (doar pentru Ionut)

**Timp:**
- Ține tutorialul sub 60'. Tentația e să vorbești mult — nu. Valoarea reală e în cele 90' de lucru aplicat.
- **Harta ecosistemului (skills/MCP/agenți/plugins) e ~10' și e o închidere „unde mergem”, nu o predare în adâncime.** Dacă rămâi fără timp, taie-o la un teaser de 5' sau trimite-o pe mail după — nu sacrifica lucrul aplicat sau schimbul pentru ea.
- Rezervă ultimele 20' strict pentru schimb. Nu le sacrifica „ca să terminăm materia”.

**Pacing pe echipă (mixtă):**
- Împerechează juniorii cu seniorii pentru partea aplicată: **Jan → Adriana**, **Irina → Marieta**. Alexandru și Otilia (mid) pot lucra independent și ajuta.
- Seniorii vor termina Exercițiul A repede — dă-le direct B și C mai în profunzime (planuri de execuție reale, endpoint mai complet).

**Capcane de urmărit:**
- **Încredere oarbă** — cea mai frecventă. Când cineva zice „mi-a dat soluția”, întreabă „ai verificat? respectă regulile noastre?”. Fă din discernământ un reflex de la sesiunea 1.
- **Date sensibile lipite din reflex** — oprește imediat și reamintește Anexa 2. Non-negociabil.
- **Prompt vag → rezultat prost** — arată cum reformulezi (context + standard + ce format vrei).

**Setup înainte:**
- **Trimite prerechizitele cu o zi înainte** și cere confirmare că fiecare a rulat cu succes `claude --version` și s-a logat. Cea mai mare pierdere de timp la o primă sesiune e instalarea live — nu o lăsa pe ziua cursului.
- Verifică din timp că `CLAUDE.md` / skill-ul `sql-enterprise` sunt disponibile în repo-ul pe care lucrați, ca demonstrația „Claude știe standardele noastre” (1.4) să iasă bine.
- Pregătește tu 1-2 exemple „before/after” dinainte, ca backup dacă demonstrația live se blochează.
- Ai la îndemână o soluție de rezervă pentru cine, totuși, nu a reușit instalarea: poate lucra din `claude.ai` (browser) pentru exercițiile A și B, chiar dacă ratează partea de comenzi.

**După sesiune:**
- Trece un mic review de 2 min: ce a mers, ce ajustăm pentru sesiunea 2.
- Confirmă secvențierea din „Sesiunile următoare” (S2 skills → S3 MCP → S4 agenți → S5 plugins) sau ajusteaz-o cu grupul — decurge natural din harta de azi.
