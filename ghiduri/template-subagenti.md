# Template-uri de referință — subagenți de pornire

*Livrabilul de la finalul S4. Patru subagenți personali, cross-project, ca fiecare să plece cu unelte gata de folosit — nu de la zero.*

> **Cum se citesc.** Fiecare bloc de mai jos e gata de copy-paste într-un fișier `~/.claude/agents/<nume>.md`. Adaptează-l la munca ta — nu-l lăsa ca atare. Regula de siguranță din S1/S4 rămâne: subagenții de **cercetare** primesc unelte **read-only**; scrierea rămâne pe agentul principal, unde tu ai degetul pe trăgaci.

## Întâi: un subagent NU e un `AGENTS.md`

Numele seamănă, mecanismele n-au legătură — e capcana de terminologie de care ne-am lovit:

- **`AGENTS.md`** = fișier de **context** (geamănul open-standard al lui `CLAUDE.md`). Instrucțiuni/fapte, citite automat. Nu-l „rulezi". Claude Code citește `CLAUDE.md`, nu `AGENTS.md` — dacă un repo are deja `AGENTS.md`, îl aduci printr-un import `@AGENTS.md`. (Detalii în S2.)
- **Subagent** = un fișier `.claude/agents/<nume>.md` (proiect) sau `~/.claude/agents/<nume>.md` (personal). Un **lucrător** pe care Claude îl **deleagă**: face o muncă în context izolat și întoarce doar concluzia. Ăsta e „agentul pe care-l folosești". Despre el e vorba aici.

## Anatomia unui subagent

Un fișier Markdown = **frontmatter YAML** + **corp**:

- `name` (obligatoriu) — identificator, litere mici și cratime.
- `description` (obligatoriu) — *când* să delege Claude aici. E **interfața de delegare** (ca `description` la skills), nu documentație: cazul principal și cuvintele naturale, în față.
- `tools` (opțional) — allowlist de unelte. Omis = moștenește tot. Un cercetător: `Read, Grep, Glob`.
- `model` (opțional) — `haiku` / `sonnet` / `opus` / `inherit`. Aici controlezi **costul**.
- **Corpul** = system promptul subagentului. Doar asta primește, plus detalii de mediu.

## Harta rapidă: cei patru din starter-pack

| Subagent | Rol | Unelte | Model | Când îl chemi |
|----------|-----|--------|-------|---------------|
| `codebase-explorer` | mapează un feature/flux, read-only | `Read, Grep, Glob` | `haiku` | „unde/cum e implementat X" |
| `code-reviewer` | review corectitudine/securitate/convenții | `Read, Grep, Glob` | `sonnet` | după ce ai scris/modificat cod |
| `sql-reviewer` | review T-SQL (proceduri, interogări, migrări) | `Read, Grep, Glob` | `sonnet` | când atingi SQL |
| `test-runner` | rulează testele, întoarce doar ce pică | `Read, Grep, Glob, Bash` | `haiku` | verificare fără output voluminos |

Toți sunt **personali** (`~/.claude/agents/`) — merg pe toate proiectele tale (TimeOff, Filnet, Iris…). Dacă vrei unul specific unui repo, pune-l în `.claude/agents/` al proiectului și comite-l.

---

## 1. `codebase-explorer` — cercetare read-only

Mapează cum e structurat un feature fără să atingă nimic. Pe `haiku` (ieftin), unelte strict read-only. Întoarce o hartă, nu fișiere întregi — de-asta economisește context.

```markdown
---
name: codebase-explorer
description: Cercetează cum e structurat un feature în codebase și întoarce o hartă a fișierelor, fluxului și dependențelor. Folosește când cineva întreabă „unde/cum e implementat X" sau vrea harta unui modul, fără să modifice nimic.
tools: Read, Grep, Glob
model: haiku
---

Ești un explorator de cod. Când primești o sarcină:
- Urmărește fluxul prin fișiere, de la punctul de intrare la implementare.
- Mapează layerele (rută → handler/controller → serviciu → acces la date).
- Identifică dependențele și punctele de integrare.

Nu modifica nimic. Întoarce o hartă concisă: fișierele-cheie (cu cale:linie),
fluxul în câțiva pași, dependențele relevante. Rezumat, nu dump-uri — nu copia
fișiere întregi în răspuns.
```

**De ce așa:** read-only fiindcă un cercetător n-are ce strica; `haiku` fiindcă mapatul nu cere un model scump; corpul cere explicit un **rezumat**, altfel subagentul îți întoarce un dump și anulează economia de context.

---

## 2. `code-reviewer` — review pe modificări

Review general pe trei axe. Read-only; îi dai diff-ul în promptul de delegare. Raportează doar ce e sigur o problemă — fără zgomot.

```markdown
---
name: code-reviewer
description: Review pe modificările de cod pentru corectitudine, securitate și convenții. Folosește după ce ai scris sau modificat cod, sau când cineva cere un review pe un diff.
tools: Read, Grep, Glob
model: sonnet
---

Ești un reviewer de cod senior. Analizează modificările și dă feedback
concret, acționabil, pe trei axe:
- Corectitudine: bug-uri de logică, cazuri limită neacoperite, null / off-by-one.
- Securitate: input nevalidat, secrete hardcodate, injection, expuneri.
- Convenții: respectă stilul și regulile din CLAUDE.md al proiectului.

Prioritizează după severitate. Pentru fiecare problemă: unde e (fișier:linie),
de ce e o problemă, și fix-ul propus. Nu raporta nimic ce nu ești sigur că e o
problemă reală.
```

**De ce așa:** `sonnet` fiindcă review-ul cere raționament, nu doar căutare; read-only fiindcă reviewer-ul *semnalează*, nu repară (fix-ul îl decizi tu, pe agentul principal); „fără zgomot" fiindcă un reviewer care raportează și incertitudini devine ignorat.

---

## 3. `sql-reviewer` — review T-SQL (croit pe munca echipei)

Varianta SQL a reviewer-ului, pentru proceduri stocate, interogări, migrări, indexuri. Verifică și **siguranța pe date reale** — relevant direct pentru echipă.

```markdown
---
name: sql-reviewer
description: Review pe cod T-SQL — stored procs, interogări, migrări, indexuri — pentru corectitudine, performanță și standarde de echipă. Folosește când modifici SQL, o procedură stocată sau un script de migrare.
tools: Read, Grep, Glob
model: sonnet
---

Ești un reviewer SQL Server senior. Analizează codul T-SQL pe:
- Corectitudine: NULL handling, JOIN-uri care dublează rânduri, DELETE/UPDATE
  fără WHERE, tranzacții incomplete.
- Performanță: predicate ne-SARGable, scanări de tabel, indexuri lipsă, cursor
  unde un set-based ar merge.
- Siguranță pe date reale: semnalează orice DROP / TRUNCATE / DELETE în masă; nu
  propune modificări pe proceduri prod fără să marchezi explicit riscul.
- Standarde: convențiile de numire și de logging ale echipei.

Nu modifica nimic. Pentru fiecare observație: unde, de ce, și varianta corectată.
```

**De ce așa:** e `code-reviewer` specializat — separat fiindcă T-SQL are capcane proprii (SARGability, cursor vs. set-based, DELETE fără WHERE) pe care un reviewer generic le ratează. Adaptează secțiunea „Standarde" la convențiile voastre reale de numire și logging.

---

## 4. `test-runner` — rulează testele, întoarce doar ce pică

Cazul clasic de izolare a output-ului: rulează suita în fereastra lui și-ți întoarce doar testele picate. Singurul din pachet care are nevoie de `Bash`.

```markdown
---
name: test-runner
description: Rulează suita de teste și întoarce DOAR testele care pică, cu mesajul de eroare. Folosește când vrei să verifici testele fără să-ți umpli contextul cu tot output-ul.
tools: Read, Grep, Glob, Bash
model: haiku
---

Ești un runner de teste. Detectează comanda de test a proiectului din CLAUDE.md
sau din structura repo-ului (ex. `dotnet test`, `npm test`, `pytest`) și rulează-o.

Întoarce DOAR:
- Numărul de teste rulate / trecute / picate.
- Pentru fiecare test picat: numele, fișierul, mesajul de eroare (concis).

Nu întoarce output-ul testelor care trec. Dacă totul trece, spune doar atât.
Rezumat, nu log brut — asta e ideea unui subagent.
```

**De ce așa:** aici izolarea de context e tot rostul — un `dotnet test` verbose ți-ar umple fereastra; subagentul îl „mănâncă" în fereastra lui și-ți dă înapoi doar eșecurile. Are `Bash` fiindcă trebuie să ruleze comanda; e singura excepție de la read-only, și e conștientă.

---

## Cum îi instalezi

1. Creează folderul dacă nu există: `~/.claude/agents/` (personal) sau `.claude/agents/` (proiect, comis în git).
2. Pune fiecare bloc într-un fișier cu numele agentului: `codebase-explorer.md`, `code-reviewer.md`, etc.
3. Dacă folderul `agents/` n-a existat la pornirea sesiunii, **repornește** Claude Code o dată ca să-l detecteze.

> Alternativ, nu-i scrii de mână: îi ceri lui Claude „fă-mi un subagent în `.claude/agents/` care [rol], read-only, `model: haiku`; arată-mi fișierul înainte să-l scrii" — și **citești** ce a propus înainte să accepți (regula din S1/S3/S4: nu aprobi orbește).

## Cum verifici că merge (2 axe)

Un subagent contează doar dacă (a) e delegat când trebuie și (b) păstrează contextul principal curat:

1. **Delegarea** — cere ceva ce ar trebui să-l cheme. Dacă Claude nu deleagă, problema e aproape mereu `description`-ul (ca la skills), nu corpul.
2. **Contextul** — după ce rulează, verifică cu `/context` că în conversația principală a intrat **doar rezumatul**, nu munca brută (fișierele scanate, log-ul de teste). Dacă a întors un dump, reglează corpul: cere-i explicit un rezumat.

## Checklist

- [ ] Cel puțin unul din cei patru copiat în `~/.claude/agents/` și adaptat la munca ta.
- [ ] `description`-ul conține cuvintele pe care le-ai spune natural (ca să fie delegat corect).
- [ ] Cercetătorii au unelte **read-only**; doar `test-runner` are `Bash`, conștient.
- [ ] **Dovada:** l-ai chemat pe o sarcină reală și `/context` a rămas curat — un rezumat întors, nu un dump.
- [ ] (Opțional) Un subagent specific unui proiect pus în `.claude/agents/` al repo-ului și **comis**, ca să-l aibă toată echipa.
