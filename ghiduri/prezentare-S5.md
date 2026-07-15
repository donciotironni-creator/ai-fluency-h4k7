<!--
Prezentare S5 — Hooks
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

# S5 — Hooks
## Reguli deterministe, nu speranțe

Faza 2 · Extensii proprii · ~3h

*Programul de joi — AI Fluency pe Claude Code*

---

## De unde venim → unde mergem

- **S4:** ai construit subagenți — muncă izolată, în context propriu.
- Dar tot ce ai făcut până acum (`CLAUDE.md`, skills, subagenți) depinde de faptul că **modelul decide** să urmeze instrucțiunea.
- De obicei o face. Uneori uită, interpretează greșit, sare peste.
- **S5:** hook-uri — scripturi legate de evenimente, care rulează **de fiecare dată**, indiferent de decizia modelului.

---

## Firul: de la „sper" la „garantez"

| | Ce e | Cum funcționează |
|---|------|------------------|
| `CLAUDE.md`, skills, subagenți | speranță calificată | modelul citește, de obicei respectă |
| **Hook** | determinism | codul rulează la eveniment, orice ar fi |

> „Un hook nu halucinează."

Premisa vine din prep-ul S4: o regulă pe care o vrei mereu, dar Claude uneori o ratează.

---

## Compromisul

- Hook-urile sunt **rigide** — cod pe care-l scrii și-l întreții, rulează orbește.
- Un hook prost blochează munca legitimă.
- Deci **nu** pui totul în hook-uri.
- Pui **cele câteva reguli care chiar trebuie să țină întotdeauna**. Restul rămâne instrucțiune.

> Criteriul: trebuie determinist → hook. Preferință pe care modelul o respectă → instrucțiune.

---

## Evenimentele care contează

| Eveniment | Când | Blochează? | Bun pentru |
|-----------|------|:---------:|------------|
| `PreToolUse` | înainte de o unealtă | **Da** | guardrails |
| `PostToolUse` | după o unealtă | Nu | formatare, lint |
| `UserPromptSubmit` | la fiecare prompt | Da | injectează context |
| `SessionStart` | la start/reluare | Nu | încarcă stare |
| `Stop` / `SubagentStop` | când termină | Da | „nu opri până..." |
| `PreCompact` | înainte de compactare | Da | păstrează context |

> `matcher`-ul filtrează *ce* declanșează — pentru unelte, e numele uneltei.

---

## Cum se configurează — `settings.json`

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          { "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/format.sh" }
        ]
      }
    ]
  }
}
```

Trei niveluri: **eveniment → `matcher` → listă de handlere**.

---

## Unde trăiesc hook-urile

| Locație | Cale | Se aplică la |
|---------|------|--------------|
| Personal | `~/.claude/settings.json` | toate proiectele tale |
| Proiect (comis) | `.claude/settings.json` | acest repo — **regula echipei** |
| Proiect (local) | `.claude/settings.local.json` | acest repo — doar al tău |
| Managed | settings administrate | impus de organizație |

> Regulă de echipă → comisă. Hook personal (notificare) → local.

---

## Ce primește un hook

JSON pe stdin:

```json
{
  "hook_event_name": "PreToolUse",
  "cwd": "/cale/proiect",
  "tool_input": { "command": "git push --force" }
}
```

Hook-ul citește asta, decide, și controlează prin **codul de ieșire**.

---

## Control: codurile de ieșire

| Cod | Înseamnă |
|-----|----------|
| **0** | Succes. |
| **2** | **Blocant.** `PreToolUse` blochează unealta; `Stop` împiedică oprirea. **stderr → Claude.** |
| altceva | Eroare ne-blocantă; execuția continuă. |

> Alternativ: JSON structurat pe stdout (`decision`, `permissionDecision`, `additionalContext`).

---

## Validatorul canonic

```bash
#!/bin/bash
COMMAND=$(jq -r '.tool_input.command' < /dev/stdin)

if echo "$COMMAND" | grep -qE '\b(DROP TABLE|TRUNCATE|rm -rf)\b'; then
  echo "Blocat de politica echipei: comandă distructivă." >&2
  exit 2   # blochează unealta; mesajul merge la Claude
fi
exit 0
```

> `PreToolUse` pe `Bash`. Oprește acțiunea **înainte** să se întâmple — indiferent ce a decis modelul. Contrast cu S1: acolo **tu** aprobai; aici scriptul refuză determinist.

---

## Cazuri reale — echipa SQL→full-stack

| Regulă | Hook |
|--------|------|
| Nu comite CNP / connection string | `PreToolUse` pe `Write\|Edit` → `exit 2` |
| Nu `DROP TABLE` / `DELETE` fără `WHERE` | `PreToolUse` pe `Bash` |
| Formatează după edit | `PostToolUse` pe `Edit\|Write` |
| Log de audit | `PostToolUse` pe `*` |
| Notificare la task lung | `Stop` |
| Injectează branch/ticket la start | `SessionStart` |

---

## ⚠️ Suprafață de securitate

1. Hook-urile rulează **automat**, cu privilegiile shell-ului tău. Un hook dintr-un repo străin poate rula orice — **citește-l** înainte să te încrezi.
2. Hook-urile sunt **fail-open**: dacă scriptul crapă, acțiunea **trece**.

> Deci hook ≠ graniță de securitate dură. Pentru interdicții care trebuie să țină → **permisiuni** (S1), autoritatea. Hook-ul e plasă, nu zid.

---

## Cum verifici că merge

Un hook contează dacă (a) se declanșează și (b) face ce voiai:

1. **Se declanșează?** → provoacă evenimentul (fă un edit / încearcă comanda interzisă), confirmă cu `/hooks` sau efectul vizibil.
2. **Face ce trebuie?** → blochează? formatează? injectează contextul?

---

## Când NU faci hook

- Preferință pe care modelul o respectă bine → `CLAUDE.md`, nu cod de întreținut.
- Interdicție hard de securitate → **permisiuni** (S1), nu hook (fail-open).
- „Uneori da, uneori nu, depinde" → judecată, nu determinism.

---

## Lucru aplicat (~70–85 min)

1. Alege regula (prep-ul S4).
2. Testul hook/instrucțiune — chiar trebuie determinist?
3. Generează hook-ul cu Claude (eveniment corect).
4. **Citește scriptul** înainte să accepți — cel mai important review din program.
5. **Dovada** declanșare/efect.
6. Comite hook-ul de proiect (dacă e regulă de echipă).

---

## Capcane comune

- **Hook = permisiune.** → nu; hook e fail-open, permisiunea e autoritatea.
- **`exit 1` ca să blochezi.** → doar `2` blochează.
- **Matcher `*` cu script scump.** → încetinește totul.
- **Comis vs. local greșit.** → regula de echipă nu ajunge la nimeni / hook personal impus tuturor.
- **Încredere oarbă într-un hook străin.** → rulează cu privilegiile tale.
- **„Un hook rezolvă tot."** → doar regulile critice.

---

## Cu ce pleci — checklist

- [ ] Cel puțin un hook funcțional în `.claude/settings.json`, **comis** (dacă e regulă de echipă).
- [ ] Evenimentul corect (blochezi → `PreToolUse`; reacționezi → `PostToolUse`).
- [ ] Scriptul **citit** linie cu linie înainte de accept.
- [ ] Cod de ieșire corect (`2` ca să blocheze).
- [ ] **Dovada** declanșare + efect.

---

## Prep pentru S6

- Notează **un sistem extern la care ai vrea ca Claude să ajungă**: baza de date, un API intern, Jira, GitHub, Slack.
- Până acum totul a lucrat cu uneltele proprii ale Claude Code, în interior.
- În S6 deschidem ușa spre exterior: **MCP** — servere care conectează Claude la sisteme reale.
- Notează ce ai conecta primul — și dacă l-ai lăsa doar să citească, sau și să scrie.

---

# Întrebări?

Următorul pas: **S6 — MCP**
