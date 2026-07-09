<!--
Prezentare S3 — Slash commands & skills
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

# S3 — Slash commands & skills
## Promptul repetat devine unealtă

Faza 1 · Folosire disciplinată · ~3h

*Programul de joi — AI Fluency pe Claude Code*

---

## De unde venim → unde mergem

- **S2:** ai mutat **faptele** stabile ale repo-ului în `CLAUDE.md` — citite automat, la fiecare sesiune.
- Dar promptul pe care-l scrii manual, la fel, de 2-3 ori, tot în capul tău trăiește.
- **S3:** îl muți într-un **skill** — invocat cu `/nume`, sau declanșat singur de Claude, și încărcat doar la nevoie.
- Al doilea pas de **context engineering** din program.

---

## Distincția care ține toată sesiunea

| | Unde | Când se citește |
|---|------|-----------------|
| **Fapt** stabil | `CLAUDE.md` | la **fiecare** sesiune |
| **Procedură** repetată | un **skill** | doar când o folosești |

> „Stack-ul e React+Vite+TS" = fapt.
> „Când review-uiesc un diff, fac pașii ăștia" = procedură.

Momentul „mută-l într-un skill" promis în S2 — aici îl încasăm.

---

## Obiective

La final, fiecare știe:

- Ce e un skill: `SKILL.md` = frontmatter + corp.
- Că **command custom = skill** (s-au unificat).
- Forma minimă (un `.md`) vs. forma completă (folder).
- **Cine invocă**: tu, Claude, sau amândoi.
- Argumente + injectare de context (`!`cmd``).
- Cum **verifici** empiric că merge (înainte/după).

---

## Ce e un skill

Un folder cu un `SKILL.md`. Două părți:

- **Frontmatter YAML** (`---`) — metadatele. `description` spune **când** să-l folosească.
- **Corp Markdown** — instrucțiunile: **ce** să facă.

Numele comenzii (`/nume`) vine din **numele folderului**.

```
.claude/skills/summarize-changes/SKILL.md
```

---

## Command = Skill (schimbarea din 2026)

- `.claude/commands/review.md` și `.claude/skills/review/SKILL.md` produc **amândouă** `/review`.
- Fișierele vechi din `commands/` merg în continuare.
- Nu mai e „command **vs** skill".

**E forma minimă vs. forma completă a aceluiași lucru:**

| Forma minimă | Forma completă |
|--------------|----------------|
| Un `.md` | Folder cu `SKILL.md` + fișiere ajutătoare |
| `/commit`, `/review`, `/pr` | reference lung, scripturi, exemple |

Începe cu forma minimă. Folder **doar** când merită.

---

## Unde trăiesc skills-urile

| Locație | Cale | Se aplică la |
|---------|------|--------------|
| Personal | `~/.claude/skills/` | toate proiectele tale |
| Proiect | `.claude/skills/` | acest repo (comis în git) |
| Plugin | `<plugin>/skills/` | unde e activat pluginul |

Precedență: **enterprise > personal > proiect**.
Skill cu numele unuia built-in → îl suprascrie.

---

## Cine invocă — cea mai importantă decizie

Un skill are, implicit, **două uși**: tu (`/nume`) și Claude (automat).

`description` **nu e documentație — e interfața de auto-declanșare.**

- Stă **mereu** în context; corpul se încarcă doar la invocare.
- `description` prost = skill care nu pornește când trebuie.
- Regula: cazul principal **primul**, cuvintele naturale în el.

---

## Controlul invocării

| Frontmatter | Tu | Claude | Când |
|-------------|:--:|:------:|------|
| *(implicit)* | Da | Da | cunoștințe + acțiuni inofensive |
| `disable-model-invocation: true` | Da | **Nu** | `/commit`, `/deploy` — efecte laterale |
| `user-invocable: false` | **Nu** | Da | context de fundal, nu „comandă" |

> Acțiuni cu efecte → **user-only**. Nu vrei ca Claude să deployuiască pentru că „codul pare gata".

---

## Argumente

- `$ARGUMENTS` — tot textul de după nume. `/fix-issue 123` → `123`.
- **Poziționale, 0-based:** `$0` = primul, `$1` = al doilea.
- **Numite:** `arguments: [issue, branch]` → `$issue`, `$branch`.
- `argument-hint: [issue-number]` — autocomplete.

> ⚠️ **Capcană:** e **0-based**. `$0` e primul, nu `$1`. Tutorialele vechi zic greșit.

`/migrate SearchBar React Vue` → `$0`=SearchBar, `$1`=React, `$2`=Vue.

---

## Injectare de context — `!`comanda``

Rulează o comandă **înainte** ca skill-ul să ajungă la model. Locul e înlocuit cu output-ul.

```markdown
## Context PR
- Diff: !`gh pr diff`
- Fișiere: !`gh pr diff --name-only`
```

- E **preprocesare**, nu ceva ce execută Claude.
- Skill-ul ajunge „hrănit" cu starea reală, nu cu presupuneri.

---

## ⚠️ Suprafață de securitate

`!`...`` rulează **automat**, fără aprobare de fiecare dată.

Un skill dintr-un repo străin poate rula orice la deschidere.

Apărări:
- `allowed-tools` (proiect) intră în vigoare doar **după** dialogul de trust.
- `disableSkillShellExecution: true` oprește complet execuția.

> Citește un skill de proiect înainte să te încrezi în el — ca diff-ul de scaffold din S2.

---

## Fișiere ajutătoare (progressive disclosure)

```
my-skill/
├── SKILL.md      # overview (la invocare)
├── reference.md  # detalii — DOAR când SKILL.md trimite la ele
└── scripts/
    └── helper.py # executat, nu încărcat în context
```

- `SKILL.md` scurt (sub 500 linii).
- Reference-ul greu se încarcă doar la nevoie.
- Aceeași economie de context din S2.

---

## Pre-aprobarea uneltelor

```yaml
---
name: commit
disable-model-invocation: true
allowed-tools: Bash(git add *) Bash(git commit *)
---
```

- `allowed-tools` = folosește fără aprobare, cât e activ. **Nu restricționează.**
- `disallowed-tools` = scoate unelte din bazin.
- **Preview S4:** `context: fork` rulează skill-ul într-un subagent izolat.

---

## Cum verifici că merge

A se declanșa ≠ a face ce voiai. Măsori **două lucruri separat**:

1. **Se declanșează** când trebuie? → reglezi `description`.
2. **Produce** ce te aștepți? → reglezi corpul.

**Metoda:** 2-3 prompturi realiste, sesiune curată, **cu** vs. **fără** skill. Compară.

> Sesiunea curată contează — contextul de la scriere maschează golurile.

---

## Când NU faci skill

- E un **fapt**, nu o procedură → rămâne în `CLAUDE.md`.
- L-ai făcut o singură dată → doar un prompt, nu un fișier.
- Claude o face oricum bine → un skill ar adăuga doar zgomot.

---

## Lucru aplicat (~70–85 min)

1. Alege promptul repetat (prep-ul S2).
2. Generează skill-ul cu Claude (forma minimă).
3. Reglează `description` + `disable-model-invocation`.
4. Adaugă argumente / `!`cmd``.
5. **Dovada** înainte/după (sesiune curată).
6. Comite skill-ul de proiect.

---

## Capcane comune

- **„Command sau skill?"** → întrebarea greșită, sunt același `/nume`.
- **`$1` = primul.** → e 0-based, `$0` e primul.
- **`description` ca documentație.** → e interfața de declanșare.
- **Acțiune fără `disable-model-invocation`.** → risc.
- **Fapt împachetat ca skill.** → testul fapt/procedură.
- **Folder prematur.** → începe cu forma minimă.
- **„Gata" pentru că se declanșează.** → dovada înainte/după.

---

## Cu ce pleci — checklist

- [ ] Cel puțin un skill funcțional în `.claude/skills/`, **comis**.
- [ ] `description` care declanșează pe fraza naturală corectă.
- [ ] `disable-model-invocation` dacă are efecte laterale.
- [ ] Numerotare argumente **0-based** verificată.
- [ ] **Dovada** înainte/după pe un prompt concret.

---

## Prep pentru S4

- Notează o sarcină pe care ai da-o lui Claude **fără să-i poluezi contextul principal**.
- Ex: „unde e definită logica de X în tot codebase-ul?", o verificare paralelă, un fișier mare.
- Ai văzut fitilul azi: `context: fork` + `agent:`.
- În S4: **subagenți** dedicați, cu context propriu.

---

# Întrebări?

Următorul pas: **S4 — Subagents**
