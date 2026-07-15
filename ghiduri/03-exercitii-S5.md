# Proiectul-școală LMS — Exerciții · S5

*Pentru participanți. Continuarea proiectului LMS început în S0–S4.*

> **Regula de siguranță (cea mai importantă din program):** un hook e cod care rulează **automat**, pe mașina ta, cu privilegiile tale, la fiecare eveniment. Citește scriptul propus de Claude linie cu linie înainte să-l accepți — și citește hook-urile de proiect ale unui repo străin înainte să te încrezi în el. Un hook e fail-open: nu e o graniță de securitate dură. Pentru interdicții care trebuie să țină cu adevărat, e sistemul de permisiuni (S1), nu un hook.

---

## S5 — De la o regulă ratată la o garanție deterministă

În S4 ai izolat munca grea într-un subagent. Azi transformi **o regulă pe care o vrei mereu, dar Claude uneori o ratează** — cea din prep-ul S4 — dintr-o *speranță* (instrucțiune în `CLAUDE.md` pe care modelul o urmează probabilistic) într-o *garanție* (un hook care rulează determinist la un eveniment).

Criteriul care ține toată ziua: *trebuie să țină întotdeauna, determinist → hook; e o preferință pe care modelul o respectă bine → rămâne instrucțiune.*

Ținta zilei, concret: la final ai **cel puțin un hook funcțional, comis în git** pe repo-ul LMS, făcut din propria regulă — și ai **dovedit** că se declanșează pe evenimentul corect și face ce voiai. Cele șase exerciții urmează segmentele din tutorial.

---

### Exercițiul 1 — Alege regula & testul hook/instrucțiune (≈10 min)

**Antrenează:** criteriul determinism vs. instrucțiune (segmentele 1, 6).

Înainte să faci un hook, decide dacă merită unul. Nu tot ce vrei se pune într-un hook — unele lucruri sunt preferințe pe care modelul le respectă bine, altele sunt interdicții hard care aparțin de permisiuni.

**Ce faci:**
1. Ia regula din prep-ul S4 (o vrei mereu, Claude uneori o ratează). Dacă n-ai una bună, candidați siguri pe LMS: formatare după edit, scanare secrete înainte de scriere, blocare comenzi distructive.
2. Aplică testul pe trei căi:
   - Trebuie să țină **întotdeauna**, determinist? → hook.
   - E o preferință pe care modelul o respectă de obicei? → rămâne în `CLAUDE.md`, nu merită cod.
   - E o interdicție de **securitate** care trebuie să țină cu adevărat? → **permisiuni** (S1), nu hook (fail-open).
3. Dacă e hook: **blochezi** ceva (→ `PreToolUse`) sau **reacționezi** după (→ `PostToolUse`)?

**Reușit dacă:** ai o regulă-candidat și poți spune într-o frază de ce e treabă de hook (nu instrucțiune, nu permisiune) și pe ce eveniment.

---

### Exercițiul 2 — Harta evenimentelor pe un turn real (≈10 min)

**Antrenează:** ciclul de viață și evenimentele (segmentul 2).

Un hook se leagă de un eveniment. Ca să alegi corect, trebuie să știi unde pică fiecare în ciclul unui turn.

**Ce faci:**
1. Rulează `/hooks` pe LMS — vezi ce e configurat acum (probabil nimic).
2. Pentru regula ta din Ex. 1, plasează evenimentul pe firul unui turn:
   `prompt → UserPromptSubmit → model → PreToolUse → unealtă → PostToolUse → ... → Stop`
3. Confirmă alegerea: dacă vrei să **oprești** o acțiune înainte să se întâmple, e `PreToolUse` (poate bloca). Dacă vrei să **reacționezi** la ceva deja făcut (formatare), e `PostToolUse`.

**Reușit dacă:** poți arăta pe firul turnului unde pică evenimentul tău și de ce e cel corect pentru regula ta.

---

### Exercițiul 3 — Primul hook: formatare automată (`PostToolUse`) (≈15 min)

**Antrenează:** configurarea în `settings.json` + tipul `command` (segmentul 3).

Începe cu un hook care **reacționează**, nu blochează — mai puțin riscant, bun ca prim contact. Formatarea automată după edit e candidatul clasic.

**Ce faci:**
1. Cere-i lui Claude:
   > „Fă-mi un hook `PostToolUse` pe `Edit|Write` care rulează formatarea proiectului (prettier / dotnet format, ce se potrivește pe LMS). Scriptul în `.claude/hooks/`, config-ul în `.claude/settings.json`. Arată-mi ambele înainte să le scrii."
2. Citește structura config-ului: eveniment → `matcher: "Edit|Write"` → handler `type: command`. Verifică `$CLAUDE_PROJECT_DIR` în calea scriptului.
3. Fă un edit pe un fișier de pe LMS și confirmă că formatarea rulează automat, fără să o ceri.

**Model de referință** (config):
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

**Reușit dacă:** un edit declanșează formatarea automat, și înțelegi cele trei niveluri de imbricare (eveniment → matcher → handler).

---

### Exercițiul 4 — Un guardrail care blochează (`PreToolUse` + exit 2) (≈20 min)

**Antrenează:** input JSON + control prin coduri de ieșire (segmentul 4).

Aici e miezul: un hook care **oprește** o acțiune periculoasă înainte să se întâmple. Codul de ieșire `2` blochează unealta.

**Ce faci:**
1. Cere-i lui Claude un `PreToolUse` pe `Bash` care blochează comenzi distructive:
   > „Fă-mi un hook `PreToolUse` pe `Bash` care citește `tool_input.command` din JSON-ul de pe stdin și, dacă găsește `DROP TABLE`, `TRUNCATE` sau `rm -rf`, iese cu cod 2 și un mesaj pe stderr. Arată-mi scriptul înainte."
2. **Citește scriptul linie cu linie.** Confirmă: extrage corect comanda din JSON? pattern-ul e cel vrut? `exit 2` la match, `exit 0` altfel?
3. Cere-i lui Claude ceva ce conține o comandă interzisă (ex. un `rm -rf` pe un folder de test) și confirmă că e **blocat**, cu mesajul tău apărând în conversație.

**Model de referință** (script):
```bash
#!/bin/bash
COMMAND=$(jq -r '.tool_input.command' < /dev/stdin)

if echo "$COMMAND" | grep -qE '\b(DROP TABLE|TRUNCATE|rm -rf)\b'; then
  echo "Blocat de politica echipei: comandă distructivă." >&2
  exit 2
fi
exit 0
```

> ⚠️ **Coduri de ieșire:** doar `2` blochează (și stderr merge la Claude). `exit 1` sau alt cod ne-zero e doar eroare ne-blocantă — acțiunea **trece**. Cine vrea să blocheze cu `exit 1` se miră că nu merge.

**Reușit dacă:** o comandă interzisă e blocată determinist, iar tu ai citit scriptul înainte să-l accepți.

---

### Exercițiul 5 — Dovada: declanșare + efect (≈20 min)

**Antrenează:** verificarea empirică (segmentul 6).

Un hook contează doar dacă (a) se declanșează pe evenimentul corect și (b) face ce voiai. Se testează, nu se presupune — și, spre deosebire de o instrucțiune din `CLAUDE.md`, un hook trebuie să funcționeze **de fiecare dată**.

**Ce faci:**
1. **Declanșarea:** provoacă evenimentul hook-ului tău — fă un edit (`PostToolUse`), încearcă comanda interzisă (`PreToolUse`). Confirmă că a rulat (efect vizibil sau `/hooks`).
2. **Efectul:** guardrail → acțiunea e blocată? formatare → fișierul e formatat? injectare → contextul apare?
3. **Determinismul:** repetă de 2–3 ori. Contrast cu instrucțiunea din `CLAUDE.md` pe care modelul o rata uneori — hook-ul rulează la fel de fiecare dată. Ăsta e câștigul.

**Reușit dacă:** poți arăta că hook-ul se declanșează și face ce trebuie, repetabil — și poți numi diferența față de aceeași regulă lăsată ca instrucțiune.

---

### Exercițiul 6 (Capstone) — Comite & (opțional) al doilea hook (≈15 min)

**Antrenează:** decizia comis/local + forma finală (segmentele 3, 5, 6).

**Ce faci:**
1. Decide locația conștient: regulă de **echipă** (guardrail, formatare) → `.claude/settings.json`, **comisă**. Hook **personal** (notificare pe Slack) → settings personal sau `.claude/settings.local.json` (gitignored).
2. **Comite** hook-ul de proiect în git (`chore: add <nume> hook`) — și scriptul din `.claude/hooks/`.
3. Notează pentru schimbul de practici: din ce regulă a venit, pe ce eveniment, dacă blochează sau reacționează, și momentul „aici s-a văzut determinismul".

**Extensie (doar dacă ai terminat):** adaugă un al doilea hook complementar. Dacă ai făcut formatare (`PostToolUse`), adaugă un guardrail (`PreToolUse` scaner de secrete pe `Write|Edit`). Sau un `SessionStart` care injectează branch-ul git curent în context — și simte diferența la începutul sesiunii următoare.

**Reușit dacă:** ai cel puțin un hook comis, care se declanșează corect și are dovada declanșare/efect — iar oricine clonează repo-ul LMS moștenește regula din prima sesiune Claude Code.

---

## Artefact & schimb de practici

La finalul sesiunii, două lucruri concrete.

**1. Artefactul (deja produs în exerciții).** Nu mai scrii nimic separat — îl ai deja:
- Cel puțin un hook funcțional în `.claude/settings.json` (+ scriptul lui în `.claude/hooks/`) pe LMS, cu **dovada** că se declanșează pe evenimentul corect și face ce trebuie, comis în git.

**2. Schimbul de practici (15–20 min, ~2 min/persoană).** Pe rând, fiecare spune grupului:
- Hook-ul făcut, din ce regulă a venit, pe ce eveniment, și dacă blochează sau reacționează.
- Un moment „aici s-a văzut diferența" — determinismul: a rulat de fiecare dată, spre deosebire de instrucțiunea din `CLAUDE.md` pe care modelul o rata uneori.

Notați aceste puncte în docul partajat **„AI Wins & Fails"**. Coloana „Candidat standard?" e cea din care, în Faza 3, alegeți ce hook-uri intră în setul de referință al echipei.

---

### Notă pentru facilitator

- **Ex. 1 e scurt și decizional — nu-l sări.** E singurul care oprește oamenii să pună în hook-uri lucruri care sunt fie instrucțiuni (preferințe), fie permisiuni (securitate hard). Testul cu trei căi e lecția.
- **Miezul e Ex. 4 (guardrail-ul care blochează) și Ex. 5 (dovada).** Dacă timpul strânge, comprimă Ex. 3 (formatarea se vede repede) și Ex. 6 (extensia e opțională). Protejează Ex. 4 și 5.
- **Distincția supremă: hook ≠ permisiune.** Dacă cineva crede că un hook e o garanție de securitate, oprește-te. E fail-open — dacă scriptul crapă, acțiunea trece. Securitatea dură = permisiuni (S1).
- **Codul de ieșire.** Aproape sigur cineva pune `exit 1` ca să blocheze și se miră. Doar `2` blochează. Prinde-o la Ex. 4.
- **Review-ul scriptului nu e opțional.** Un hook rulează cod pe mașina ta, automat. Insistă că se citește linie cu linie înainte de accept — e cel mai important review din tot programul.
- **Comis vs. local.** Ca la S2–S4 — dacă o regulă de echipă ajunge în `.local.json` (gitignored), nu o are nimeni altcineva. Oprește-te pe distincție.
- Claude Code se schimbă des: un `/help` la începutul sesiunii pentru numele curente de evenimente și structura `settings.json`. Reține: lista de evenimente e mult mai mare decât subsetul de azi.
