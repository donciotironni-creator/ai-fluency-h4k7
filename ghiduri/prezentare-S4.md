<!--
Prezentare S4 — Subagents
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

# S4 — Subagents
## Munca grea, în context izolat

Faza 2 · Extensii proprii · ~3h

*Programul de joi — AI Fluency pe Claude Code*

---

## De unde venim → unde mergem

- **Faza 1 (S1–S3):** ai învățat să *folosești* Claude Code disciplinat — permisiuni, fapte, proceduri.
- **Faza 2 începe aici:** construiești **componente proprii** care schimbă cum lucrează unealta.
- **S4:** subagenți — rezolvă o problemă pe care ai simțit-o deja: **contextul principal se umple de gunoi**.
- Premisa vine din prep-ul S3: o sarcină pe care ai da-o lui Claude fără să-i poluezi contextul.

---

## Al doilea nivel de economie de context

- **S2–S3:** pui în context doar ce trebuie (fapte mereu, proceduri la cerere).
- **S4:** muți **munca zgomotoasă** în altă fereastră.
- Output de teste, 40 de fișiere căutate, un log de 2000 de linii — îți mănâncă contextul și nu-l mai atingi.
- Un subagent le procesează **în fereastra lui** și-ți întoarce doar **concluzia**.

> Fitilul din S3: `context: fork` rula deja un skill într-un subagent.

---

## Criteriul care ține sesiunea

| Ai nevoie de... | Unde |
|---|---|
| **proces, nu dump** (rulează testele, caută în tot repo-ul) | **subagent** |
| **dialog și context bogat** (iterații, depinde de conversație) | **conversația principală** |

> Regula de aur: subagentul merită când poți descrie ce **rezumat** vrei înapoi.

---

## Ce e un subagent

O sesiune Claude **separată**, cu:

- propria **fereastră de context** (proaspătă, goală);
- propriul **system prompt** (corpul fișierului);
- propriul set de **unelte** și permisiuni.

Face o muncă → întoarce **doar rezultatul**.

---

## Cei trei agenți built-in

| Agent | Unelte | Ce face |
|-------|--------|---------|
| `Explore` | read-only | căutare & analiză de cod |
| `Plan` | read-only | cercetare în plan mode |
| `general-purpose` | **toate** | task-uri multi-pas, explorare **+** acțiune |

- **Delegarea e automată** — pornește de la descrierea sarcinii tale. Nu tastezi nimic special.
- `Explore`/`Plan` sunt read-only prin construcție → nu pot strica nimic.

---

## Compromisul central: izolarea ascunde context

Un subagent pornește cu context **gol**. Nu vede conversația ta, fișierele citite, skills-urile invocate.

- **Beneficiul:** output-ul voluminos rămâne izolat; contextul tău nu se umflă.
- **Costul:** nu știe ce știi tu → dacă sarcina depinde de conversație, ori repeți în delegare, ori greșește.
- Rezultatul **reintră** la tine → un dump de 500 de linii n-a economisit nimic.

---

## Main vs. subagent vs. fork

| Folosește... | Când |
|--------------|------|
| **Conversația principală** | dialog, iterații, faze care împart context; schimbări mici; contează latența |
| **Subagent** | output voluminos; restricții de unelte; muncă auto-conținută → **rezumat** |
| **Fork** | context proaspăt **+** toată conversația — un side-task fără re-explicare |

---

## Cum definești un subagent propriu

```markdown
---
name: codebase-explorer
description: Cercetează cum e structurat un feature și întoarce o
  hartă a fișierelor și fluxului. Folosește la „unde/cum e implementat X".
tools: Read, Grep, Glob
model: haiku
---

Ești un explorator de cod. Urmărește fluxul, mapează layerele,
întoarce fișierele-cheie și punctele de intrare. Nu modifica nimic.
Întoarce o hartă concisă, nu dump-uri.
```

---

## Câmpurile de frontmatter

- **`name`** (obligatoriu) — identificator, litere mici + cratime.
- **`description`** (obligatoriu) — *când* deleagă Claude. **Interfața de delegare**, ca la skills.
- **`tools`** — allowlist. Cercetător → `Read, Grep, Glob` (nu poate strica).
- **`model`** — `haiku`/`sonnet`/`opus`/`fable`/`inherit` (default `inherit`); aici controlezi **costul**: cercetarea grea pe `haiku`.
- **Corpul** = system promptul. Doar asta primește subagentul.

---

## Unde trăiesc & siguranță

| Locație | Cale | Se aplică la |
|---------|------|--------------|
| Personal | `~/.claude/agents/` | toate proiectele tale |
| Proiect | `.claude/agents/` | acest repo (comis în git) |

> **Read-only by default.** Dă cercetătorilor unelte read-only; ține Edit/Write pe agentul principal, unde **tu** ai degetul pe trăgaci. Scriere doar când vrei conștient un muncitor autonom.

`/agents` nu mai deschide wizard — ceri lui Claude sau editezi `.claude/agents/`.

---

## Paralelism & înlănțuire

- **Paralel:** „mapează în paralel stratul de API (controllere) și stratul de frontend (Vue), cu subagenți separați."
- **În serie:** „găsește problemele cu code-reviewer, apoi repară-le cu optimizer."
- **Background by default** — rulează cât tu continui; permisiunile apar în sesiunea ta.

---

## ⚠️ Costul care anulează beneficiul

Fiecare subagent își întoarce rezultatul **în contextul tău**.

10 subagenți × 200 de linii = 2000 de linii la tine — exact ce voiai să eviți.

> Regula: subagenții întorc **rezumate**, nu dump-uri.

Paralelism susținut la scară → `agent teams`, altă unealtă.

**Preview S5:** `SubagentStop` e un eveniment pe care un **hook** îl poate prinde.

---

## Cum verifici că merge

A rula ≠ a fi util. Măsori două lucruri:

1. **A economisit context?** → contextul principal are doar rezumatul, nu munca brută (`/context`).
2. **Rezultatul e util?** → rezumatul chiar răspunde? Dacă nu → reglezi corpul sau uneltele.

> Dacă a întors un dump, reglează corpul: cere-i explicit un rezumat.

---

## Când NU faci subagent

- Task cu **dialog** și iterații → conversația principală (pornește gol, nu iterează cu tine).
- Îl faci o dată → cere-i lui Claude direct, fără fișier.
- `Explore` built-in face deja treaba → nu reinventa cutia.
- Ai nevoie de tot contextul conversației → **fork**, nu subagent nou.

---

## Lucru aplicat (~70–85 min)

1. Alege sarcina de cercetare (prep-ul S3).
2. Decide izolarea — poți descrie **rezumatul** vrut? Dacă nu → conversație principală.
3. Generează subagentul cu Claude (read-only, `model` potrivit).
4. Verifică **delegarea** (reglezi `description`).
5. **Dovada** de context (`/context` rămâne curat).
6. Comite subagentul de proiect.

---

## Capcane comune

- **Subagent pentru task de dialog.** → pornește gol; e task de conversație.
- **Subagent care întoarce un dump.** → cere-i un rezumat.
- **Scriere când read-only ajungea.** → firul de siguranță din S1.
- **`description` vag.** → nu e delegat când trebuie.
- **Reinventezi `Explore`.** → verifică built-in-ul întâi.
- **Mulți subagenți „ca să fie".** → context mai plin, nu mai gol.

---

## Cu ce pleci — checklist

- [ ] Cel puțin un subagent funcțional în `.claude/agents/`, **comis**.
- [ ] `description` care declanșează delegarea pe sarcina corectă.
- [ ] Unelte **read-only** (dacă e cercetător).
- [ ] `model` potrivit costului (`haiku` pentru cercetare grea).
- [ ] **Dovada** că păstrează contextul principal curat.

---

## Prep pentru S5

- Notează **o regulă pe care ai vrea ca Claude s-o respecte mereu, dar uneori o ratează**.
- Ex: „formatează după edit", „nu comite secrete", „nu atinge prod", „rulează testele înainte de commit".
- Fitilul de azi: `SubagentStop` — un eveniment prins de un **hook**.
- Până acum totul depinde de *decizia* modelului. În S5: **cod, nu speranță**.

---

# Întrebări?

Următorul pas: **S5 — Hooks**

---

<!-- APPENDIX — slide-uri de backup, doar dacă apar întrebări avansate. Nu fac parte din flux. -->

## Appendix · Câmpuri avansate de frontmatter

Dincolo de `name`/`description`/`tools`/`model`:

- **`disallowedTools`** — denylist (și pattern-uri MCP: `mcp__github`).
- **`skills`** — preîncarcă conținut de skills în subagent (inversul lui `context: fork`).
- **`memory: user|project|local`** — memorie persistentă între conversații.
- **`permissionMode`** — `plan`/`acceptEdits`/`dontAsk`/… (părintele pe `bypass`/`acceptEdits` câștigă).
- **`isolation: worktree`** — copie izolată a repo-ului, se curăță singură.
- **`hooks`** — `Stop` în frontmatter → devine `SubagentStop` (fitil S5).

---

## Appendix · Invocare explicită & alte fapte

- **Cum forțezi un subagent:** limbaj natural (Claude decide) · **@-mention** (garantat) · **`--agent <nume>`** (toată sesiunea).
- **Thoroughness la `Explore`:** `quick` / `medium` / `very thorough`.
- **Reluare:** `general-purpose`/custom se pot relua (`SendMessage`); `Explore`/`Plan` sunt one-shot.
- **Nested:** un subagent poate porni subagenți; doar rezumatul de la vârf revine la tine.
- **Securitate (S1/S9):** raportul fiecărui subagent e scanat înainte de a fi citit — defense-in-depth, nu înlocuiește restrângerea uneltelor.
- **Scară susținută:** `agent teams`, altă unealtă.
