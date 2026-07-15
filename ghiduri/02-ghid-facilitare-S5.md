# Claude Code Fluency — Ghid de facilitare · S5

*Publicul: echipă senior, cu fundamentele AI deja acoperite. Formatul de joi: tutorial → lucru aplicat → schimb de practici.*

> **Notă:** Claude Code publică des. Numele exacte (evenimente, câmpuri JSON, coduri de ieșire) se pot schimba de la o lună la alta. La începutul fiecărei sesiuni rulează `/help` și verifică docul oficial (`code.claude.com/docs/en/hooks`). Acest ghid predă principii care rezistă, nu sintaxă care se schimbă săptămânal. **Verificat pe docul oficial în iulie 2026** — două lucruri de reținut: (1) lista de evenimente e **mult mai mare** decât subsetul practic pe care-l predăm azi (există și `SessionEnd`, `SubagentStart/Stop`, `PostToolBatch`, `Notification` etc.) — dar cele 5–6 din segmentul 2 acoperă tot ce faci în prima lună; (2) hook-urile sunt **fail-open** și **nu** sunt o graniță de securitate dură — pentru interdicții hard folosești sistemul de permisiuni (S1), nu hook-uri.

---

## S5 — Hooks: reguli deterministe, nu speranțe

A doua sesiune din **Faza 2 — Extensii proprii**. În S4 ai construit subagenți; azi construiești **hook-uri**. Și aici e o schimbare de natură, nu de grad: tot ce ai făcut până acum — fapte în `CLAUDE.md`, proceduri în skills, instrucțiuni pentru subagenți — depinde de faptul că modelul **citește și decide** să le urmeze. De obicei o face. Uneori uită, interpretează greșit, sau sare peste sub presiune. Un hook nu decide nimic: e un script legat de un eveniment din ciclul de viață, care rulează **de fiecare dată**, indiferent ce „crede" modelul.

Premisa vine din prep-ul S4: fiecare a notat **o regulă pe care ar vrea ca Claude s-o respecte mereu, dar pe care uneori o ratează** — „formatează după edit", „nu comite un connection string", „nu atinge prod", „rulează testele înainte de commit". S5 transformă regula aia din *speranță* în *garanție*.

### Legătura cu tot programul — de la „sper" la „garantez"

Un singur fir leagă sesiunea:

- **`CLAUDE.md`, skills, subagenți** = *speranță calificată*. Pui instrucțiunea în context, modelul o vede, de obicei o respectă. Probabilistic.
- **Hook** = *determinism*. Codul rulează la eveniment, orice ar fi. Un `PreToolUse` care blochează `rm -rf` îl blochează **și** când modelul e convins că e sigur. „Un hook nu halucinează."

Compromisul (și e real): hook-urile sunt **rigide**. Sunt cod pe care-l scrii și-l întreții, rulează orbește, și un hook prost blochează munca legitimă. Deci nu pui totul în hook-uri — pui **cele câteva reguli care chiar trebuie să țină întotdeauna**. Restul rămâne instrucțiune (fapt/procedură).

### Obiective de învățare

La final, fiecare știe:
- Ce e un hook, concret: un handler (de obicei un script shell) legat de un **eveniment** din ciclul de viață Claude Code, configurat în `settings.json`.
- **Evenimentele care contează** pentru echipă: `PreToolUse` (înainte de o unealtă — poate **bloca**), `PostToolUse` (după — formatare, lint), `UserPromptSubmit` (injectează context la fiecare prompt), `SessionStart` (încarcă stare), `Stop`/`SubagentStop` (împiedică oprirea până se termină ceva).
- Cum se **configurează**: structura `hooks` → eveniment → `matcher` → listă de handlere, și cele trei locații (personal / proiect-comis / proiect-local).
- Ce **primește** un hook (JSON pe stdin: `tool_input`, `cwd`, `hook_event_name`...) și cum **controlează**: cod de ieșire `0` (ok), `2` (blochează, stderr merge la Claude), altceva (eroare ne-blocantă); sau JSON structurat.
- Cazuri reale pentru o echipă SQL→full-stack: guardrails (`DROP TABLE`, secrete), formatare automată, audit, notificări.
- De ce hook-urile **nu** sunt o graniță de securitate dură (fail-open) — și că pentru interdicții hard e sistemul de **permisiuni** (S1).
- Cum **verifică** empiric că un hook (a) se declanșează pe evenimentul corect și (b) face ce trebuie (blochează / formatează / injectează).

> **Notă de scop pentru facilitator:** miezul zilei e segmentul 4 (input & control prin coduri de ieșire — validatorul care blochează) plus segmentul 6 (regula din prep devine hook + dovada). Segmentul 5 (cazuri reale) e locul unde sesiunea „aterizează" în munca lor — leagă direct de regulile din `CLAUDE.md`-ul global al echipei (DROP TABLE, CNP, prod). Dacă timpul strânge, comprimă segmentul 2 (lista de evenimente devine referință, nu tur complet) și protejează 4 și 6. Capcana conceptuală de fixat bine: hook ≠ permisiune. Hook-ul e fail-open (dacă scriptul crapă, acțiunea trece); permisiunea e autoritatea.

### Structura zilei

| Bloc | Durată |
|------|--------|
| Tutorial | 90–110 min |
| Lucru aplicat | 70–85 min |
| Schimb de practici | 15–20 min |

---

### Tutorial (90–110 min)

Concret, cu demo pe repo-ul de nisip. Șase segmente.

#### 1. De ce hooks — de la speranță la determinism (10–15 min)

- **Punctul de plecare:** regula din prep-ul S4 — ceva ce vrei mereu, dar Claude uneori ratează. „Formatează după edit." „Nu comite secrete." „Rulează testele înainte de commit."
- **De ce contează:** o instrucțiune în `CLAUDE.md` e citită și *de obicei* respectată. Dar „de obicei" nu e bun pentru reguli care **trebuie** să țină — un secret comis o singură dată e deja în istoric. Un hook mută regula din stratul „modelul decide" în stratul „codul impune".
- **Criteriul (repetat toată ziua):** *dacă regula trebuie să țină întotdeauna, determinist → hook. Dacă e o preferință pe care modelul o urmează bine → rămâne instrucțiune (fapt/procedură).* Nu pui totul în hook-uri; pui cele câteva reguli critice.

**Demo:** arată contrastul. Pune în `CLAUDE.md` „rulează întotdeauna formatarea după edit" și arată că uneori Claude o face, alteori uită. Apoi anunță: „la finalul zilei, un `PostToolUse` o face **de fiecare dată**, fără să depindă de memoria modelului."

#### 2. Ciclul de viață: evenimentele (15–20 min)

Un hook se leagă de un **eveniment**. Sunt multe; astea sunt cele care-ți acoperă prima lună:

| Eveniment | Când se declanșează | Poate bloca? | Bun pentru |
|-----------|---------------------|:------------:|------------|
| `PreToolUse` | înainte ca o unealtă să ruleze | **Da** | guardrails: blochează comenzi/edituri periculoase |
| `PostToolUse` | după ce o unealtă a reușit | Nu | formatare automată, lint, verificări |
| `UserPromptSubmit` | la fiecare prompt al tău, înainte de procesare | Da | injectează context (branch, ticket, stare) |
| `SessionStart` | la începutul/reluarea sesiunii | Nu | încarcă stare de proiect în context |
| `Stop` / `SubagentStop` | când Claude / un subagent termină | Da | împiedică oprirea până se termină ceva (ex. testele) |
| `PreCompact` | înainte de compactarea contextului | Da | păstrează context important înainte de compactare |

- **`matcher`-ul** filtrează *ce* declanșează hook-ul. Pentru evenimentele de unelte, matcher-ul e **numele uneltei**: `Bash`, `Edit|Write`, sau un regex. Omis sau `*` = orice.
- **Fitilul din S4:** `SubagentStart`/`SubagentStop` sunt exact evenimentele de ciclu de viață al subagenților din S4 — poți rula un setup înainte și un cleanup după.

> Lista completă de evenimente e mult mai lungă (`SessionEnd`, `Notification`, `PostToolBatch`, `PermissionRequest`...). Nu le înveți pe toate azi — `/help` și docul le au când ai nevoie. Cele 6 de mai sus acoperă tot ce construiești în practică la început.

**Demo:** arată `/hooks` (listează hook-urile configurate) — probabil gol acum. Explică pe diagramă unde pică fiecare eveniment în ciclul unui turn: prompt → `UserPromptSubmit` → model → `PreToolUse` → unealtă → `PostToolUse` → ... → `Stop`.

#### 3. Cum se configurează — `settings.json` (20–25 min)

Hook-urile trăiesc în fișierele de settings, cu trei niveluri de imbricare: eveniment → `matcher` → listă de handlere.

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/format.sh"
          }
        ]
      }
    ]
  }
}
```

**Locațiile** (aceeași ierarhie ca la skills și `CLAUDE.md`):

| Locație | Cale | Se aplică la |
|---------|------|--------------|
| Personal | `~/.claude/settings.json` | toate proiectele tale |
| Proiect (comis) | `.claude/settings.json` | acest repo, **comis în git** — regula echipei |
| Proiect (local) | `.claude/settings.local.json` | acest repo, **gitignored** — doar al tău |
| Managed | settings administrate | impus de organizație, nu poate fi suprascris |

- **Decizia comis vs. local:** o regulă care trebuie să țină pentru **toată echipa** (guardrail pe prod, scanare secrete) merge în `.claude/settings.json`, comisă. Un hook personal (notificare pe Slack când termină) merge în `.local.json` sau în settings-ul personal.
- **Tipuri de handler:** `command` (script — cel mai folosit) e cel de azi. Mai există `http`, `prompt`, `agent`, `mcp_tool` — le menționezi, nu le predai.
- **`$CLAUDE_PROJECT_DIR`** — placeholder pentru rădăcina proiectului, ca scriptul să fie găsit indiferent de directorul curent.

**Demo:** adaugă live hook-ul de formatare de mai sus în `.claude/settings.json` pe LMS, cu un `format.sh` minimal. Fă un edit și arată că formatarea rulează automat, fără să o ceri.

#### 4. Input & control: coduri de ieșire și JSON (20–25 min)

Asta e miezul mecanic al zilei.

**Ce primește hook-ul:** un JSON pe stdin, cu tot ce trebuie ca să decidă:

```json
{
  "session_id": "...",
  "cwd": "/cale/proiect",
  "hook_event_name": "PreToolUse",
  "tool_input": { "command": "git push --force" }
}
```

**Cum controlează — prin codul de ieșire:**

| Cod | Înseamnă |
|-----|----------|
| **0** | Succes. Pentru majoritatea evenimentelor stdout merge în debug log. |
| **2** | **Eroare blocantă.** Efectul depinde de eveniment: `PreToolUse` **blochează** unealta, `Stop` împiedică oprirea, `UserPromptSubmit` respinge promptul. **stderr merge la Claude** ca feedback. |
| **altceva** | Eroare ne-blocantă. Se loghează, execuția continuă. |

Alternativ, hook-ul poate scoate **JSON structurat** pe stdout (cod 0) pentru control fin: `decision`, `permissionDecision: deny/allow/ask`, sau `additionalContext` (injectează text în atenția lui Claude).

**Exemplul canonic — validatorul de comenzi periculoase** (`PreToolUse` pe `Bash`):

```bash
#!/bin/bash
COMMAND=$(jq -r '.tool_input.command' < /dev/stdin)

if echo "$COMMAND" | grep -qE '\b(DROP TABLE|TRUNCATE|rm -rf)\b'; then
  echo "Blocat de politica echipei: comandă distructivă." >&2
  exit 2   # blochează unealta; mesajul merge la Claude
fi
exit 0
```

Ăsta e exact guardrail-ul care leagă S5 de regulile de siguranță ale echipei. Codul `2` oprește acțiunea **înainte** să se întâmple, indiferent ce a decis modelul.

**Demo:** pune validatorul de mai sus ca `PreToolUse` pe `Bash`, apoi cere-i lui Claude ceva ce conține `rm -rf` sau `DROP TABLE` și arată că e blocat, cu mesajul apărând în conversație. Contrast cu S1: acolo **tu** aprobai; aici scriptul refuză singur, determinist.

#### 5. Cazuri reale pentru echipa SQL→full-stack (15–20 min)

Aici sesiunea aterizează în munca lor. Mapare directă pe regulile din `CLAUDE.md`-ul global al echipei:

| Regulă (din munca reală) | Hook |
|--------------------------|------|
| Nu comite CNP / connection string / API key | `PreToolUse` pe `Write\|Edit` — scanează conținutul, `exit 2` dacă găsește |
| Nu rula `DROP TABLE` / `DELETE` fără `WHERE` | `PreToolUse` pe `Bash` — validatorul din segmentul 4 |
| Formatează după fiecare edit (dotnet format, prettier) | `PostToolUse` pe `Edit\|Write` |
| Log de audit al acțiunilor Claude | `PostToolUse` pe `*` — scrie într-un fișier |
| Notificare când termină un task lung | `Stop` — notify-send / webhook Slack |
| Încarcă branch-ul și ticket-ul curent la start | `SessionStart` sau `UserPromptSubmit` — `additionalContext` |

> ⚠️ **Suprafață de securitate — două lucruri.** (1) Hook-urile rulează **automat**, cu privilegiile shell-ului tău. Un hook dintr-un repo în care ai încredere scăzută poate rula orice — citește hook-urile de proiect înainte să te încrezi în repo (aceeași disciplină ca la skills în S3). (2) Hook-urile sunt **fail-open**: dacă scriptul crapă sau pattern-ul e prost, acțiunea **trece**. Deci un hook **nu** e o graniță de securitate dură — pentru interdicții care trebuie să țină cu adevărat, folosești sistemul de **permisiuni** (S1), care e autoritatea. Hook-ul e o plasă utilă, nu un zid.

**Demo:** ia scanerul de secrete (`PreToolUse` pe `Write|Edit`) și încearcă să scrii un fișier cu un connection string fals — arată blocarea. Apoi menționează explicit: „dacă vreți asta impus dur, la nivel de organizație, e managed permissions, nu un hook local."

#### 6. De la regulă la hook, generat cu Claude — și cum verifici (20–25 min)

Ținta zilei, concret: fiecare pleacă cu **cel puțin un hook funcțional, comis**, făcut din regula lui din prep.

Nu-l scriem manual — îi cerem lui Claude. Dar aici review-ul e **cel mai important din tot programul**: hook-ul rulează pe mașina ta, automat, cu privilegiile tale.

**Pasul 1 — generează hook-ul din regulă:**
> „Vreau o regulă care să țină mereu: [regula din prep]. Fă-mi un hook pentru asta — spune-mi ce eveniment (`PreToolUse`/`PostToolUse`/...), scrie scriptul, și dă-mi intrarea pentru `.claude/settings.json`. Arată-mi și scriptul, și config-ul înainte să le scrii."

**Pasul 2 — citește înainte să accepți (regula supremă):**
> Un hook e cod care rulează singur la fiecare eveniment. Citește scriptul linie cu linie. Ce comenzi rulează? Poate bloca ceva legitim? Are un `exit 2` acolo unde trebuie? Nu accepți un hook necitit — niciodată.

**Pasul 3 — dovada „declanșare + efect":**

Un hook contează doar dacă (a) se declanșează pe evenimentul corect și (b) face ce voiai. Se testează empiric:
1. **Se declanșează?** → provoacă evenimentul (fă un edit pentru `PostToolUse`, încearcă comanda interzisă pentru `PreToolUse`) și confirmă că hook-ul a rulat (`/hooks`, sau efectul vizibil).
2. **Face ce trebuie?** → guardrail: acțiunea interzisă e **blocată**? formatare: fișierul e **formatat**? injectare: contextul **apare**?

**Când NU faci hook** (la fel de important):
- Regula e o preferință pe care modelul o respectă bine → rămâne în `CLAUDE.md`, nu merită cod de întreținut.
- Vrei interdicție hard, de securitate → **permisiuni** (S1), nu hook (fail-open).
- Regula e „uneori da, uneori nu, depinde de context" → aia e judecată, nu determinism; nu se pune în hook.

**Demo:** rulează cei trei pași live pe LMS, pornind de la o regulă reală (formatare sau scanare secrete). Arată scriptul **înainte** de accept (nu aprobi orbește — și niciunde nu contează mai mult ca aici), apoi dovada: provoci evenimentul, confirmi efectul.

---

### Lucru aplicat (70–85 min)

**Brief:** fiecare iese cu cel puțin un hook funcțional, comis în git pe repo-ul LMS (din S0–S4), făcut din propria regulă din prep — și cu **dovada** că se declanșează și face ce trebuie.

1. **Alege regula** — cea din prep-ul S4 (o vrei mereu, Claude uneori o ratează). Dacă n-ai una bună, candidați siguri: formatare după edit (`PostToolUse`), scanare secrete (`PreToolUse` pe `Write|Edit`), blocare comenzi distructive (`PreToolUse` pe `Bash`).
2. **Testul hook/instrucțiune** — chiar trebuie determinist? Dacă e o preferință pe care modelul o respectă → rămâne în `CLAUDE.md`. Dacă vrei interdicție de securitate hard → e permisiune, nu hook.
3. **Generează hook-ul** — promptul de la segmentul 6, pasul 1. Alege evenimentul corect (blochezi → `PreToolUse`; reacționezi → `PostToolUse`).
4. **Citește scriptul înainte să accepți** — linie cu linie. E cod care rulează pe mașina ta, automat. Ăsta e cel mai important review din program.
5. **Dovada declanșare/efect** — provoacă evenimentul și confirmă: hook-ul a rulat? a făcut ce voiai (blocat / formatat / injectat)?
6. **Comite** hook-ul de proiect (`chore: add format-on-edit hook`), dacă e regulă de echipă. Hook-urile personale (settings personal / `.local.json`) **nu** se comit.

**Extensie (dacă ai terminat):** adaugă un al doilea hook complementar — dacă ai făcut formatare (`PostToolUse`), adaugă un guardrail (`PreToolUse`). Sau: fă un hook `SessionStart` care injectează branch-ul git curent în context și simte diferența la începutul sesiunii următoare.

### Artefact al sesiunii

Un artefact real, comis — nu notițe:
- Cel puțin un hook funcțional în `.claude/settings.json` (+ scriptul lui în `.claude/hooks/`) pe repo-ul LMS, cu **dovada** că se declanșează pe evenimentul corect și face ce trebuie.

### Schimb de practici (15–20 min)

Fiecare, ~2 min:
- Hook-ul făcut, din ce regulă a venit, pe ce eveniment, și dacă blochează sau reacționează.
- Un moment „aici s-a văzut diferența" — determinismul: a rulat de fiecare dată, spre deosebire de instrucțiunea din `CLAUDE.md` pe care modelul o rata uneori.

Se notează în docul „AI Wins & Fails", coloana „Candidat standard?" — de-aici alegeți, în Faza 3, ce hook-uri intră în setul de referință al echipei.

---

### Capcane comune (note pentru facilitator)

- **Hook confundat cu permisiune.** Cea mai importantă distincție a zilei. Hook-urile sunt **fail-open** — dacă scriptul crapă, acțiunea trece. Pentru interdicții de securitate dure → sistemul de permisiuni (S1). Hook-ul e plasă, nu zid.
- **Confuzia codurilor de ieșire.** `2` blochează (și stderr merge la Claude); orice alt cod ne-zero e doar eroare ne-blocantă, execuția continuă. Cine vrea să blocheze și pune `exit 1` se miră că acțiunea trece.
- **Matcher prea larg.** Un hook cu matcher `*` care rulează un script scump la **fiecare** unealtă încetinește totul. Țintește evenimentul și unealta.
- **Comis vs. local greșit.** O regulă de echipă pusă în `.local.json` (gitignored) nu ajunge la nimeni altcineva. Un hook personal pus în `.claude/settings.json` comis îl impune tuturor. Alege conștient.
- **Încredere oarbă într-un hook străin.** Un hook dintr-un repo rulează automat, cu privilegiile tale. Citește-l înainte să te încrezi în repo — exact ca skill-urile în S3.
- **Hook care atârnă.** Un script fără timeout care blochează = sesiune înghețată. Ai grijă la comenzi lente.
- **„Un hook rezolvă tot."** Nu. Hook-urile sunt pentru cele câteva reguli care trebuie să țină determinist. Restul rămâne instrucțiune. Prea multe hook-uri = fragilitate și lentoare.

### Prep pentru S6

Temă de 5 minute: fiecare notează **un sistem extern la care ar vrea ca Claude să ajungă** — baza de date a echipei, un API intern, Jira, GitHub, Slack. Până acum tot ce ai construit (fapte, proceduri, subagenți, hook-uri) lucrează cu uneltele proprii ale Claude Code, în interiorul lui. În S6 deschidem ușa spre exterior: **MCP** (Model Context Protocol) — servere care conectează Claude la sisteme reale. Notează ce ai conecta primul și ce l-ai lăsa să facă acolo (doar citire? și scriere?).
